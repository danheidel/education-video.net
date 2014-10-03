'use strict';

var startupVars = require('./api/security/deEscalate').startup();
console.log(startupVars);
var express = require('express');
var app = express();
var cons = require('consolidate');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
require('./api/security/passport')(passport);
var flash = require('connect-flash');
var routeFactory = require('./api/routes/routeGenerator').routeFactory;
var securityFuncs = require('./api/routes/securityFuncs');
var checkFuncs = require('./api/routes/checkFuncs');
var sanitizeFuncs = require('./api/routes/sanitizeFuncs');
var handlerFuncs = require('./api/routes/handlerFuncs');
var errorHandler = require('errorhandler');
// var logger = require('morgan');
var mongoose = require('mongoose');

var env = process.env.NODE_ENV || process.argv[4] || 'test';
console.log('specified environment: ' + env);

app.engine('hbs', cons.handlebars);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/site/templates');

//all env
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(__dirname + '/site/static'));
app.use(express.static(__dirname + '/site/js'));
app.use(express.static(__dirname + '/site/templates'));
app.use(express.static(__dirname + '/bower_components'));

var sessionSecret = process.env.SESSION_SECRET || process.argv[5] || 'nokey';
console.log('specified session secret: ' + sessionSecret);
app.use(expressSession({secret: sessionSecret}));

if(env === 'production'){
  console.log('running in production environment');
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
} else if(env === 'development'){
  console.log('running in development environment');
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(errorHandler());
  // app.use(logger());
  mongoose.connect('mongodb://localhost/education-dev');
} else if(env === 'test'){
  console.log('runing in test environment');
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(errorHandler());
  // app.use(logger());
  mongoose.connect('mongodb://localhost/education-test');
} else {
  console.error('invalid environment, exiting');
  process.exit();
}

routeFactory('/api/v1/creators', '../models/Creator', app, {
  securityFunc: securityFuncs.creatorSecurity,
  sanitizeInput: sanitizeFuncs.baseInput,
  checkCreate: checkFuncs.baseCheckCreate,
  checkUpdate: checkFuncs.baseCheckUpdate,
  handleCreate: handlerFuncs.createBase,
  handleUpdate: handlerFuncs.updateBase,
  checkInput: checkFuncs.baseCheckCreate,
  sanitizeOutput: sanitizeFuncs.baseOutput
});

routeFactory('/api/v1/tags', '../models/Tag', app, {
  securityFunc: securityFuncs.tagSecurity,
  sanitizeInput: sanitizeFuncs.baseInput,
  checkCreate: checkFuncs.baseCheckCreate,
  checkUpdate: checkFuncs.baseCheckUpdate,
  handleCreate: handlerFuncs.createBase,
  handleUpdate: handlerFuncs.updateBase,
  sanitizeOutput: sanitizeFuncs.baseOutput
});

routeFactory('/api/v1/channels', '../models/Channel', app, {
  securityFunc: securityFuncs.channelSecurity,
  sanitizeInput: sanitizeFuncs.baseInput,
  checkCreate: checkFuncs.baseCheckCreate,
  checkUpdate: checkFuncs.baseCheckUpdate,
  handleCreate: handlerFuncs.createBase,
  handleUpdate: handlerFuncs.updateBase,
  sanitizeOutput: sanitizeFuncs.baseOutput,
  populate: ['_creators', '_tags']
});

routeFactory('/api/v1/users', '../models/User', app, {
  securityFunc: securityFuncs.userSecurity,
  sanitizeInput: sanitizeFuncs.baseInput,
  checkCreate: checkFuncs.userCheckCreate,
  checkUpdate: checkFuncs.userCheckUpdate,
  handleCreate: handlerFuncs.createUser,
  handleUpdate: handlerFuncs.updateUser,
  sanitizeOutput: sanitizeFuncs.baseOutput
});

//sets up log-in/account sign-up route handlers
require('./api/security/loginRoutes.js')(app, passport);

var server = app.listen(startupVars.port, function(){
  console.log('serving on port: ' + startupVars.port);
});

process.on('exit', function(code){
  console.log('shutting down server');
  server.close();
  console.log('closed port');
  mongoose.disconnect();
  console.log('disconnected mongodb');
  console.log('preparing to exit with code: ' + code);
});
