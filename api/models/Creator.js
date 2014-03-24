'use strict';
/**/

var mongoose = require('mongoose');

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

module.exports = mongoose.model('Creator', schema);