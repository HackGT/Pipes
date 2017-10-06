import { Input } from '../Input';

interface IOutput {
    data: string;
}

export class Static extends Input {
    constructor(config: { data: string }) {
        super();

        const output: IOutput = {
            data: config.data
        };

        this.push(output);
    }
}