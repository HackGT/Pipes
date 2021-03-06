import { Key, Pipe, Project } from '../reducers/projects';
import { Dispatch } from 'redux';
import { showErrorMessage } from './error';
import { throwErrors, updateService } from './services';

export const LOAD_PROJECTS = 'LOAD_PROJECTS';
export const CREATE_PROJECT = 'CREATE_PROJECT';
export const REFRESH_PROJECT = 'REFRESH_PROJECT';
export const REFRESH_PROJECT_USERS = 'REFRESH_PROJECT_USERS';
export const DELETE_PROJECT = 'DELETE_PROJECT';
export const CREATE_PIPE = 'CREATE_PIPE';
export const CREATE_KEY = 'CREATE_KEY';
export const REMOVE_KEY = 'REMOVE_KEY';
export const REFRESH_PIPE = 'REFRESH_PIPE';

const loadProjects = (projects: [Project]) => ({
    type: LOAD_PROJECTS,
    payload: projects
});
const createProject = (project: Project) => ({
    type: CREATE_PROJECT,
    payload: project
});
const removeProject = (id: string) => ({
    type: DELETE_PROJECT,
    payload: id
});
const refreshProject = (id: string, project: Project) => ({
    type: REFRESH_PROJECT,
    payload: { id, project }
});
const refreshProjectUsers = (id: string, project: Project) => ({
    type: REFRESH_PROJECT_USERS,
    payload: { id, project }
});
const createPipe = (pipe: Pipe) => ({
    type: CREATE_PIPE,
    payload: pipe
});
const createKey = (id: string, key: Key) => ({
    type: CREATE_KEY,
    payload: { id, key }
});
const removeKey = (id: string, keys: Key[]) => ({
    type: REMOVE_KEY,
    payload: { id, keys }
});
const refreshPipe = (projectId: string, pipe: Pipe) => ({
    type: REFRESH_PIPE,
    payload: { projectId, pipe }
});

export const fetchProjects = () => {
    return (dispatch: Dispatch<any>) => {
        dispatch(updateService('fetchProjects', true));
        fetch(URL + '/projects/', { credentials: 'same-origin' })
            .then(res => res.json())
            .then(projects => {
                dispatch(loadProjects(projects));
                dispatch(updateService('fetchProjects', false));
            })
            .catch(e => {
                dispatch(showErrorMessage(e));
                dispatch(updateService('fetchProjects', false));
            });
    };
};

export const saveProject = (name: string, description: string, isPublic: boolean) => {
    return (dispatch: Dispatch<any>) => {
        dispatch(updateService('saveProject', true));
        fetch(URL + '/projects/', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                description,
                isPublic
            })
        })
            .then(throwErrors)
            .then(project => {
                dispatch(createProject(project));
                dispatch(updateService('saveProject', false));
            })
            .catch(e => {
                dispatch(showErrorMessage(e));
                dispatch(updateService('saveProject', false));
            });
    }
};

export const deleteProject = (id: string) => {
    return (dispatch: Dispatch<any>) => {
        dispatch(updateService('deleteProject', true));
        fetch(URL + '/projects/' + id, {
            credentials: 'same-origin',
            method: 'DELETE'
        })
            .then(throwErrors)
            .then(project => {
                dispatch(removeProject(id));
                dispatch(updateService('deleteProject', false));
            })
            .catch(e => {
                dispatch(showErrorMessage(e));
                dispatch(updateService('deleteProject', false));
            });
    }
};
export const inspectProject = (id: string) => {
    return (dispatch: Dispatch<any>) => {
        dispatch(updateService('inspectProject', true));
        fetch(URL + '/projects/' + id, { credentials: 'same-origin' })
            .then(throwErrors)
            .then(project => {
                dispatch(refreshProject(id, project));
                dispatch(updateService('inspectProject', false));
            })
            .catch(e => {
                dispatch(showErrorMessage(e));
                dispatch(updateService('inspectProject', false));
            });
    }
};
export const savePipe = (project: string, name: string, description: string) => {
    return (dispatch: Dispatch<any>) => {
        dispatch(updateService('savePipe', true));
        fetch(URL + '/projects/' + project + '/pipes', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                description
            })
        })
            .then(throwErrors)
            .then(pipe => {
                dispatch(createPipe(pipe));
                dispatch(updateService('savePipe', false));
            })
            .catch(e => {
                dispatch(showErrorMessage(e));
                dispatch(updateService('savePipe', false));
            })
    }
};
export const saveKey = (project: string, label: string) => {
    return (dispatch: Dispatch<any>) => {
        dispatch(updateService('saveKey', true));
        fetch(URL + '/projects/' + project + '/keys', {
            credentials: 'same-origin',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: label
            })
        })
            .then(throwErrors)
            .then((key: Key) => {
                dispatch(createKey(project, key));
                dispatch(updateService('saveKey', false));
            })
            .catch(e => {
                dispatch(showErrorMessage(e));
                dispatch(updateService('saveKey', false));
            })
    };
};
export const deleteKey = (project: string, label: string) => {
    return (dispatch: Dispatch<any>) => {
        dispatch(updateService('deleteKey', true));
        fetch(URL + '/projects/' + project + '/keys/' + label, {
            credentials: 'same-origin',
            method: 'DELETE'
        })
            .then(throwErrors)
            .then((keys: Key[]) => {
                console.log(keys);
                dispatch(removeKey(project, keys));
                dispatch(updateService('deleteKey', false));
            })
            .catch(e => {
                dispatch(showErrorMessage(e));
                dispatch(updateService('deleteKey', false));
            })
    };
};

export const updatePipe = (projectId: string, pipeId: string, graph: string) => {
    return (dispatch: Dispatch<any>) => {
        dispatch(updateService('updatePipe', true));
        fetch(URL + '/projects/' + projectId + '/pipes/' + pipeId, {
            credentials: 'same-origin',
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                graph
            })
        })
            .then(throwErrors)
            .then((pipe) => {
                console.log(pipe);
                dispatch(refreshPipe(projectId, pipe));
                dispatch(updateService('updatePipe', false));
            })
            .catch(e => {
                dispatch(showErrorMessage(e));
                dispatch(updateService('updatePipe', false));
            })
    };
};