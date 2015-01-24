'use strict';
/*global angular*/
/*global _*/

angular.module('educationApp.config', ['educationApp.services'])

.config(['$routeProvider', function($routeProvider){}])

.run(function($window, $rootScope, loginServices){
  angular.element($window).bind('resize', function(){
    getWindowAttrs();
  });
  $rootScope.user = {};
  $rootScope.user.name = 'Not logged in';
  $rootScope.user.valid = false;
  $rootScope.user.isAdmin - false;
  loginServices.checkIfLoggedIn(function(err, data){
    if(err){
      console.log(err);
    } else {
      $rootScope.user.name = data.displayName;
      $rootScope.user.valid= true;
      $rootScope.user.isAdmin = data.isAdmin;
    }
  })

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
