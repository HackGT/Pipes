import { Readable } from "stream";

import { commonOptions } from './Node';

export class Input extends Readable {
    constructor() {super(commonOptions);}

    public _read(size: number) {
        this.push(null);
    }
}