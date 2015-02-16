'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  URL: {
    type: String,
    required: true,
    index: {unique: true}
  },
  updated: Date,
  title: String,
  thumbnail: String,
  description: String,
  local:{
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('Website', schema);
