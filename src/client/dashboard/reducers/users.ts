import { Profile } from './profile';
import { LOAD_USERS, REFRESH_USER } from '../actions/users';

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
        case REFRESH_USER:
            return state.filter((value:Profile) => {
                return value.id !== action.payload._id
            }).concat([{
                id: action.payload._id,
                email: action.payload.email,
                name: action.payload.name,
                userClass: action.payload.userClass
            }]);
        default:
            return state;
    }
}