'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  name: String,
  local: {
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

schema.methods.security = function(){};
schema.methods.create = function(){};
schema.methods.update = function(){};
schema.methods.sanitizeInput = function(){};

module.exports = mongoose.model('Tag', schema);