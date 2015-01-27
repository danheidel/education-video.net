'use strict';
/*global angular*/
/*global _*/

angular.module('educationApp.controllers', ['educationApp.services'])

.controller('channelListController', function ($scope, $rootScope, $filter, channelServices,
  tagServices){

  $scope.menu = {};
  $scope.menu.retracted = false;

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

  channelServices.getAllChannels(function(err, data){
    if(err){
      console.log(err);
    } else {
      filterChannelData(data, $scope.filter);
      splitChannelData($rootScope.windowAttr.columns);
    }
  });

  tagServices.getAllTags(function(err, data){
    if(err){
      console.log(err);
    } else {
      $scope.tags = data;
    }
  });
})

// .controller('channelEditController', function($scope, $rootScope, channelServices,
//   creatorServices, tagServices, ytServices){


// })

.controller('channelCreateController', function($scope, $rootScope, channelServices,
  creatorServices, tagServices, ytServices){
  $scope.newTag = {};
  $scope.newCreator = {};
  $scope.newYouTube = {};
  $scope.newChannel = {};

  $scope.$watch($scope.newTag, function(newVal){
    console.log(newVal);
  })

  $scope.formNewTag = function(form){
    if(form.$invalid){
      console.log('invalid login form');
      return;
    } else {
      tagServices.createTag($scope.newTag.name, function(err, data){
        if(err){
          console.log(err);
        } else {
          refreshTags();
        }
      })
    }
  }

  function refreshTags(){
    tagServices.getAllTags(function(err, data){
      if(err){
        console.log(err);
      } else {
        $scope.tags = data;
        console.log($scope.tags);
      }
    });
  }

  $scope.formNewCreator = function(form){
    if(form.$invalid){
      console.log('invalid login form');
      return;
    } else {
      creatorServices.createCreator($scope.newCreator, function(err, data){
        if(err){
          console.log(err);
        } else {
          refreshCreators();
        }
      });
    }
  }

  function refreshCreators(){
    creatorServices.getAllCreators(function(err, data){
      if(err){
        console.log(err);
      } else {
        $scope.creators = data;
        console.log(data);
      }
    });
  }
})

.controller('accountController', function($scope, $rootScope, $http, userServices){
  $scope.login = {};
  $scope.formLoginUser = function(form){
    if(form.$invalid){
      console.log('invalid login form');
      return;
    }
    //$scope.loginUser($scope.login.email, $scope.login.password);
    userServices.loginUser($scope.login.email, $scope.login.password, function(err, data){
      if(err){
        console.error(err);
      } else {
        console.dir(data);
        $rootScope.user = {};
        if(data.displayName){
          $rootScope.user.name = data.displayName;
          $rootScope.user.isAdmin = data.isAdmin;
          $rootScope.user.valid = true;
        } else {
          $rootScope.user.name = 'Not logged in';
          $rootScope.user.isAdmin = false;
          $rootScope.user.valid = false;
        }
        console.log($rootScope.user);
      }
    })
  };
  $scope.logoutUser = function(){
    userServices.logoutUser(function(err, data){
      if(err){
        console.log(err);
      } else {
        if(data.message){
          $rootScope.user.name = 'Not logged in';
          $rootScope.user.isAdmin = false;
          $rootScope.user.valid = false;
        }
      }
    });
  };
  $scope.getUser = function(){
    userServices.getUser(function(err, data){
      if(err){
        console.log(err);
      } else {
        if(data.displayName){
          $rootScope.user.name = data.displayName;
          $rootScope.user.isAdmin = data.isAdmin;
          $rootScope.user.valid = true;
        } else {
          $rootScope.user.name = 'Not logged in';
          $rootScope.user.isAdmin = false;
          $rootScope.user.valid = false;
        }
      }
    });
  };
  $scope.editUserPassword = function(form){
    if(form.$invalid){
      console.log('invalid user password change form)');
      return;
    }
    userServices.editUserPassword(newPassword, oldPassword, function(err, data){
      if(err){
        console.log(err);
      } else {
        console.log('password was sucessfully updated');
      }
    });
  };
  $scope.submitNewUser = function(form){
    if(form.$invalid){
      console.log('invalid new user form');
      return;
    }
    userServices.submitNewUser($scope.user.displayName, $scope.user.email, $scope.user.password, function(err, data){
      if(err){
        console.log('failed to create new user');
        console.log(err);
      } else {
        console.log(data);
        userServices.loginUser($scope.user.email, $scope.user.password, function(err, data){
          if(err){
            console.log('failed to log in as new user');
            $rootScope.user.name = 'Not logged in';
            $rootScope.user.valid = false;
          } else {
            if(data.displayName){
              $rootScope.user.name = data.displayName;
              $rootScope.user.valid = true;
            } else {
              $rootScope.user.name = 'Not logged in';
              $rootScope.user.valid = false;
            }
            console.log($rootScope.user);
          }
        });
      }
    });
  };
});
