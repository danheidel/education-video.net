'use strict';

var restServices = angular.module('restServices', ['ngResource']);

restServices.factory('Channels', ['$resource', function($resource){
  return($resource('channels.json', {}, {
    query: {method: 'GET', isArray: true}
  }));
}]);