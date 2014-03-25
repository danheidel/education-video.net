'use strict';
/**/

var Creator = require('../models/Creator');

exports.collection = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  Creator.find({}, function(err, creators){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(JSON.stringify(creators));
    }
  });
};

exports.findById = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var id = req.params.id;
  Creator.findOne({'_id': String(id)}, function(err, creatorById){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(creatorById);
    }
  });
};

exports.create = function(req, res){
  //needs validation
  var creator = new Creator(req.body);
  creator.save(function(err, newCreator){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(newCreator);
    }
  });
};

exports.update = function(req, res){
  var id = String(req.params.id);
  //get rid of _id to prevent Mongo from shitting a brick
  delete req.body._id;
  var creator = req.body;
  Creator.update({'_id': id}, creator, function(err){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send({msg: 'success'});
    }
  });
};

exports.destroy = function(req, res){
  var id = String(req.params.id);
  Creator.remove({'_id': id}, function(err){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send({msg: 'success'});
    }
  });
};