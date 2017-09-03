import { INode, IOutput } from '../node';

export default class Logger implements IOutput {
    readonly isOutput: boolean = true;
    readonly inputs: { [p: string]: INode };

    constructor(inputs: { [p: string]: INode } = {}) {
        this.inputs = inputs;
    }

    public propagate(): any {
        let str = '';

        for (const input in this.inputs) {
            str += this.inputs[input].propagate();
        }

        console.log(str);

        return 'Logged to console.';
    }

    public getServiceName(): string {
        return 'Logger';
    }
}