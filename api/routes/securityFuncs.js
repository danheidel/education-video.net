'use strict';

module.exports.securityFactory = function(){

};

module.exports.userSecurity = function(user, dbObject){
  if(!user){
    //if user is not authenticated
    return {
      read: false,
      create: true,
      update: false,
      destroy: false
    };
  }
  if(user.local.permissions === 'admin'){
    //admin always has full rights
    return {
      read: true,
      create: true,
      update: true,
      destroy: true
    };
  }
  if(user.local.permissions === 'user'){
    if(!dbObject){
      //no dbObject supplied - e.g.: object is being created
      //does user have rights to do this?
      return {
        create: true,
      };
    }
    if(dbObject._id.equals(user._id)){
      //user owns this object, can do updates
      return {
        read: true,
        update: true,
        destroy: true
      };
    }else{
      //doesn't own, can't see
      return {
        read: false,
        update: false,
        destroy: false
      };
    }
  }
  //uncaught
  return {
    read: false,
    create: false,
    update: false,
    destroy: false
  };
};

module.exports.tagSecurity = function(user, dbObject){
  if(!user){
    //if user is not authenticated
    return {
      read: true,
      create: false,
      update: false,
      destroy: false
    };
  }
  if(user.local.permissions === 'admin'){
    //admin always has full rights
    return {
      read: true,
      create: true,
      update: true,
      destroy: true
    };
  }
  if(user.local.permissions === 'user'){
    if(!dbObject){
      //no dbObject supplied - e.g.: object is being created
      //does user have rights to do this?
      return {
        create: false,
      };
    }
    if(dbObject.local.owner.equals(user._id)){
      //user owns this object, can do updates
      return {
        read: true,
        create: false,
        update: false,
        destroy: false
      };
    }else{
      //doesn't own, can only read
      return {
        read: true,
        create: false,
        update: false,
        destroy: false
      };
    }
  }
  //uncaught
  return {
    read: false,
    create: false,
    update: false,
    destroy: false
  };
};

module.exports.creatorSecurity = function(user, dbObject){
  if(!user){
    //if user is not authenticated
    return {
        read: true,
        create: false,
        update: false,
        destroy: false
      };
  }
  if(user.local.permissions === 'admin'){
    //admin always has full rights
    return {
      read: true,
      create: true,
      update: true,
      destroy: true
    };
  }
  if(user.local.permissions === 'user'){
    if(!dbObject){
      //no dbObject supplied - e.g.: object is being created
      //does user have rights to do this?
      return {
      create: true,
    };
    }
    if(dbObject.local.owner.equals(user._id)){
      //user owns this object, can do updates
      return {
      read: true,
      create: true,
      update: true,
      destroy: true
    };
    }else{
      //doesn't own, can only read
      return {
        read: true,
        create: false,
        update: false,
        destroy: false
      };
    }
  }
  //uncaught
  return {
    read: false,
    create: false,
    update: false,
    destroy: false
  };
};

module.exports.ytChannelSecurity = function(user, dbObject){
  if(!user){
    //if user is not authenticated
    return {
        read: true,
        create: false,
        update: false,
        destroy: false
      };
  }
  if(user.local.permissions === 'admin'){
    //admin always has full rights
    return {
      read: true,
      create: true,
      update: true,
      destroy: true
    };
  }
  if(user.local.permissions === 'user'){
    if(!dbObject){
      //no dbObject supplied - e.g.: object is being created
      //does user have rights to do this?
      return {
      create: false,
    };
    }
    if(dbObject.local.owner.equals(user._id)){
      //user owns this object, can do updates
      return {
      read: true,
      create: false,
      update: false,
      destroy: false
    };
    }else{
      //doesn't own, can only read
      return {
        read: true,
        create: false,
        update: false,
        destroy: false
      };
    }
  }
  //uncaught
  return {
    read: false,
    create: false,
    update: false,
    destroy: false
  };
};

module.exports.channelSecurity = function(user, dbObject){
  if(!user){
    //if user is not authenticated
    return {
      read: true,
      create: false,
      update: false,
      destroy: false
    };
  }
  if(user.local.permissions === 'admin'){
    //admin always has full rights
    return {
      read: true,
      create: true,
      update: true,
      destroy: true
    };
  }
  if(user.local.permissions === 'user'){
    if(!dbObject){
      //no dbObject supplied - e.g.: object is being created
      //does user have rights to do this?
      return {
        create: true,
      };
    }
    if(dbObject.local.owner.equals(user._id)){
      //user owns this object, can do updates
      return {
        read: true,
        create: true,
        update: true,
        destroy: true
      };
    }else{
      //doesn't own, can only read
      return {
        read: true,
        create: false,
        update: false,
        destroy: false
      };
    }
  }
  //uncaught
  return {
    read: false,
    create: false,
    update: false,
    destroy: false
  };
};
