'use strict';

module.exports = function(global, callback){
  if(!global.userId){
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
  console.log('user changed to: ' + global.userId);

  callback();
};
