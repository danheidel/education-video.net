'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  youtubeChannelId: {
    type: String,
    required: true,
    index: {unique: true}
  },
  updated: Date,
  title: String,
  location: String,
  published: Date,
  lastUpload: Date,
  thumbnail: String,
  description: String,
  viewCount: Number,
  commentCount: Number,
  subscriberCount: Number,
  videoCount: Number,
  uploadPlaylist: String,
  _videos: [{type: mongoose.Schema.Types.ObjectId, ref: 'YTVideo'}],
  local:{
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('YTChannel', schema);
