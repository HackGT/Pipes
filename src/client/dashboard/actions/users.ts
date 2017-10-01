import { Profile, default as profile, UserClass } from '../reducers/profile';
import { Dispatch } from 'react-redux';
import { throwErrors, updateService } from './services';
import { showErrorMessage } from './error';

export const LOAD_USERS = 'LOAD_USERS';
export const REFRESH_USER = 'REFRESH_USER';

const loadUsers = (profiles: Profile[]) => ({
    type: LOAD_USERS,
    payload: profiles
});
const refreshUser = (profile: Profile) => ({
    type: REFRESH_USER,
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
export const updateUser = (id: string, userClass: number) => {
    return (dispatch: Dispatch<any>) => {
        dispatch(updateService('updateUser', true));
        fetch(URL + '/users/' + id, {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userClass
            })
        })
            .then(throwErrors)
            .then(project => {
                dispatch(refreshUser(project));
                dispatch(updateService('updateUser', false));
            })
            .catch(e => {
                dispatch(showErrorMessage(e));
                dispatch(updateService('updateUser', false));
            });

    };
};