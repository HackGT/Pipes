import { model, Document, Schema } from 'mongoose';

export enum UserClass {
    Admin,
    User,
    Pending,
    Rejected
}

export interface IUser extends Document {
    email: string;
    name: string;
    userClass: UserClass,
    github: {
        id: string,
        username: string,
        profileUrl: string
    }
}

const userSchema = new Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    userClass: { type: Number, required: true },
    github: {
        id: { type: String, required: true },
        username: { type: String, required: true },
        profileUrl: { type: String, required: true }
    }
});

export const User = model<IUser>('User', userSchema);