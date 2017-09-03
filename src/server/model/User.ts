import * as mongoose from 'mongoose';
import { model, Document, Schema } from 'mongoose';

export enum UserClass {
    Admin = 3,
    User = 2,
    Pending = 1,
    Rejected = 0
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
   email: {type: String, required: true},
   name: {type: String, required: true},
   userClass: {type: Number, required: true},
   github: {
       id: {type: String, required: true},
       username: {type: String, required: true},
       profileUrl: {type: String, required: true}
   }
});

export const User = model<IUser>('User', userSchema);