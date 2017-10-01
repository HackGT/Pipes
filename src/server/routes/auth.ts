import { Router } from 'express';
import * as passport from 'passport';

const router: Router = Router();

router.get('/login', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/callback', passport.authenticate('github', { failureRedirect: '/',
    failureFlash: false, successRedirect: '/dashboard' }));

export default router;