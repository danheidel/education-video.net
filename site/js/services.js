'use strict';
/*global angular*/

var apiUrl = '/api/v1/';

angular.module('educationApp.services', [])

.service('channelServices', function($http){
  var channels;

  function getAllChannels(callback){
    $http.get(apiUrl + 'channels')
    .success(function(data){
      channels = data;
      callback(null, data);
    });
  }

  function createChannel(name, creators, tags, ytURL, callback){

  }

  return {
    channels: channels,
    getAllChannels: getAllChannels,
    createChannel: createChannel
  };
})

.service('creatorServices', function($http){
  var creators = [];

  function getAllCreators(callback){
    $http.get(apiUrl + 'creators')
    .success(function(data){
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
    $http.get(apiUrl + 'tags')
    .success(function(data){
      tags = data;
      callback(null, data);
    });
  }

  function createTag(tagName, callback){
    $http.post(apiUrl + 'tags', {
      'name': tagName
    }).success(function(data){
      callback(null, data);
    }).error(function(data){
      callback(data, null);
    })
  }

  function checkForTag(tagName, callback){
    $http.get(apiUrl + 'tags/query?name=' + tagName)
    .success(function(data){
      callback(null, data);
    })
    .error(function(data){
      callback(data, null);
    })
  }

  return {
    tags: tags,
    getAllTags: getAllTags,
    createTag: createTag,
    checkForTag: checkForTag
  }
})

.service('ytServices', function($http){
  var ytChannels = [];

  function getAllYTChannels(callback){
    $http.get(apiUrl + 'ytchannels')
    .success(function(data){
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
    $http.put(apiUrl + 'users', {
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
    $http.post(apiUrl + 'users', {
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

  function checkIfLoggedIn(callback){
    $http.get('/login')
    .success(function(data){
      if(data.displayName){
        callback(null, data);
      } else {
        //no user identity
        callback({error: 'Not logged in'}, null);
      }
    })
    .error(function(data){
      callback(data, null);
    })
  }

  return {
    loginUser: loginUser,
    logoutUser: logoutUser,
    getUser: getUser,
    editUserPassword: editUserPassword,
    submitNewUser: submitNewUser,
    checkIfLoggedIn: checkIfLoggedIn
  }
});

