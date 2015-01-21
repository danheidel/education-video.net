'use strict';
/*global casper*/

casper.test.begin('home page', 3, function suite(test){
  casper.start('http://localhost:5000/', function(){
    test.assertHttpStatus(200);
  });

  casper.run(function(){
    test.done();
  });
});
