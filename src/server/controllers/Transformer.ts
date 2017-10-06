import { Transform } from 'stream';

import { commonOptions, pipeInput, pipeOutput } from './Node';

export abstract class TransformPlugin extends Transform {
    constructor() {super(commonOptions);}

    public abstract propagate(input: pipeInput): Promise<pipeOutput>

    public _transform(chunk: any, encoding: string, callback: Function) {
        const val = this.propagate(chunk);
        if(val !== undefined) {
            this.push(val);
        }
        callback();
    }

}