import { Input } from '../Input';
import { pipeOutput } from '../Node';

export class Static extends Input {
    constructor(data: string | string[]) {
        super();
        const output: pipeOutput = {
            data: data,
            iterable: Array.isArray(data)
        };

        this.push(output);
    }
}