'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  //_id: String,
  name: {
    type: String,
    required:true,
    index: {unique: true}
  },
  description: String,
  contact:{
    website: String,
    youTube: String,
    email: String,
    twitter: String,
    facebook: String,
    tumblr: String
  },
  local: {
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('Creator', schema);
