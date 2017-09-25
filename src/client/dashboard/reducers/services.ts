
import { UPDATE_SERVICE } from '../actions/services';

type Services ={[service: string]: boolean};
const initState: Services = {};

// todo: action
export default (state: Services = initState, action: any) => {
    switch (action.type) {
        case UPDATE_SERVICE:
            return {...state, [action.payload.service]: action.payload.waiting};
        default:
            return state;
    }
}