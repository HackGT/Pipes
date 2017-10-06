import { Readable, Writable, Duplex, Transform, DuplexOptions } from 'stream';

export const commonOptions: DuplexOptions = {
    objectMode: true
};

export type pipeOutput = {
    data: string | string[],
    iterable: boolean
}

export type mappedInput = {
    [mappedVal: string]: string | string[] | boolean, // Allow boolean because iterable
    iterable: boolean,
}

export type pipeInput = pipeOutput & mappedInput;