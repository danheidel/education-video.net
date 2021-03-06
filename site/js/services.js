'use strict';
/*global angular*/

var apiUrl = '/api/v1/';

angular.module('educationApp.services', [])

.service('channelServices', function($http){
  var channels;

  function getAllChannels(callback){
    $http.get(apiUrl + 'stubchannels')
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

  function createCreator(newCreator, callback){
    console.log(newCreator);
    $http.post(apiUrl + 'creators', {
      name: newCreator.name,
      description: newCreator.description ? newCreator.description : '',
      website: newCreator.website ? newCreator.website : '',
      youTube: newCreator.youTube ? newCreator.youTube : '',
      email: newCreator.email ? newCreator.email : '',
      twitter: newCreator.twitter ? newCreator.twitter : '',
      facebook: newCreator.facebook ? newCreator.facebook : '',
      tumblr : newCreator.tumblr ? newCreator.tumblr : ''
    }).success(function(data){
      callback(null, data);
    }).error(function(data){
      callback(data, null);
    });
  }

  function checkForCreator(name, callback){
    $http.get(apiUrl + 'creators/query?lName=' + name.toLowerCase())
    .success(function(data){
      callback(null, data);
    }).error(function(data){
      callback(data, null);
    });
  }

  return {
    creators: creators,
    getAllCreators: getAllCreators,
    createCreator: createCreator,
    checkForCreator: checkForCreator
  };
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

  function createTag(tag, callback){
    $http.post(apiUrl + 'tags', {
      name: tag.name,
      category: tag.category
    }).success(function(data){
      callback(null, data);
    }).error(function(data){
      callback(data, null);
    });
  }

  function checkForTag(tag, callback){
    console.log(tag.name);
    if(!tag.name || !tag.category) { return; }
    $http.get(apiUrl + 'tags/query?lName=' + tag.name.toLowerCase() +
      '&category=' + tag.category.toLowerCase())
    .success(function(data){
      callback(null, data);
    })
    .error(function(data){
      callback(data, null);
    });
  }

  return {
    tags: tags,
    getAllTags: getAllTags,
    createTag: createTag,
    checkForTag: checkForTag
  };
})

.service('ytServices', function($http){
  var ytChannels = [];

  function getAllYTChannels(callback){
    $http.get(apiUrl + 'ytchannels')
    .success(function(data){
      ytChannels = data;
      callback(null, data);
    });
  }

  function createYTChannel(newYT, callback){

  }

  return {
    ytChannels: ytChannels,
    getAllYTChannels: getAllYTChannels
  };
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
    });
  }

  return {
    loginUser: loginUser,
    logoutUser: logoutUser,
    getUser: getUser,
    editUserPassword: editUserPassword,
    submitNewUser: submitNewUser,
    checkIfLoggedIn: checkIfLoggedIn
  };
});

