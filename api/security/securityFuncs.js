'use strict';
/*global _*/

module.exports.userSecurity = function(user, dbObject){
  if(!user){
    //if user is not authenticated
    return 'none';
  }
  if(user.local.permissions === 'admin'){
    //admin always has full rights
    return 'full';
  }
  if(user.local.permissions === 'user'){
    if(_.find(dbObject.local.owners, function(owner){
      return owner === user._id;
    })){
      //user owns this object, can do edits
      return 'full';
    }else{
      //doesn't own, can't see
      return 'none';
    }
  }
  return 'none';
};

module.exports.tagSecurity = function(user, dbObject){
  if(!user){
    //if user is not authenticated
    return 'read';
  }
  if(user.local.permissions === 'admin'){
    //admin always has full rights
    return 'full';
  }
  if(user.local.permissions === 'user'){
    if(_.find(dbObject.local.owners, function(owner){
      return owner === user._id;
    })){
      //user owns this object, can do edits
      return 'full';
    }else{
      //doesn't own, can only read
      return 'read';
    }
  }
  return 'none';
};

module.exports.creatorSecurity = function(user, dbObject){
  if(!user){
    //if user is not authenticated
    return 'read';
  }
  if(user.local.permissions === 'admin'){
    //admin always has full rights
    return 'full';
  }
  if(user.local.permissions === 'user'){
    if(_.find(dbObject.local.owners, function(owner){
      return owner === user._id;
    })){
      //user owns this object, can do edits
      return 'full';
    }else{
      //doesn't own, can only read
      return 'read';
    }
  }
  return 'none';
};

module.exports.channelSecurity = function(user, dbObject){
  if(!user){
    //if user is not authenticated
    return 'read';
  }
  if(user.local.permissions === 'admin'){
    //admin always has full rights
    return 'full';
  }
  if(user.local.permissions === 'user'){
    if(_.find(dbObject.local.owners, function(owner){
      return owner === user._id;
    })){
      //user owns this object, can do edits
      return 'full';
    }else{
      //doesn't own, can only read
      return 'read';
    }
  }
  return 'none';
};