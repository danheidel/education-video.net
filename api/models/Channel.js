'use strict';
/**/

var mongoose = require('mongoose');

var schema = new mongoose.schema({
  name: String,
  location: String,
  description: String,
  tags: [{name: String, ref: 'Tag'}],
  _creator: {type: String, ref: 'Creator'},
});

module.exports = mongoose.model('Channel', schema);