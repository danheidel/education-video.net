'use strict';

var createBase = function(input, userId, newObject){
  if(!newObject.local){
    newObject.local = {};
  }
  newObject.local.owner = userId;
};

module.exports.createBase = createBase;

var updateBase = function(input, userId, oldObject){
  if(!input.local){
    input.local = {};
  }
  input.local.owner = oldObject.local.owner;
};

module.exports.updateBase = updateBase;

//important note - always nake sure that ownnership is applied to all new objects, handle unathenticated users by finding an alternate source of ownership

module.exports.createUser = function(input, userId, newObject){
  if(!newObject.local){
    newObject.local = {};
  }
  newObject.local.email = input.email;
  newObject.local.password = newObject.generateHash(input.password);
  newObject.local.permissions = 'user';
};

module.exports.updateUser = function(input, userId, oldObject){
  if(!input.local){
    input.local = {};
  }
  input.local.email = oldObject.local.email;
  input.local.password = oldObject.local.password;
  input.local.permissions = oldObject.local.permissions;
};