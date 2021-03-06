import { Transform } from 'stream';

import { commonOptions, input, pipeInput, pipeOutput, Node } from './Node';

export abstract class TransformPlugin extends Transform implements Node {

    public numIter = null;

    constructor() {super(commonOptions);}

    public abstract async propagate(): Promise<pipeOutput>

    public abstract getNodeName(): string;

    public abstract buildDependencies(iterable, value, key);

    public abstract isSatisfied(): boolean;

    public _transform(chunk: any, encoding: string, callback: Function) {
        const { iterable, val, key } = this.decomposeInput(chunk);
        this.buildDependencies(iterable, val, key);

        if (this.isSatisfied()) {
            this.propagate().then(val => {
                this.push(val);
                callback();
            });
        } else {
            callback();
        }
    }

    public decomposeInput(input: pipeInput): input {
        // decompose input
        const keys = Object.keys(input);
        if (keys.length !== 2)
            throw Error(`[${this.getNodeName()}] received an object of size ${keys.length} as an input 
            when it should only receive 2`);

        let iterable, val, key = null;
        for (const k of keys) {
            if (k === 'iterable') {
                iterable = input[k]
            } else {
                val = input[k];
                key = k;
            }
        }

        return { iterable, val, key };
    }

    public setIterables(iterable, value, key) {
        if (iterable) {
            if (this.numIter === null) {
                this.numIter = value.length;
            } else if (!Array.isArray(value) || this.numIter !== value.length) {
                throw Error(`Iterable ${this.getNodeName()} inputs for ${key} must be arrays of the same length`);
            }
        } else if (typeof value !== 'string')
            throw Error(`noniterable ${this.getNodeName()} input for ${key} must be strings`);
    }
}