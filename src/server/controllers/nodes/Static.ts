import { InputPlugin } from './Node';

interface IOutput {
    data: string;
}

export class Static extends InputPlugin {
    constructor(config: { data: string }) {
        super();

        const output: IOutput = {
            data: config.data
        };

        this.push(output);
    }
}