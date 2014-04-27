'use strict';

var startupVars = require('./api/security/deEscalate').startup();
console.log(startupVars);
var express = require('express');
var app = express();
var cons = require('consolidate');
//var path = require('path');
//var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var passport = require('passport');
require('./api/security/passport')(passport);
var flash = require('connect-flash');
var routeFactory = require('./api/routes/routeGenerator').routeFactory;
var errorHandler = require('errorhandler');
var logger = require('morgan');
var mongoose = require('mongoose');

var env = process.env.NODE_ENV || 'test';

app.engine('hbs', cons.handlebars);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/site/templates');

//all env
//app.use(express.bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(__dirname + '/site/static'));

var sessionSecret = process.env.SESSION_SECRET || 'nokey';
app.use(expressSession({secret: sessionSecret}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//sets up express routes
var routeOptions = {
  app: app,
  security: 'none'
};
routeFactory('/api/v1/users', '../models/User', routeOptions);
routeFactory('/api/v1/creators', '../models/Creator', routeOptions);
routeFactory('/api/v1/channels', '../models/Channel', routeOptions);

if(env === 'production'){

}

if(env === 'development'){
  app.use(errorHandler());
  app.use(logger());
  mongoose.connect('mongodb://localhost/education-dev');
}

if(env === 'test'){
  app.use(errorHandler());
  app.use(logger());
  mongoose.connect('mongodb://localhost/education-test');
}

//sets up log-in/account sign-up route handlers
require('./api/security/loginRoutes.js')(app, passport);

app.listen(startupVars.port, function(){
  console.log('serving on port: ' + startupVars.port);
});