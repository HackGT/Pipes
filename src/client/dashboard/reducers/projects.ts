import { UserClass } from '../../../server/model/User';
import {
    CREATE_PROJECT, DELETE_PROJECT, LOAD_PROJECTS,
    REFRESH_PROJECT
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
        default:
            return state;
    }
}