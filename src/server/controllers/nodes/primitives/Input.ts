import { INode } from '../node';

export default class Input implements INode {
    private value: any;

    setValue(value: any) {
        this.value = value;
    }

    public propagate(): any {
        return this.value;
    }
}