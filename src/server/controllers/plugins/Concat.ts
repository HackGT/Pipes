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

    public async propagate(input: pipeInput): Promise<pipeOutput> {
        // decompose input
        const keys = Object.keys(input);
        if (keys.length !== 2) throw Error(`Concat received ${keys.length} keys as an input when it should only receive 2`);
        let iterable, val, key = null;

        for(const k in keys) {
            if(key==='iterable') {
                iterable = input[k]
            } else {
                val = input[k];
                key = k;
            }
        }

        // build dependencies
        if(key==='len') {
            const len = parseInt(val, 10);
            if(iterable===true || isNaN(len)) throw Error(`Concat's property 'len' must be a single number. Unexpected value ${val}`);
            this.dependencies.len = len;
        } else {
            const z = parseInt(key, 10);
            if(isNaN(z)) throw Error(`Concat's property key must be a single number. Unexpected key ${z}`);
            this.dependencies.values[z] = val;
            this.counter++;
        }

        // check if dependencies met
        if(this.counter === this.dependencies.len) {
            // do concat work
            return;
        }
    }
}