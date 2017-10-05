import { model, Document, Schema } from 'mongoose';

export interface IPipe extends Document {
    name: string,
    description: string,
    graph: string
}

const pipeSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    graph: String
});

export const Pipe = model<IPipe>('Pipe', pipeSchema);