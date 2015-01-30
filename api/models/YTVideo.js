'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  youtubeVideoId: {
    type: String,
    required: true,
    index: {unique: true}
  },
  title: String,
  description: String,
  published: Date,
  thumbnail: String,
  length: String,
  views: Number,
  likes: Number,
  dislikes: Number,
  favorites: Number,
  comments: Number,
  captions: Boolean,
  local:{
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }
}, {strict: true});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('YTVideo', schema);
