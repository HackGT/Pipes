import { UserClass } from '../../../server/model/User';
import {
    CREATE_KEY,
    CREATE_PROJECT, DELETE_PROJECT, LOAD_PROJECTS, REFRESH_PIPE,
    REFRESH_PROJECT, REMOVE_KEY
} from '../actions/projects';

export type Pipe = {
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly graph?: string
}

export type Project = {
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly users: [string],
    readonly pipes: [Pipe],
    readonly keys: [{ name: string, id: string, secret: string }],
    readonly isPublic: boolean
}

export type Key = {
    readonly name: string,
    readonly id: string,
    readonly secret: string
}

const initState: [Project] = [] as [Project];

// todo: action
export default (state: [Project] = initState, action: any) => {
    switch (action.type) {
        case LOAD_PROJECTS:
            return action.payload ;
        case CREATE_PROJECT:
            return state.concat(action.payload);
        case DELETE_PROJECT:
            return state.filter((value: Project) => value.name !== action.payload);
        case REFRESH_PROJECT:
            return state.filter((value:Project) => {
               return value.name !== action.payload.id
            }).concat([action.payload.project]);
        case CREATE_KEY:
            return state.map((project: Project) => {
                if(project.name === action.payload.id) {
                    return {
                        ...project,
                        keys: project.keys.concat([action.payload.key])
                    }
                } else {
                    return project;
                }
            });
        case REMOVE_KEY:
            return state.map((project: Project) => {
                if(project.name === action.payload.id) {
                    return {
                        ...project,
                        keys: action.payload.keys
                    }
                } else {
                    return project;
                }
            });
        case REFRESH_PIPE:
            return state.map((project: Project) => {
                if(project.name === action.payload.projectId) {
                    return {
                        ...project,
                        pipes: project.pipes.filter((value: Pipe) => value.id !== action.payload.pipe._id)
                            .concat(action.payload.pipe)
                    }
                } else {
                    return project;
                }
            });
        default:
            return state;
    }
}