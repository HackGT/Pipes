import { Router } from 'express';
import * as passport from 'passport';
import { ensureAuthenticated, ensureIsAdmin } from '../util/auth';
import { User, UserClass } from '../model/User';
import { validation } from '../util/project';
import * as validate from 'express-validation';
import { postUser } from '../util/users';
import { saveDocumentOrError } from '../util/common';

const router: Router = Router();

const authenticate = ensureAuthenticated({ message: 'You must be logged in to view this.' });
const admin = ensureIsAdmin({ message: 'You must be an admin to see access this' });

/**
 * Information retrieval
 * GET      /users/                             Get a summary list of authorized users
 * GET      /users/all                          Get a detailed list of all users
 *
 * Manipulators
 * POST     /users/:user                        Change the userclass of a particular user
 */

// Get a summary of each user
// This is used for autocompleting user fields in the app.
// MongoDB is bad with searching, so we would have to use redis if
// sending all users to the client becomes an issue
router.get('/', authenticate, async (req: any, res, next) => {
    const users = await User.find({
            userClass: { $gte: UserClass.User }
        })
        .select('email name');

    if (users === null) {
        res.status(500);
        res.json({ message: 'Error retrieving users' });
    }

    res.json(users);
});

// Get a detailed list of all users
// If it becomes an issue, we'll need to paginate this
router.get('/all', admin, async (req: any, res, next) => {
    const users = await User.find({});

    if (users === null) {
        res.status(500);
        res.json({ message: 'Error retrieving users' });
    }

    res.json(users);
});

router.post('/:user', admin, validate(postUser), async (req: any, res, next) => {
    const user = await User.findById(req.params.user);

    if (user !== null) {
        user.userClass = req.body.userClass;
        if (await saveDocumentOrError(user, res)) {
            res.json(user);
        }
    } else {
        res.sendStatus(404);
    }
});

// Change the authorization of a user

export default router;