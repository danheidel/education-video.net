'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  name: String,
  location: String,
  description: String,
  _tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
  //_videos: [{videoID: String}],
  _creators: [{type: mongoose.Schema.Types.ObjectId, ref: 'Creator'}],
  local:{
    owners: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
  }
});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('Channel', schema);