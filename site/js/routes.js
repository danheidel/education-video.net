'use strict';
/*global angular*/

angular.module('educationApp.routes', [])

.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/', {
    templateUrl: 'panelview.html',
    controller: 'channelListController'
  });
}]);