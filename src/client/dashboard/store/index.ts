import { applyMiddleware, combineReducers, createStore } from 'redux';
import profile from '../reducers/profile';
import projects from '../reducers/projects';
import users from '../reducers/users';
import error from '../reducers/error';
import thunk from 'redux-thunk';
import services from '../reducers/services';

const reducer = combineReducers({
    profile,
    projects,
    users,
    error,
    services
});

export default createStore(
    reducer,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk),
)