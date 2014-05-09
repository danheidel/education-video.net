'use strict';

var createBase = function(newObject, req){
  if(!newObject.local){
    newObject.local = {};
  }
  newObject.local.owner = req.user._id;
};

module.exports.createBase = createBase;

var updateBase = function(newObject, oldObject){
  if(!newObject.local){
    newObject.local = {};
  }
  newObject.local.owner = oldObject.local.owner;
};

module.exports.updateBase = updateBase;

module.exports.createUser = function(newObject, req){
  if(!newObject.local){
    newObject.local = {};
  }
  newObject.local.email = req.body.email;
  newObject.local.password = newObject.generateHash(req.body.password);
  newObject.local.permissions = 'user';
};

module.exports.updateUser = function(newObject, oldObject){
  if(!newObject.local){
    newObject.local = {};
  }
  newObject.local.email = oldObject.local.email;
  newObject.local.password = oldObject.local.password;
  newObject.local.permissions = oldObject.local.permissions;
};