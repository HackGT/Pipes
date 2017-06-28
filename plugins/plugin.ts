import { Readable, Duplex, Transform, DuplexOptions } from "stream";

interface RootPlugin {
	name: string;
	verbs: string[];
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
	public abstract name: string;
	public abstract verbs: string[];
	public abstract outputs: string[];
	public abstract parseLanguage(verb: string, tokens: any[]): any;
	
	constructor() {
		super(commonOptions);
	}
}

export abstract class OutputPlugin extends Duplex implements RootPlugin {
	public abstract name: string;
	public abstract verbs: string[];
	public abstract inputs: string[];
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
	public abstract name: string;
	public abstract verbs: string[];
	public abstract inputs: string[];
	public abstract outputs: string[];
	public abstract parseLanguage(verb: string, tokens: any[]): any;

	constructor() {
		super(commonOptions);
	}
}

// export class ZipHelper extends Transform implements RootPlugin {
	
// }
