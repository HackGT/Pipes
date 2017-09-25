import { Readable, Writable, Duplex, Transform, DuplexOptions } from 'stream';

const commonOptions: DuplexOptions = {
    objectMode: true
};

interface IPlugin {

}

export abstract class InputPlugin extends Readable implements IPlugin {
    constructor() {super(commonOptions);}

    public _read(size: number) {
        this.push(null);
    }
}

export abstract class OutputPlugin extends Duplex implements IPlugin {
    constructor() {super(commonOptions);}

    public abstract propagate(input): void

    public _write(chunk: any, encoding: string, callback: Function): void {
        this.push(chunk);
        this.propagate(chunk);
        callback();
    }

    public _read(size: number) { }
}

export abstract class TransformPlugin extends Transform implements IPlugin {
    constructor() {super(commonOptions);}

    public abstract propagate(input): any

    public _transform(chunk: any, encoding: string, callback: Function) {
        const val = this.propagate(chunk);
        if(val !== undefined) {
            this.push(val);
        }
        callback();
    }

}

export class Mapper extends Transform {
    constructor(private mapping: { [mapping: string]: string }) {
        super(commonOptions);
    }

    public _transform(chunk: any, encoding: string, callback: Function): void {
        const remapped: any = {};
        for (const key of Object.keys(chunk)) {
            if (this.mapping[key]) {
                remapped[this.mapping[key]] = chunk[key];
            }
            else {
                remapped[key] = chunk[key];
            }
        }
        this.push(remapped);
        callback();
    }
}

export class MultiPipe extends Writable {

}