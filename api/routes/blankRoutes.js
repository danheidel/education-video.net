'use strict';
/**/
//blank route file

var QQ = require('../models/QQ');

exports.collection = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  QQ.find({}, function(err, qqs){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(JSON.stringify(qqs));
    }
  });
};

exports.findById = function(req, res){
  res.setHeader('Content-Type', 'application/json');
  var id = req.params.id;
  QQ.findOne({'_id': String(id)}, function(err, qqById){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(qqById);
    }
  });
};

exports.create = function(req, res){
  //needs validation
  var qq = new QQ(req.body);
  qq.save(function(err, newQQ){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send(newQQ);
    }
  });
};

exports.update = function(req, res){
  var id = String(req.params.id);
  //get rid of _id to prevent Mongo from shitting a brick
  delete req.body._id;
  var qq = req.body;
  QQ.update({'_id': id}, qq, function(err){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send({msg: 'success'});
    }
  });
};

exports.destroy = function(req, res){
  var id = String(req.params.id);
  QQ.remove({'_id': id}, function(err){
    if(err){
      res.send(500, {'error': err});
    } else {
      res.send({msg: 'success'});
    }
  });
};