import { LOAD_PROFILE } from '../actions/profile';

export enum UserClass {
    Admin,
    User,
    Pending,
    Rejected
}

export type Profile = {
    readonly id: string,
    readonly email: string,
    readonly name: string;
    readonly userClass: UserClass,
}

const initState: Profile = {
    id: null,
    email: null,
    name: null,
    userClass: null
};

export default (state: Profile = initState, action: any) => {
    switch (action.type) {
        case LOAD_PROFILE:
            const { _id, email, name, userClass } = action.payload;
            return {
                id: _id,
                email,
                name,
                userClass
            };
        default:
            return state;
    }
}