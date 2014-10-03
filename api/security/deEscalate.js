'use strict';

module.exports.startup = function(){
  var user, port;
  console.log('starting as user: ' + process.env.USER);
  console.log('specified user: ' + (process.env.NODEUSERID || parseInt(process.argv[2])));
  console.log('specified port: ' + (process.env.NODESERVERPORT || parseInt(process.argv[3])));

  user = parseInt(process.env.NODEUSERID) || parseInt(process.argv[2]);
  if(!user){
    console.error('no user specified, exiting');
    process.exit();
  }

  //attempt to de-escalate user permissions
  try {
    process.setgid(user);
    process.setuid(user);
  } catch (e) {
    console.error('problem setting user/group, exiting');
    console.dir(e);
    process.exit();
  }
  console.log('user changed to: ' + user);

  port = parseInt(process.env.NODESERVERPORT) || parseInt(process.argv[3]);
  if(!port){
    console.error('no port defined, exiting');
    process.exit();
  }
  return {
    user: user,
    port: port
  };
};
