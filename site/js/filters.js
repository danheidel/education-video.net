'use strict';
/*global angular*/

angular.module('educationApp.filters', [])

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