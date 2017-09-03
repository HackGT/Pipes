import { UserClass } from '../model/User';

interface IErrorMessage {
    message: string
}

export function ensureAuthenticated(redirectUrl: string | IErrorMessage) {
    return (req, res, next) => {
        if (req.isAuthenticated()) { return next(); }
        if (typeof redirectUrl === 'string') {
            res.redirect(redirectUrl);
        } else {
            res.status(401);
            res.json(redirectUrl);
        }
    };
}

export function ensureIsAdmin(redirectUrl: string | IErrorMessage) {
    return (req, res, next) => {
        if (req.isAuthenticated() && req.user.userClass === UserClass.Admin) { return next(); }
        if (typeof redirectUrl === 'string') {
            res.redirect(redirectUrl);
        } else {
            res.status(401);
            res.json(redirectUrl);
        }
    };
}

export function ensureAdmin(redirectUrl: string | IErrorMessage) {
    return (req, res, next) => {
        if (req.user.userClass === UserClass.Admin) { return next(); }
        if (typeof redirectUrl === 'string') {
            res.redirect(redirectUrl);
        } else {
            res.status(500);
            res.json(redirectUrl);
        }
    }
}