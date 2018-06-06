export class Queue<T> {
	private queue: T[] = [];
	private offset = 0;

	get length(): number {
		return this.queue.length - this.offset;
	}

	constructor(items?: Iterable<T>) {
		if (!items) return;
		for (let item of items) {
			this.enqueue(item);
		}
	}

	public enqueue(item: T): void {
		this.queue.push(item);
	}

	public dequeue(): T | undefined {
		if (this.queue.length == 0) return undefined;

		// Store the item at the front of the queue
		let item = this.queue[this.offset];

		// Increment the offset and remove the free space if necessary
		if (++this.offset * 2 >= this.queue.length) {
			this.queue = this.queue.slice(this.offset);
			this.offset = 0;
		}
		return item;
	}

	public peek(): T | undefined {
		return this.queue.length > 0 ? this.queue[this.offset] : undefined;
	}
}
