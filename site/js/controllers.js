'use strict';
/*global angular*/
/*global _*/

angular.module('educationApp.controllers', ['educationApp.services'])

.controller('channelListController', function ($scope, $rootScope, $http, $filter, channelSevices,
  tagServices){

  $scope.$on('columnChange', function(){
    //window resize requires changing column number
    splitChannelData($rootScope.windowAttr.columns);
    $scope.$apply();
  });

  $scope.$watch('filter', function(newVal){
  //the filters are changed
    filterChannelData(newVal);
    //re-run split for new data
    splitChannelData($rootScope.windowAttr.columns);
  }, true);

  function filterChannelData(baseChannels, filter){
    if(filter){
      $scope.filteredChannels = $filter('looseCreatorComparator')(baseChannels, filter.creators);
      $scope.filteredChannels = $filter('looseTagComparator')($scope.filteredChannels, filter.selectedTag);
    } else {
      $scope.filteredChannels = baseChannels;
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

  channelSevices.getAllChannels(function(data){
    filterChannelData(data, $scope.filter);
    splitChannelData($rootScope.windowAttr.columns);
  });

  tagServices.getAllTags(function(data){
    //console.log(tagServices.tags);
    $scope.tags = data;
  });
})

.controller('accountController', function($scope, $rootScope, $http, userServices){
  $scope.login = {};
  $scope.formLoginUser = function(form){
    if(form.$invalid){
      console.log('invalid login form');
      return;
    }
    //$scope.loginUser($scope.login.email, $scope.login.password);
    userServices.loginUser($scope.login.email, $scope.login.password, function(data){
      console.dir(data);
      $rootScope.user = {};
      if(data.displayName){
        $rootScope.user.name = data.displayName;
        $rootScope.user.valid = true;
      } else {
        $rootScope.user.name = 'Not logged in';
        $rootScope.user.valid = false;
      }
      console.log($rootScope.user);
    })
  };
  $scope.loginUser = function(email, password){
    $http.post('login', {
      email: email,
      password: password
    })
    .success(function(data){
      console.dir(data);
      $rootScope.user = {};
      if(data.displayName){
        $rootScope.user.name = data.displayName;
        $rootScope.user.valid = true;
      } else {
        $rootScope.user.name = 'Not logged in';
        $rootScope.user.valid = false;
      }
    });
  };
  $scope.getUser = function(){
    $http.get('login')
    .success(function(data){
      console.dir(data);
      console.dir($rootScope.user);
      if(data.displayName){
        $rootScope.user.name = data.displayName;
        $rootScope.user.valid = true;
      } else {
        $rootScope.user.name = 'Not logged in';
        $rootScope.user.valid = false;
      }
    });
  };
  $scope.logoutUser = function(){
    $http.get('logout')
    .success(function(data){
      console.dir(data);
    });
  };
  $scope.editUserPassword = function(form){
    if(form.$invalid){
      console.log('invalid user password change form)');
      return;
    }
    $http.put('api/v1/users', {
      password: $scope.user.password
    })
    .success(function(data){
      console.dir(data);
    });
  };
  $scope.submitNewUser = function(form){
    if(form.$invalid){
      console.log('invalid new user form');
      return;
    }
    $http.post('api/v1/users', {
      displayName: $scope.user.displayName,
      email: $scope.user.email,
      password: $scope.user.password
    })
    .success(function(data){
      console.dir(data);
      $scope.loginUser($scope.user.email, $scope.user.password)
      .success(function(data){
        console.dir(data);
      });
    });
  };
});
