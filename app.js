'use strict';

var globalVars = require('./globalVars');
var deEscalate = require('./api/security/deEscalate');
var express = require('express');
var app = express();
var async = require('async');
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

var global = {};
console.log('test');
console.dir(process.env);
var env = process.env.NODE_ENV || process.argv[2] || 'test';
console.log('specified environment: ' + env);

async.series([
  setEnv,
  globalVars.bind(null, global),
  function(callback){
    console.dir(global);
    callback();
  },
  deEscalate.bind(null, global),
  setupExpress,
  setupRoutes,
  startServer
], function(err){
  if(err){
    console.error(err);
  }else{
    console.log('setup done');
  }
});

process.on('exit', function(code){
  console.log('shutting down server');
  server.close();
  console.log('closed port');
  mongoose.disconnect();
  console.log('disconnected mongodb');
  console.log('preparing to exit with code: ' + code);
});

function setEnv(callback){
  if(env === 'test'){
    console.log('running in test environment');
    mongoose.connect('mongodb://localhost/education-test');
  } else if(env === 'dev') {
    console.log('running in development environment');
    mongoose.connect('mongodb://localhost/education-dev');
  } else if(env === 'prod'){
    console.log('running in production environment');
    mongoose.connect('mongodb://localhost/education-prod');
  } else {
    console.error('Invalid environment selected');
    process.exit();
  }
  var conn = mongoose.connection;

  conn.on('open', function(){
    console.log('connection opened');
    callback();
  });
}

function setupExpress(callback){
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

  console.log('specified session secret: ' + global.sessionSecret);
  app.use(expressSession({secret: global.sessionSecret}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  if(env === 'production'){
  } else if(env === 'development'){
    app.use(errorHandler());
    // app.use(logger());
  } else if(env === 'test'){
    app.use(errorHandler());
    // app.use(logger());
  }
  callback();
}

function setupRoutes(callback){
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
  callback();
}

function startServer(callback){
  if(!global.port){
    console.error('no port provided, exiting');
    process.exit();
  }
  var server = app.listen(global.port, function(){
    console.log('serving on port: ' + global.port);
  });
  callback();
}
