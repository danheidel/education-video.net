'use strict';
/**/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  local: {
    email: String,
    password: String,
    permissions: String
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

schema.methods.security = function(){};
schema.methods.create = function(){};
schema.methods.update = function(){};
schema.methods.sanitizeInput = function(){};

schema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

schema.methods.validatePassword = function(password){
  // console.log('validate passwrod');
  // console.log(password);
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', schema);