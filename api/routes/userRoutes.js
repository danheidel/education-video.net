'use strict';
/**/

var User = require('../models/User');

exports.collection = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  User.find({}, function(err, users){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(JSON.stringify(users));
    }
  });
};

exports.findById = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var id = req.params.id;
  User.findOne({'_id': String(id)}, function(err, userById){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(userById);
    }
  });
};

exports.create = function(req, res){
  //needs validation
  var user = new User(req.body);
  user.save(function(err, newUser){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(newUser);
    }
  });
};

exports.update = function(req, res){
  var id = String(req.params.id);
  //get rid of _id to prevent Mongo from shitting a brick
  delete req.body._id;
  var user = req.body;
  User.update({'_id': id}, user, function(err){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send({msg: 'success'});
    }
  });
};

exports.destroy = function(req, res){
  var id = String(req.params.id);
  User.remove({'_id': id}, function(err){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send({msg: 'success'});
    }
  });
};