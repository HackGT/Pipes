import { INode, ITransformer } from '../node';

export default class Add implements ITransformer {
    inputs: { [p: string]: INode };

    constructor(inputs: { [p: string]: INode } = {}) {
        this.inputs = inputs;
    }

    public propagate(): any {
        let sum = 0;

        for (const input in this.inputs) {
            const val = this.inputs[input].propagate();
            if(isNaN(val)) {
                throw new Error(`Cannot add ${val} because it is not a number.`);
            }

            sum += parseFloat(val);
        }

        return sum;
    }

}