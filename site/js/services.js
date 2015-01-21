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
      callback(null, data);
    });
  }

  return {
    channels: channels,
    getAllChannels: getAllChannels
  };
})

.service('creatorServices', function($http){
  var creators = [];

  function getAllCreators(callback){
    $http({
      method: 'GET',
      url: 'api/v1/creators'
    }).success(function(data){
      creators = data;
      callback(null, data);
    });
  }

  return {
    creators: creators,
    getAllCreators: getAllCreators
  }
})

.service('tagServices', function($http){
  var tags = [];

  function getAllTags(callback){
    $http({
      method: 'GET',
      url: 'api/v1/tags'
    }).success(function(data){
      tags = data;
      callback(null, data);
    });
  }

  return {
    tags: tags,
    getAllTags: getAllTags
  }
})

.service('ytServices', function($http){
  var ytChannels = [];

  function getAllYTChannels(callback){
    $http({
      method: 'GET',
      url: 'api/v1/ytchannels'
    }).success(function(data){
      ytChannels = data;
      callback(null, data);
    })
  }

  return {
    ytChannels: ytChannels,
    getAllYTChannels: getAllYTChannels
  }
})

.service('userServices', function($http){
  function loginUser(email, password, callback){
    $http.post('login', {
      email: email,
      password: password
    })
    .success(function(data){
      callback(null, data);
    });
  }

  function logoutUser(callback){
    $http.get('logout')
    .success(function(data){
      callback(null, data);
    });
  }

  function getUser(callback){
    $http.get('login')
    .success(function(data){
      callback(null, data);
    });
  }

  function editUserPassword(newPassword, oldPassword, callback){
    $http.put('api/v1/users', {
      newPassword: newPassword,
      oldPassword: oldPassword
    })
    .success(function(data){
      callback(null, data);
    })
    .error(function(data){
      callback(data, null);
    });
  }

  function submitNewUser(displayName, email, password, callback){
    $http.post('api/v1/users', {
      displayName: displayName,
      email: email,
      password: password
    })
    .success(function(data){
      callback(null, data);
    })
    .error(function(data){
      callback(data, null);
    });
  }

  return {
    loginUser: loginUser,
    logoutUser: logoutUser,
    getUser: getUser,
    editUserPassword: editUserPassword,
    submitNewUser: submitNewUser
  }
});

