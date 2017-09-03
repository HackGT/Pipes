import { Router } from 'express';
import * as passport from 'passport';
import { ensureAuthenticated, ensureIsAdmin } from '../util/auth';
import { User, UserClass } from '../model/User';

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
router.get('/', authenticate, (req: any, res, next) => {
    const users = User.find({
            userClass: { $gte: UserClass.User }
        })
        .select('email name');

    if(users === null) {
        res.status(500);
        res.json({ message: 'Error retrieving users' });
    }

    res.json(users);
});

// Get a detailed list of all users
// If it becomes an issue, we'll need to paginate this
router.get('/all', admin, (req: any, res, next) => {
    const users = User.find({});

    if(users === null) {
        res.status(500);
        res.json({ message: 'Error retrieving users' });
    }

    res.json(users);
});

// Change the authorization of a user