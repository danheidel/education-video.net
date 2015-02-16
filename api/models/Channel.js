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
  visible: Boolean,
  votes: Number,
  description: String,
  longDescription: String,
  _tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
  _creators: [{type: mongoose.Schema.Types.ObjectId, ref: 'Creator'}],
  _ytchannels: [{type: mongoose.Schema.Types.ObjectId, ref: 'YTChannel'}],
  _ytplaylists: [{type: mongoose.Schema.Types.ObjectId, ref: 'YTPlaylist'}],
  _websites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Websites'}],
  _comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comments'}],
  local:{
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('Channel', schema);
