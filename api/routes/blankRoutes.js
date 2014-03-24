'use strict';
/**/
//blank route file

var $$$ = require('../models/$$$');

exports.collection = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  $$$.find({}, function(err, $$$s){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(JSON.stringify($$$s));
    }
  });
};

exports.findById = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var id = req.params.id;
  $$$.findOne({'_id': String(id)}, function(err, $$$ById){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send($$$ById);
    }
  });
};

exports.create = function(req, res){
  //needs validation
  var user = new $$$(req.body);
  user.save(function(err, new$$$){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(new$$$);
    }
  });
};

exports.update = function(req, res){
  var id = String(req.params.id);
  //get rid of _id to prevent Mongo from shitting a brick
  delete req.body._id;
  var user = req.body;
  $$$.update({'_id': id}, user, function(err){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send({msg: 'success'});
    }
  });
};

exports.destroy = function(req, res){
  var id = String(req.params.id);
  $$$.remove({'_id': id}, function(err){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send({msg: 'success'});
    }
  });
};