import { Transform } from 'stream';

import { commonOptions, pipeOutput } from './Node';

export class Mapper extends Transform {
    constructor(private mapping: { [mapping: string]: string }) {
        super(commonOptions);
    }

    public _transform(chunk: any, encoding: string, callback: Function): void {
        const remapped: pipeOutput = {} as pipeOutput;
        const values =  Object.values(this.mapping);
        for (const key of Object.keys(chunk)) {
            if (this.mapping[key]) {
                remapped[this.mapping[key]] = chunk[key];
            }
            else if(!(key in values)) {
                remapped[key] = chunk[key];
            }
        }
        this.push(remapped);
        callback();
    }
}