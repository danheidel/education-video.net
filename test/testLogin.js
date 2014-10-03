'use strict';

var _ = require('lodash');
var superagent = require('superagent');
var User = require('../api/models/User');
var Tag = require('../api/models/Tag');
var Creator = require('../api/models/Creator');

module.exports.loginAdmin = function(done, users){
  //pull in the test users for checking security models
  User.find({}, function(err, retObject){
    if(err){
      console.log(err);
      return done(err);
    }
    users.admin = _.find(retObject, {displayName: 'Admin'});

    //login as admin
    users.adminAgent = superagent.agent();
    users.adminAgent.post('http://localhost:3000/login')
      .type('form')
      .send({
        email: users.admin.local.email,
        password: 'admin'
      })
      .end(function(err, res){
        if(err) {
          console.error(err);
          process.exit();
        }
        console.log('got admin');
        return done();
      });
  });
};

module.exports.loginUser1 = function(done, users){
  //pull in the test users for checking security models
  User.find({}, function(err, retObject){
    if(err){
      console.log(err);
      return done(err);
    }
    users.user1 = _.find(retObject, {displayName: 'User1'});

    //get user1
    users.user1Agent = superagent.agent();
    users.user1Agent.post('http://localhost:3000/login')
      .type('form')
      .send({
        email: users.user1.local.email,
        password: 'user1'
      })
      .end(function(err, res){
        if(err) {
          console.error(err);
          process.exit();
        }
        console.log('got user1');
        return done();
      });
  });

};

module.exports.loginUser2 = function(done, users){
  //pull in the test users for checking security models
  User.find({}, function(err, retObject){
    if(err){
      console.log(err);
      return done(err);
    }
    users.user2 = _.find(retObject, {displayName: 'User2'});

    //get user2
    users.user2Agent = superagent.agent();
    users.user2Agent.post('http://localhost:3000/login')
      .type('form')
      .send({
        email: users.user2.local.email,
        password: 'user2'
      })
      .end(function(err, res){
        if(err) {
          console.error(err);
          process.exit();
        }
        console.log('got user2');
        return done();
      });
  });

};

module.exports.loginNobody = function(done, users){
  //pull in the test users for checking security models
  User.find({}, function(err, retObject){
    if(err){
      console.log(err);
      return done(err);
    }
    users.nobody = _.find(retObject, {displayName: 'Nobody'});

    //get nobody, use as unauthenticated user, don't log in
    users.nobodyAgent = superagent.agent();
    console.log('got nobody');
    return done();
  });

};

module.exports.getTags = function(done, tags){
  Tag.find({}, function(err, retObject){
    if(err){
      console.log(err);
      return done(err);
    }
    _.each(retObject, function(tag){
      tags.push(tag);
    });
    return done();
  });
};

module.exports.getCreators = function(done, creators){
  Creator.find({}, function(err, retObject){
    if(err){
      console.log(err);
      return done(err);
    }
    _.each(retObject, function(creator){
      creators.push(creator);
    });
    return done();
  });
};