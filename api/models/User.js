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
});

//delete the local vars and __v
setupModel(schema);

schema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

schema.methods.validatePassword = function(password){
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', schema);