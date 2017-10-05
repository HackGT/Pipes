import { TransformPlugin } from './Node';
import { isNumeric } from 'tslint';

interface IInput {
    len?: string,
    [data: string]: any
}

interface IOutput {
    [data: string]: any;
}

export class Concat extends TransformPlugin {
    private len: number = Number.MAX_SAFE_INTEGER;
    private vals: string[] = [];
    private iterables: boolean[] = [];

    public propagate(input: IInput): IOutput {
        if (input.len) {
            this.len = parseInt(input.len, 10);
        }
        for (const key of Object.keys(input)) {
            const num = parseInt(key, 10);
            if (!isNaN(num) && num >= 0 && num < this.len) {
                this.iterables[num] = input.iterable ? true : false;
                this.vals[num] = input[key];
            }
        }
        if (this.vals.reduce<number>((counter: number, currentValue: string) =>
                currentValue === undefined ? counter : counter + 1, 0) === this.len) {
            let iter: boolean;
            let prevIter: boolean = false;
            let newValue: string|string[] = '';
            for (let i = 0; i < this.vals.length; i++) {
                const val = this.vals[i];
                iter = this.iterables[i];
                if (!iter &&  !prevIter) {
                    newValue = newValue + val;
                } else {
                    newValue = this.calculateConcat(newValue, val, iter, prevIter);
                    console.log(newValue);
                }
                prevIter = iter || prevIter;
            }
            return {
                data: newValue,
                iterable: iter
            };
        }
        return undefined;
    }

    private calculateConcat(str: string|string[], val: string|string[], iter:boolean, prevIter:boolean): string[] {
        let toReturn: string[] = [];
        // Take the shortest length. Things that won't be concatenated
        // probably should not be pushed.
        let correctLength: number = prevIter ? str.length : val.length;
        let concat = this.getConcatFunction(iter, prevIter);
        for (let i=0; i < correctLength; i++) {
            toReturn[i] = concat(str, val, i);
        }
        return toReturn;
    }

    private getConcatFunction(iter, prevIter) {
        if (iter) {
            if (prevIter) {
                return function(str: string|string[], val: string|string[], i: number): string {
                    return str[i] + val[i];
                };
            } else {
                return function(str: string|string[], val: string|string[], i: number): string {
                    return str + val[i];
                };
            }
        } else {
            return function(str: string|string[], val: string|string[], i: number): string {
                return str[i] + val;
            };
        }
    }
}