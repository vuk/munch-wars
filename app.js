const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const users = require('./routes/users');
const play = require('./routes/play');
const contact = require('./routes/contact');
const awards = require('./routes/awards');
const ranking = require('./routes/ranking');
const rules = require('./routes/rules');
const winners = require('./routes/winners');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// TODO uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Static resources
app.use(express.static(path.join(__dirname, 'public')));
app.use('/jquery', express.static('node_modules/jquery/dist/'));
app.use('/phaser', express.static('node_modules/phaser-ce/build/'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist/'));

// Routes
app.use('/', index);
app.use('/play', play);
app.use('/awards', awards);
app.use('/contact', contact);
app.use('/users', users);
app.use('/ranking', ranking);
app.use('/rules', rules);
app.use('/winners', winners);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
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
