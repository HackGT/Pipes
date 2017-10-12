export const APP_URL = process.env.ROOT_URL;

export const COOKIE_OPTIONS = {
    'path': '/',
    'maxAge': process.env.cookieMaxAge,
    'secure': process.env.cookieSecureOnly,
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