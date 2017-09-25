import { TransformPlugin } from './Node';
import { isNumeric } from 'tslint';

interface IInput {
    len?: string,

    [data: string]: string
}

interface IOutput {
    data: string;
}

export class Concat extends TransformPlugin {
    private len: number = Number.MAX_SAFE_INTEGER;
    private vals: [string] = [] as [string];


    public propagate(input: IInput): IOutput {
        console.log(input);
        if (input.len) {
            this.len = parseInt(input.len, 10);
        }

        for (const key of Object.keys(input)) {
            const num = parseInt(key, 10);
            if (!isNaN(num) && num >= 0 && num < this.len) {
                this.vals[num] = input[key];
            }
        }

        if (this.vals.reduce<number>((counter: number, currentValue: string) =>
                currentValue === undefined ? counter : counter + 1, 0) === this.len) {
            let str = '';
            for (const val of this.vals) {
                str += val;
            }
            return { data: str };
        }
        return undefined;
    }

}