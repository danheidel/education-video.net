'use strict';
/*global angular*/
/*global _*/

angular.module('educationApp', ['ngAnimate'])

.controller('channelListController', function ($scope, $http){
  $http.get('api/v1/channels').success(function(data){
    $scope.channels = data;
  });
})

.directive('channelDrawers', function($window, $compile){
  return{
    restrict: 'E',
    //replace: true,
    scope: {
      channels: '='
    },
    controller: 'channelListController',
    compile: function(element, attr){
      angular.element($window).bind('resize', setWindowSize);
      setWindowSize();

      function setWindowSize(){
        var breakpoints = [
          {width: 0, columns: 1},
          {width: 510, columns: 2},
          {width: 850, columns: 3},
          {width: 1190, columns: 4},
          {width: 1530, columns: 5}
        ];
        var windowSize = $window.innerWidth, columns;
        console.log(windowSize);
        _.forEach(breakpoints, function(point){
          if(point.width <= windowSize){
            columns = point.columns;
          }
        });
        var tempHtml = '', tempElement;
        for(var rep=0;rep<columns;rep++){
          tempHtml +=
          '<div class="cabinet' + columns + '">' +
            '<div class="drawer" ng-class="{' + ((rep%2 === 0)?'even: $even, odd: $odd':'even: $odd, odd:$even') + '}" ng-repeat="channel in channels | looseCreatorComparator : query.creators | looseTagComparator : query.tags | modulusFilter : ' + columns + ' : ' + rep + '">' +
              '<ng-include src="\'drawer.html\'"></ng-include>' +
            '</div>' +
          '</div>';
        }
        console.log(tempHtml);
        tempElement = angular.element(tempHtml);
        element.after(tempElement).remove();

        return function(scope, element, attr){
          $compile(tempElement)(scope);
        };
      }
    }
  };
})

.directive('channelPanel', [function(){
  return{
    restrict: 'E',
    replace: true,
    scope: {
      channel: '=',
      columns: '='
    },
    link: function(scope, element, attr){
      var template = '<div class="drawer" ng-class="{even: $even, odd: $odd}" ng-repeat="channel in channels | looseCreatorComparator : query.creators | looseTagComparator : query.tags | modulusFilter : 3 : 0"><ng-include src="\'drawer.html\'"></ng-include></div>';
    }
  };
}])

.filter('looseCreatorComparator', function(){
  return function(object, query){
    if(!query){
      //if no query, match all
      return object;
    } else {
      var retObject = [];
      var lcQuery = query.toLowerCase();
      var addMe;
      for(var rep=0;rep<object.length;rep++){
        addMe = false;
        for(var rep2=0;rep2<object[rep]._creators.length;rep2++){
          if(object[rep]._creators[rep2].name.toLowerCase().indexOf(lcQuery) != -1){
            addMe = true;
          }
        }
        if(addMe) { retObject.push(object[rep]); }
      }
      return retObject;
    }
  };
})

.filter('looseTagComparator', function(){
  return function(object, query){
    if(!query){
      //if no query, match all
      return object;
    } else {
      var retObject = [];
      var lcQuery = query.toLowerCase();
      var addMe;
      for(var rep=0;rep<object.length;rep++){
        addMe = false;
        for(var rep2=0;rep2<object[rep]._tags.length;rep2++){
          if(object[rep]._tags[rep2].name.toLowerCase().indexOf(lcQuery) != -1){
            addMe = true;
          }
        }
        if(addMe) { retObject.push(object[rep]); }
      }
      return retObject;
    }
  };
})

.filter('modulusFilter', function(){
  return function(object, mod, remainder){
    if(mod === 1){
      return object;
    } else {
      var retObject = [];
      for(var rep=0;rep<object.length;rep++){
        if(rep % mod == remainder){
          retObject.push(object[rep]);
        }
      }
      return retObject;
    }
  };
});