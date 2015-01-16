'use strict';
/*global angular*/

var apiUrl = '/api/v1';

angular.module('educationApp.services', [])

.service('channelSevices', function($http){
  var channels;

  function getAllChannels(callback){
    $http({
      method: 'GET',
      url: 'api/v1/channels'
    }).success(function(data){
      channels = data;
      callback(data);
    });
  }

  return {
    channels: channels,
    getAllChannels: getAllChannels
  };
})

.service('tagServices', function($http){
  var tags = [];

  function getAllTags(callback){
    $http({
      method: 'GET',
      url: 'api/v1/tags'
    }).success(function(data){
      tags = data;
      callback(data);
    });
  }

  return {
    tags: tags,
    getAllTags: getAllTags
  }
})

.service('userServices', function($http){
  function loginUser(email, password, callback){
    $http.post('login', {
      email: email,
      password: password
    })
    .success(function(data){
      callback(data);
    });
  }

  return {
    loginUser: loginUser
  }
});

