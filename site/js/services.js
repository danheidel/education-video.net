'use strict';
/*global angular*/

angular.module('educationApp.services', [])

.factory('channelApi', function($http){
  var baseUrl = 'localhost:3000';
  //var baseUrl = 'education-video.net';
  var apiUrl = '/api/v1';
})

.service('channelSevices', function($http, $filter){
  var channels = [];
  var filteredChannels = [];

  function getAllChannels(){
    $http.get('api/v1/channels').success(function(data){
      channels = data;
    });
  }

  function filterChannelData(filter){
    if(filter){
      filteredChannels = $filter('looseCreatorComparator')(channels, filter.creators);
      filteredChannels = $filter('looseTagComparator')(filteredChannels, filter.selectedTag);
    } else {
      filteredChannels = channels;
    }
  }

  function splitChannelData(columns){
    if(columns){
      $scope.splitChannels = [];
      for(var rep=0;rep<columns;rep++){
        $scope.splitChannels.push([]);
      }
      _.forEach($scope.filteredChannels, function(channel, index){
        $scope.splitChannels[index % columns].push(channel);
      });
    }
  }

  return {
    channels: channels,
    getAllChannels: getAllChannels
  };
})

.service('tagServices', function($http){

});

