import logger = require('morgan');
import cookieParser = require('cookie-parser');
import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import * as mongoose from 'mongoose';
import index from './routes/index';
import auth from './routes/auth';
import projects from './routes/projects';
import users from './routes/users';
import { APP_URL } from './util/common';
import { Compiler } from 'webpack';
import { IUser, User, UserClass } from './model/User';

const session = require('express-session');
const GithubStrategy = require('passport-github2').Strategy as any;
const flash = require('connect-flash');
const config = require('../config.json');


const app: express.Express = express();

(mongoose as any).Promise = Promise; // Because the typings file incorrectly defines Promise as readonly
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/', {
    useMongoClient: true
});
passport.use(new GithubStrategy({
    clientID: config.secrets.github.id,
    clientSecret: config.secrets.github.secret,
    callbackURL: `${APP_URL}/auth/callback`
}, async (accessToken, refreshToken, profile, done) => {
    if (profile.emails === undefined) {
        done(null, false, { 'message': 'Please have a public email set on Github.' });
    }
    const email = profile.emails[0].value;
    let user = await User.findOne({ 'email': email });
    if (!user) {
        const numUsers = await User.count({});
        user = new User({
            email: email,
            name: profile.displayName,
            userClass: numUsers === 0 ? UserClass.Admin : UserClass.Pending,
            github: {
                id: profile.id,
                username: profile.username,
                profileUrl: profile.profileUrl
            }
        });

        try {
            await user.save();
        } catch (err) {
            done(err);
            return;
        }
    }

    if (user.userClass === UserClass.Rejected || user.userClass === UserClass.Pending) {
        done(null, false, { 'message': 'Your account has not been approved by an admin yet' });
    } else {
        done(null, user);
    }
}));

passport.serializeUser<IUser, string>((user, done) => {
    done(null, user._id.toString());
});

passport.deserializeUser<IUser, string>((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    })
});

app.use(logger('dev'));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: config.secrets.session,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/auth', auth);
app.use('/projects', projects);
app.use('/users', users);
if (process.env.NODE_ENV === 'dev') {
    console.log('DEVOLOPMENT ENVIRONMENT: Turning on WebPack Middleware...');

    const webpackconfig = require('../src/client/webpack.config.js');
    const webpackcompiler = webpack(webpackconfig, (err, stats) => {
        if (err) console.log('[webpack]', err);
    });

    app.use(webpackDevMiddleware(webpackcompiler as Compiler, {
        publicPath: webpackconfig.output.publicPath,
        noInfo: true,
        stats: {
            colors: true,
            chunks: false,
            'errors-only': true
        }
    } as webpackDevMiddleware.Options));
    app.use(webpackHotMiddleware(webpackcompiler as Compiler, {
        log: console.log
    } as webpackHotMiddleware.Options));
} else {
    console.log('PRODUCTION ENVIRONMENT');
    app.use(express.static(path.join(__dirname, '/public')));
}

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json(err);
});

export default app;