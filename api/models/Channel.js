'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  name: String,
  location: String,
  description: String,
  //tags: [{tagID: String}],
  //_videos: [{videoID: String}],
  _creators: [{creatorID: String}]
});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('Channel', schema);