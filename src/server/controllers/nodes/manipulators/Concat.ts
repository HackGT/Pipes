import { INode, ITransformer } from '../node';
export default class Concat implements ITransformer {
    inputs: { [p: string]: INode };

    constructor(inputs: { [p: string]: INode } = {}) {
        this.inputs = inputs;
    }

    public propagate(): any {
        let str = '';

        for (const input in this.inputs) {
            str += this.inputs[input].propagate();
        }

        return str;
    }

}