'use strict';
/**/

var mongoose = require('mongoose');
var setupModel = require('./models').setupModel;

var schema = new mongoose.Schema({
  name: String,
  local: {
    owners: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
  }
});

//delete the local vars and __v
setupModel(schema);

module.exports = mongoose.model('Tag', schema);