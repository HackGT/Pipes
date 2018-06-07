import { Queue } from "../queue";

type Mapped<From, To> = {
	[P in keyof From]?: keyof To
}
type Listener<T> = (data: T[keyof T]) => Promise<void>;
type Receiver<In, P extends keyof In> = (data: In[P]) => Promise<void>;
enum State { Flowing, Paused, Errored };

export abstract class TransformPlugin<In, Out> {
	public abstract name: string;
	public state: State = State.Paused;

	constructor(public readonly inputTopics: (keyof In)[], public readonly outputTopics: (keyof Out)[]) {}

	public resume(): void {
		this.state = State.Flowing;
		while (this.writeBuffer.length > 0) {
			let item = this.writeBuffer.dequeue()!;
			this.publish(item[0], item[1]);
		}
	}
	public pause(): void {
		this.state = State.Paused;
	}

	private outListeners: Map<keyof Out, Set<Listener<Out>>> = new Map();
	public addEventListener(topic: keyof Out, listener: Listener<Out>) {
		if (!this.outListeners.has(topic)) {
			this.outListeners.set(topic, new Set());
		}
		this.outListeners.get(topic)!.add(listener);
	}

	private writeBuffer = new Queue<[keyof Out, Out[keyof Out]]>();
	protected async publish(topic: keyof Out, data: Out[keyof Out]): Promise<void> {
		if (this.state !== State.Flowing) {
			this.writeBuffer.enqueue([topic, data]);
		}
		else {
			let executions: Promise<void>[] = [];
			let listeners = this.outListeners.get(topic);
			if (listeners) {
				listeners.forEach(listener => {
					executions.push(listener(data));
				});
			}
			await Promise.all(executions);
		}
	}

	private receivers: Map<keyof In, Set<Receiver<In, keyof In>>> = new Map();
	protected addReceiver<T extends keyof In>(topic: T, receiver: Receiver<In, T>) {
		if (!this.receivers.has(topic)) {
			this.receivers.set(topic, new Set());
		}
		this.receivers.get(topic)!.add(receiver);
	}
	private readBuffer = new Queue<[keyof In, In[keyof In]]>();
	private receiveState = State.Flowing;
	protected async receive(topic: keyof In, data: In[keyof In]): Promise<void> {
		// Dispatch to declared receivers
		if (this.receiveState !== State.Flowing) {
			this.readBuffer.enqueue([topic, data]);
		}
		else {
			this.receiveState = State.Paused;
			const dispatcher = async () => {
				let executions: Promise<void>[] = [];
				let receivers = this.receivers.get(topic);
				if (receivers) {
					receivers.forEach(receiver => {
						executions.push(receiver(data));
					});
				}
				await Promise.all(executions);
			}
			await dispatcher();
			// Handle any received messages that were given to us while we were busy
			while (this.readBuffer.length > 0) {
				[topic, data] = this.readBuffer.dequeue()!;
				await dispatcher();
			}
			this.receiveState = State.Flowing;
		}
	}

	// Sets up a pipe to another plugin; can be called multiple times
	public pipe<CIn, COut>(plugin: TransformPlugin<CIn, COut>, mapping: Mapped<Out, CIn>, autoResume = true): TransformPlugin<CIn, COut> {
		console.debug(`Piping: ${this.name} -> ${plugin.name}`);
		// Set up listeners for mapped outputs
		for (let [from, to] of Object.entries(mapping)) {
			this.addEventListener(from as keyof Out, async (data: any) => {
				plugin.receive(to as keyof CIn, data);
			});
		}
		if (autoResume) {
			this.resume();
		}
		// For chaining
		return plugin;
	}
}

export abstract class InputPlugin<T> extends TransformPlugin<{}, T> {
	// InputPlugins publish data and don't depend on any other plugin
	constructor(topics: (keyof T)[]) {
		super([], topics);
	}
}

export abstract class OutputPlugin<T> extends TransformPlugin<T, T> {
	constructor(topics: (keyof T)[]) {
		super(topics, topics);
	}
	protected async receive<K extends keyof T>(topic: K, data: T[K]): Promise<void> {
		await super.receive(topic, data);
		// Pass received messages along for chaining purposes
		await this.publish(topic, data);
	}
}
