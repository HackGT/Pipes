import { INode } from '../node';

export default class Value implements INode {
    private readonly value: any;

    constructor(value: any) {
        this.value = value;
    }

    public propagate(): any {
        return this.value;
    }
}