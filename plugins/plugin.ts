import { Queue } from "../queue";

type Mapped<From, To> = {
	[P in keyof From]?: keyof To
}
type Listener<T> = (data: T[keyof T]) => Promise<void>;
type Receiver<In, P extends keyof In> = (data: In[P]) => Promise<void>;
enum State { Flowing, Paused, Errored };

export abstract class TransformPlugin<In extends object, Out extends object> {
	public abstract name: string;
	private originalName = this.name;
	public setName(name: string): void {
		if (!this.originalName) {
			this.originalName = this.name;
		}
		this.name = `${name} (${this.originalName})`;
	}
	public state: State = State.Paused;

	constructor(public readonly inputTopics: (keyof In)[], public readonly outputTopics: (keyof Out)[]) {}

	public async resume() {
		this.state = State.Flowing;
		while (this.writeBuffer.length > 0) {
			let item = this.writeBuffer.dequeue()!;
			await this.publish(item[0], item[1]);
		}
	}
	public pause() {
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
	public pipe<CIn extends object, COut extends object>(plugin: TransformPlugin<CIn, COut>, mapping: Mapped<Out, CIn>, autoResume = true): TransformPlugin<CIn, COut> {
		console.debug(`Piping: ${this.name} -> ${plugin.name}`);
		// Set up listeners for mapped outputs
		for (let [from, to] of Object.entries(mapping) as [keyof Out, keyof CIn][]) {
			if (!this.outputTopics.includes(from)) {
				console.warn(`From topic "${from}" is not an output topic on ${this.name}`);
			}
			if (!plugin.inputTopics.includes(to)) {
				console.warn(`To topic "${to}" is not an input topic on ${plugin.name}`);
			}
			this.addEventListener(from, async (data: any) => {
				plugin.receive(to, data);
			});
		}
		if (autoResume) {
			this.resume();
		}
		// For chaining
		return plugin;
	}
}

export abstract class InputPlugin<T extends object> extends TransformPlugin<{}, T> {
	// InputPlugins publish data and don't depend on any other plugin
	constructor(topics: (keyof T)[]) {
		super([], topics);
	}
}

export abstract class OutputPlugin<T extends object> extends TransformPlugin<T, T> {
	constructor(topics: (keyof T)[]) {
		super(topics, topics);
	}
	protected async receive<K extends keyof T>(topic: K, data: T[K]): Promise<void> {
		await super.receive(topic, data);
		// Pass received messages along for chaining purposes
		await this.publish(topic, data);
	}
}
