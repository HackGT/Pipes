import * as Joi from 'joi';

export const postUser = {
    userClass: Joi.number().required
};