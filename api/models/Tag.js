'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  name: String,
  description: String,
  contact:{
    youTube: String,
    email: String,
    twitter: String,
    facebook: String
  }
});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('Tag', schema);