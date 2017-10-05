import { DISMISS_ERROR, SHOW_ERROR } from '../actions/error';

export type Error = {
    readonly showError: boolean,
    readonly errorMessage: string
}

const initState: Error = { showError: false, errorMessage: '' };

// todo: action
export default (state: Error = initState, action: any) => {
    switch (action.type) {
        case SHOW_ERROR:
            return { showError: true, errorMessage: action.payload };
        case DISMISS_ERROR:
            return { ...state, showError: false };
        default:
            return state;
    }
}