import { OutputPlugin } from './Node';

interface Input {
    data: string;
}

export class Logger extends OutputPlugin {
    public propagate(input: Input): void {
        console.log(`[Logger]: ${input.data}`);
    }
}