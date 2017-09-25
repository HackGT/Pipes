import { Profile } from '../reducers/profile';
import { Dispatch } from 'react-redux';
import { updateService } from './services';
import { showErrorMessage } from './error';

export const LOAD_PROFILE = 'LOAD_PROFILE';

const loadProfile = (profile: Profile) => ({
    type: LOAD_PROFILE,
    payload: profile
});
export const fetchProfile = () => {
    return (dispatch: Dispatch<any>) => {
        dispatch(updateService('fetchProfile', true));
        fetch(URL + '/account', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(profile => {
                dispatch(loadProfile(profile));
                dispatch(updateService('fetchProfile', false));
            })
            .catch(e => {
                dispatch(showErrorMessage(e));
                dispatch(updateService('fetchProfile', false));
            });
    };
};