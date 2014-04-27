'use strict';
/**/

var routeFactory = require('./routeGenerator').routeFactory;

module.exports = function(app){
  //routeFactory('', '', app);
  routeFactory('/api/v1/users', '../models/User', app);
  routeFactory('/api/v1/channels', '../models/Channel', app);
  routeFactory('/api/v1/creator', '../models/Creator', app);
};