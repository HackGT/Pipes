import * as Joi from 'joi';

const postProject = {
    name: Joi.string().required(),
    description: Joi.string().required(),
    isPublic: Joi.boolean().required()
};

const postUser = {
    userId: Joi.number().required
};

const postPipe = {
    name: Joi.string().required(),
    description: Joi.string().required()
};

const putPipe = {
    name: Joi.string(),
    description: Joi.string(),
    graph: Joi.string()
};

const postKey = {
    name: Joi.string()
};


export const validation = {
    post: postProject,
    users: {
        post: postUser,
    },
    pipes: {
        post: postPipe,
        put: putPipe
    },
    keys: {
        post: postKey
    }
};

export function validateName(name:string) {
    return /^[A-Za-z0-9\-\_]+$/.test(name);
}
