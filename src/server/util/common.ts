const config = require('../../config.json');

export const APP_URL = config.server.url;

export const COOKIE_OPTIONS = {
    'path': '/',
    'maxAge': config.server.cookieMaxAge,
    'secure': config.server.cookieSecureOnly,
    'httpOnly': true
};

export async function saveDocumentOrError(document, res) {
    try {
        await document.save();
        return true;
    } catch(e) {
        res.status(500);
        res.json(e);
        return false;
    }
}