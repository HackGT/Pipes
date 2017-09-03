import { model, Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IPipe } from './Pipe';

export interface IProject extends Document {
    name: string,
    description: string,
    users: [IUser],
    pipes: [IPipe],
    keys: [{ name: string, id: string, secret: string }],
    isPublic: boolean
}

const projectSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    pipes: [{ type: Schema.Types.ObjectId, ref: 'Pipe' }],
    keys: [{
        name: { type: String, required: true },
        id: { type: String, required: true },
        secret: { type: String, required: true }
    }],
    isPublic: { type: Boolean, required: true }
});

export const Project = model<IProject>('Project', projectSchema);