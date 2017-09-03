import { Router } from 'express';
import { ensureAuthenticated } from '../util/auth';
import * as path from 'path';

const router: Router = Router();

/* GET home page. */
router.get('/', (req: any, res, next) => {
    const errors = req.flash('error');

    if(errors.length > 0) {
        res.redirect('/?error=' + errors[0]);
        return;
    }

    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
        return;
    }
    res.sendFile(path.resolve(__dirname + '/../public/index.html'));
});

router.get('/dashboard*', ensureAuthenticated('/'), (req: any, res, next) => {
    res.sendFile(path.resolve(__dirname + '/../public/app/index.html'));
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/account', ensureAuthenticated('/'), (req, res) => {
    res.json({ user: req.user });
});

export default router;