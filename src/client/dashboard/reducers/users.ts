import { Profile } from './profile';
import { LOAD_USERS } from '../actions/users';

const initState: [Profile] = [] as [Profile];

// todo: action
export default (state: [Profile] = initState, action: any) => {
    switch (action.type) {
        case LOAD_USERS:
            return action.payload.map((user: any) => {
                return {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    userClass: user.userClass
                };
            });
        default:
            return state;
    }
}