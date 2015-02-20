'use strict';
/*global globals*/

module.exports = function(global, callback){
  if(!globals.userId){
    console.error('no user specified, exiting');
    process.exit();
  }

  //attempt to de-escalate user permissions
  try {
    process.setgid(global.userId);
    process.setuid(global.userId);
  } catch (e) {
    console.error('problem setting user/group, exiting');
    console.dir(e);
    process.exit();
  }
  console.log('user changed to: ' + globals.userId);

  callback();
};
