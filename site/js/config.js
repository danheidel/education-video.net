'use strict';
/*global angular*/
/*global _*/

angular.module('educationApp.config', [])

.config(['$routeProvider', function($routeProvider){}])

.run(function($window, $rootScope){
  angular.element($window).bind('resize', function(){
    getWindowAttrs();
  });

  var breakpoints = [
    {width: 0, columns: 1},
    {width: 580, columns: 2},
    {width: 850, columns: 3},
    {width: 1190, columns: 4},
    {width: 1530, columns: 5}
  ];
  $rootScope.windowAttr = {};

  var getWindowAttrs = function(){
    $rootScope.windowAttr.width = $window.innerWidth;
    $rootScope.windowAttr.height = $window.innerHeight;

    var tempColumn = _.findLast(breakpoints, function(point){
      return $rootScope.windowAttr.width >= point.width;
    });

    $rootScope.$emit('windowResize', $rootScope.windowAttr);

    if($rootScope.windowAttr.columns !== tempColumn.columns){
      $rootScope.windowAttr.columns = tempColumn.columns;
      $rootScope.$broadcast('columnChange', $rootScope.windowAttr);
      console.log('columns: ' + $rootScope.windowAttr.columns);
    }
  };
  getWindowAttrs();
});