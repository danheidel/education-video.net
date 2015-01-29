'use strict';
var YTNormalizer = require('../normalizers/YTNormalizer');

//important note - always nake sure that ownership is applied to all new objects,
  //handle unathenticated users by finding an alternate source of ownership

module.exports.getUser = function(outputObject, dbObject, userId){

}

module.exports.createUser = function(input, userId, newObject){
  if(!newObject.local){
    newObject.local = {};
  }
  if(!input.email || !input.password || !input.displayName){
    return {
      status: 400,
      error: 'must have displayName, email and password to create new user'
    };
  }
  newObject.local.email = input.email;
  newObject.local.password = newObject.generateHash(input.password);
  newObject.local.permissions = 'user';
  return null;
};

module.exports.updateUser = function(input, userId, oldObject){
  if(!input.local){
    input.local = {};
  }
  var hashedPassword = oldObject.generateHash(input.oldPassword);
  if(hashedPassword !== oldObject.local.password){
    //old password does not match what is in the database
    return {
      status: 403,
      error: 'does not match existing password'
    };
  } else {
    if(input.newPassword){
      //changing the password
      input.local.email = oldObject.local.email;
      input.local.password = oldObject.generateHash(input.newPassword);
      input.local.permissions = 'user';
      delete(input.oldPassword);
      delete(input.newPassword);
      return null;
    }
    if(input.newEmail){
      //changing the email address
      input.local.email = input.newEmail;
      input.local.password = oldObject.local.password;
      input.local.permissions = 'user';
      delete(input.oldPassword);
      delete(input.newEmail);
      return null;
    }
    //neither email nor password were updated
    return {
      status: 400,
      error: 'no action taken'
    };
  }
};

module.exports.createYTChannel = function(input, userId, newObject){
  if(!newObject.local){
    newObject.local = {};
  }

}

module.exports.updateYTChannel = function(input, userId, oldObject){
  if(!input.local){
    input.local = {};
  }

}
