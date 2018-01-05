/**
 * @type {*|createApplication}
 */
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const passport = require('passport');
const credentials = require('./oauth.js');
const FacebookStrategy = require('passport-facebook').Strategy;

const index = require('./routes/index');
const users = require('./routes/users');
const play = require('./routes/play');
const contact = require('./routes/contact');
const awards = require('./routes/awards');
const ranking = require('./routes/ranking');
const rules = require('./routes/rules');
const winners = require('./routes/winners');
const auth = require('./routes/auth');
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
const _ = require('lodash');

const app = express();
app.locals._ = _;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
    clientID: credentials.facebook.clientID,
    clientSecret: credentials.facebook.clientSecret,
    callbackURL: credentials.facebook.callbackURL,
    profileFields: ['id', 'displayName', 'emails']
  }, function (accessToken, refreshToken, profile, done) {
    playfab.LoginWithFacebook({
      AccessToken: accessToken,
      CreateAccount: true,
      TitleId: playfab.settings.titleId
    }, function (err, result) {
      done(null, {
        result: result,
        profile: profile
      });
    });
  }
));

app.set('trust proxy', 1);

app.use(session({
  secret: '23!@#$GFDS54sdgdfs!@$*^%',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 86400000 * 60 }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// TODO uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(cookieParser('23!@#$GFDS54sdgdfs!@$*^%'));
app.set('trust proxy', 1); // trust first proxy

// Static resources
app.use(express.static(path.join(__dirname, 'public')));
app.use('/jquery', express.static('node_modules/jquery/dist/'));
app.use('/phaser', express.static('node_modules/phaser-ce/build/'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist/'));

// Routes
app.use('/', index);
app.use('/play', play);
//app.use('/awards', awards);
//app.use('/contact', contact);
app.use('/profile', users);
app.use('/ranking', ranking);
//app.use('/rules', rules);
//app.use('/winners', winners);
app.use('/auth', auth);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.redirect('/');
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
