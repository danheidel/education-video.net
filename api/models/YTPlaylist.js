'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  youtubePlaylistId: {
    type: String,
    required: true,
    index: {unique: true}
  },
  updated: Date,
  title: String,
  location: String,
  description: String,
  published: Date,
  thumbnail: String,
  _videos: [{type: mongoose.Schema.Types.ObjectId, ref: 'YTVideo'}],
  local:{
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('YTPlaylist', schema);
