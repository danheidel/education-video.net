'use strict';

module.exports.baseCheckCreate = function(input, res){
  void(input);
  void(res);
};

module.exports.baseCheckUpdate = function(input, res){
  void(input);
  void(res);
};

module.exports.userCheckCreate = function(input, res){
  if(!input.email || !input.password){
    res.send(403, {'error':'creating a new user requires a valid email and password'});
  }
};

module.exports.userCheckUpdate = function(input, res){
  if(!input.email || !input.password){
    res.send(403, {'error':'creating a new user requires a valid email and password'});
  }
};