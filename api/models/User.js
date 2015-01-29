'use strict';
/**/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    index: {unique: true}
  },
  local: {
    email: {
      type: String,
      required:true,
      index: {unique: true}
    },
    password: {
      type: String,
      required:true
    },
    permissions: {
      type: String,
      required:true
    },
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

schema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

schema.methods.validatePassword = function(password){
  // console.log('validate passwrod');
  // console.log(password);
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', schema);
