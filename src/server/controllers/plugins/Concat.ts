import { TransformPlugin } from '../Transformer';
import { pipeInput, pipeOutput } from '../Node';

type pluginDependencies = {
    len: number,
    values: any[]
}

export class Concat extends TransformPlugin {
    private dependencies: pluginDependencies = {
        len: null,
        values: []
    };
    private counter = 0;

    public getNodeName(): string {
        return 'Concat';
    }

    public async propagate(): Promise<pipeOutput> {
        const shouldIter = this.numIter !== null;
        let out: string[] | string = '';
        if (shouldIter) {
            out = [];
            for (let i = 0; i < this.numIter; i++) {
                out[i] = ''
            }
        }

        // iterate through each value
        for (const z in this.dependencies.values) {
            const data = this.dependencies.values[z].val;
            const iter = this.dependencies.values[z].iterable;

            if (shouldIter) {
                for (let i = 0; i < this.numIter; i++) {
                    (out as string[])[i]+= iter ? data[i] : data;
                }
            } else {
                out += (data as string);
            }
        }
        return {data: out, iterable: shouldIter};
    }

    public isSatisfied(): boolean {
        return this.counter === this.dependencies.len;
    }

    public buildDependencies(iterable, val, key) {
        // parse len as number and save
        if (key === 'len') {
            const len = parseInt(val, 10);
            if (iterable === true || isNaN(len))
                throw Error(`Concat's property 'len' must be a single number. Unexpected value ${val}`);
            this.dependencies.len = len;

            // parse z-indexes as number and save
        } else {
            const z = parseInt(key, 10);
            if (isNaN(z))
                throw Error(`Concat's property key must be a single number. Unexpected key ${z}`);
            this.dependencies.values[z] = { val, iterable };
            if (iterable === true) {
                if (this.numIter === null) this.numIter = val.length;
                else if (this.numIter !== val.length || !Array.isArray(val))
                    throw Error('Iterable concat inputs must be arrays of the same length');
            }
            this.counter++;
        }
    }
}