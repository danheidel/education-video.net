'use strict';
/**/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var schema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  local: {
    email: String,
    password: String
  }
});

schema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.methods.validatePassword = function(password){
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', schema);