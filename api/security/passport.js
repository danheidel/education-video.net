'use strict';

var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/User');

var passport;

module.exports = function(iPassport){
  passport = iPassport;

  passport.serializeUser(function(user, done) {
    // console.log('serialize user');
    // console.log(user);
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      // console.log('de-serialize user');
      // console.log(user);
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    // passReqToCallback: true
  },
  function(req, email, password, done){
    User.findOne({'local.email': email}, function(err, user){
      if(err){ return done(err);}
      if(user) {
        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
      } else {
        var newUser = new User();
        newUser.local.email = email;
        newUser.local.password = newUser.generateHash(password);
        newUser.save(function(err){
          if(err) throw err;
          return done(null, newUser);
        });
      }
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done){
    console.log('logging in');
    console.log(req.body);
    User.findOne({'local.email': email}, function(err, user){
      if(err){return done(err);}
      if(!user){
        console.log('User not found:' + email);
        // return done(null, false, req.flash('loginMessage', 'No user found.'));
        return done(null, false, {err: 'incorrect email address'});
      }
      if(!user.validatePassword(password)){
        console.log('incorrect password: ' + password);
        // return done(null, false, req.flash('loginMessage', 'Incorrect password!'));
        return done(null, false, {err: 'incorrect password'});
      }
      console.log('user validation success: ' + user.local.email);
      return done(null, user);
    });
  }));

  passport.use('local-test',
    new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },function(req, username, password, done){
      console.log('local-test');
      console.log('incoming username');
      console.log(username);
      console.log('incoming password');
      console.log(password);
      return done(null, {email:username, password: password, _id: '1'});
    })
  );
};
