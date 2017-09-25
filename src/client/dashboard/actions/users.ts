import { Profile } from '../reducers/profile';
import { Dispatch } from 'react-redux';
import { updateService } from './services';
import { showErrorMessage } from './error';

export const LOAD_USERS = 'LOAD_USERS';

const loadUsers = (profile: Profile) => ({
    type: LOAD_USERS,
    payload: profile
});
export const fetchUsers = () => {
    return (dispatch: Dispatch<any>) => {
        dispatch(updateService('fetchUsers', true));
        fetch(URL + '/users/all', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(profiles => {
                dispatch(loadUsers(profiles));
                dispatch(updateService('fetchUsers', false));
            })
            .catch(e => {
                dispatch(showErrorMessage(e));
                dispatch(updateService('fetchUsers', false));
            });
    };
};