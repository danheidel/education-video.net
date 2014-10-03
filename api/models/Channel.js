'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: {unique: true}
  },
  location: {
    type: String,
    required: true
  },
  description: String,
  _tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
  _creators: [{type: mongoose.Schema.Types.ObjectId, ref: 'Creator'}],
  _youtube: [{type: mongoose.Schema.Types.ObjectId, ref: 'YTChannel'}],
  local:{
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('Channel', schema);