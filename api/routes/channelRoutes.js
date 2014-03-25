'use strict';
/**/

var Channel = require('../models/Channel');

exports.collection = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  Channel.find({}, function(err, channels){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(JSON.stringify(channels));
    }
  });
};

exports.findById = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var id = req.params.id;
  Channel.findOne({'_id': String(id)}, function(err, channelById){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(channelById);
    }
  });
};

exports.create = function(req, res){
  //needs validation
  var channel = new Channel(req.body);
  channel.save(function(err, newChannel){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(newChannel);
    }
  });
};

exports.update = function(req, res){
  var id = String(req.params.id);
  //get rid of _id to prevent Mongo from shitting a brick
  delete req.body._id;
  var channel = req.body;
  Channel.update({'_id': id}, channel, function(err){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send({msg: 'success'});
    }
  });
};

exports.destroy = function(req, res){
  var id = String(req.params.id);
  Channel.remove({'_id': id}, function(err){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send({msg: 'success'});
    }
  });
};