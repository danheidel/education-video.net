'use strict';
/*global angular*/
/*global _*/

angular.module('educationApp.controllers', [])

.controller('channelListController', function ($scope, $rootScope, $http, $filter){
  $http.get('api/v1/channels').success(function(data){
    $scope.baseChannels = data;

    filterChannelData($scope.filter);
    //call manually since initial window resize occurs before async return
    splitChannelData($rootScope.windowAttr.columns);
  });

  $scope.$on('columnChange', function(){
    //window resize requires changing column number
    console.log('change detected');
    splitChannelData($rootScope.windowAttr.columns);
    $scope.$apply();
  });

  $scope.$watch('filter', function(newVal){
  //the filters are changed
    filterChannelData(newVal);
    //re-run split for new data
    splitChannelData($rootScope.windowAttr.columns);
  }, true);

  function filterChannelData(filter){
    if(filter){
      $scope.filteredChannels = $filter('looseCreatorComparator')($scope.baseChannels, filter.creators);
      $scope.filteredChannels = $filter('looseTagComparator')($scope.filteredChannels, filter.tags);
    } else {
      $scope.filteredChannels = $scope.baseChannels;
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
})

.controller('accountController', function($scope, $rootScope, $http){
  $scope.formLoginUser = function(form){
    if(form.$invalid){
      console.log('invalid login form');
      return;
    }
    $scope.loginUser($scope.login.email, $scope.login.password);
  };
  $scope.loginUser = function(email, password){
    $http.post('login', {
      email: email,
      password: password
    })
    .success(function(data){
      console.dir(data);
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