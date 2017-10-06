import { Transform} from 'stream';

import { commonOptions, pipeInput, pipeOutput } from './Node';

export abstract class OutputPlugin extends Transform {
    constructor() {super(commonOptions);}

    public abstract async propagate(input: pipeInput): Promise<string>

    public abstract getNodeName(): string

    public _write(chunk: any, encoding: string, callback: Function): void {
        this.propagate(chunk).then(outputMessage => {
            this.push(`[${this.getNodeName()}]: ${outputMessage}`);
            callback();
        });
    }
}