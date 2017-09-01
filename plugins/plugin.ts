import { Readable, Writable, Duplex, Transform, DuplexOptions } from "stream";

interface RootPlugin {
	parseLanguage(verb: string, tokens: any[]): any;
}

const commonOptions: DuplexOptions = {
	objectMode: true // Since will be passing objects around and not raw Buffers or strings
};

export const pipingWords: string[] = ["it", "that"];

export function nameOf<T, K extends keyof T>(_: T, key: K) {
    return key;
}

export abstract class InputPlugin extends Readable implements RootPlugin {
	public static readonly verbs: string[];
	public static readonly outputs: string[];
	public abstract parseLanguage(verb: string, tokens: any[]): any;
	
	constructor() {
		super(commonOptions);
	}
}

export abstract class OutputPlugin extends Duplex implements RootPlugin {
	public static readonly verbs: string[];
	public static readonly inputs: string[];
	public abstract parseLanguage(verb: string, tokens: any[]): any;

	constructor() {
		super(commonOptions);
	}

	// Automaticaly implement ability to directly pass input to output
	// NOTE: super._write() and super._read() must be called from child classes for this to work
	public _write(chunk: any, encoding: string, callback: Function): void {
		this.push(chunk);
		// callback() must be called by inheriting class
	}
	public _read(size: number) {

	}
}

export abstract class TransformPlugin extends Transform implements RootPlugin {
	public static readonly verbs: string[];
	public static readonly inputs: string[];
	public static readonly outputs: string[];
	public abstract parseLanguage(verb: string, tokens: any[]): any;

	constructor() {
		super(commonOptions);
	}
}

export class Mapper extends Transform {
	constructor(private mapping: { [mapping: string]: string }, private sourceNodeName: string) {
		super(commonOptions);
		this.sourceNodeName;
	}

	public _transform(chunk: any, encoding: string, callback: Function): void {
		let remapped: any = {};
		for (let key of Object.keys(chunk)) {
			if (this.mapping[key]) {
				remapped[this.mapping[key]] = chunk[key];
			}
			else {
				console.warn(`Remapping for key '${key}' wasn't found. Key will be dropped.`);
			}
		}
		this.push(remapped);
		callback();
	}
}

export class MultiPipe extends Writable {
	constructor(private outputs: (TransformPlugin | OutputPlugin)[]) {
		super(commonOptions);
	}

	public _write(chunk: any, encoding: string, callback: Function): void {
		for (let output of this.outputs) {
			output.write(chunk);
		}
		callback();
	}
}
