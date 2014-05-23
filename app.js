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
var sanitizeFuncs = require('./api/routes/sanitizeFuncs');
var handlerFuncs = require('./api/routes/handlerFuncs');
var errorHandler = require('errorhandler');
var logger = require('morgan');
var mongoose = require('mongoose');

var env = process.env.NODE_ENV || 'test';

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

var sessionSecret = process.env.SESSION_SECRET || process.argv[2] || 'nokey';
app.use(expressSession({secret: sessionSecret}));

if(env === 'production'){
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
}

if(env === 'development'){
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(errorHandler());
  app.use(logger());
  mongoose.connect('mongodb://localhost/education-dev');
}

if(env === 'test'){
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(errorHandler());
  app.use(logger());
  mongoose.connect('mongodb://localhost/education-test');
}

routeFactory('/api/v1/creators', '../models/Creator', app, {
  sanitizeInput: sanitizeFuncs.baseInput,
  sanitizeOutput: sanitizeFuncs.baseOutput,
  handleCreate: handlerFuncs.createBase,
  handleUpdate: handlerFuncs.updateBase,
  securityFunc: securityFuncs.creatorSecurity
});

routeFactory('/api/v1/tags', '../models/Tag', app, {
  sanitizeInput: sanitizeFuncs.baseInput,
  sanitizeOutput: sanitizeFuncs.baseOutput,
  handleCreate: handlerFuncs.createBase,
  handleUpdate: handlerFuncs.updateBase,
  securityFunc: securityFuncs.tagSecurity
});

routeFactory('/api/v1/channels', '../models/Channel', app, {
  sanitizeInput: sanitizeFuncs.baseInput,
  sanitizeOutput: sanitizeFuncs.baseOutput,
  handleCreate: handlerFuncs.createBase,
  handleUpdate: handlerFuncs.updateBase,
  securityFunc: securityFuncs.channelSecurity,
  populate: ['_creators', '_tags']
});

routeFactory('/api/v1/users', '../models/User', app, {
  sanitizeInput: sanitizeFuncs.baseInput,
  sanitizeOutput: sanitizeFuncs.baseOutput,
  handleCreate: handlerFuncs.CreateUser,
  handleUpdate: handlerFuncs.UpdateUser,
  securityFunc: securityFuncs.userSecurity
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