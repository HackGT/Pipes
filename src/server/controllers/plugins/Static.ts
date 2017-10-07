import { Input } from '../Input';
import { pipeOutput } from '../Node';

export class Static extends Input {
    constructor(config: { data: string }) {
        super();
        const output: pipeOutput = {
            data: config.data,
            iterable: false
        };

        this.push(output);
    }
}