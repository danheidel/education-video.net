// app/routes.js
//jshint unused:false
'use strict';

module.exports = function(app, passport) {

  //process the login form
  app.post('/login', function(req, res, next){
    //console.log('app.post login');
    passport.authenticate('local-login', {
      // successRedirect : '/', // redirect to the secure profile section
      // failureRedirect : '/', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    }, function(err, user, info){
      if(user){
        req.login(user, function(err){
          if(err){
            console.log(err);
            return next(err);
          }
          return res.send(req.user);
        });
      } else {
        //!user, authentication failed
        res.send(info);
      }
      // console.dir('req.user');
      // console.log(req.user);
      //console.log('is authenticated? ' + req.isAuthenticated());
    })(req, res, next);
  });

  app.get('/login', function(req, res, next){
    res.send(req.user ? req.user : {message: 'unauthenticated'});
  });

  app.get('/logout', function(req, res) {
    if(!req.user){
      console.log('attempt to log out when not logged in');
      return res.send({message:'not logged in'});
    }
    var tempEmail = req.user.local.email;
    req.logout();
    console.log(tempEmail + ' was logged out');
    res.send({message: tempEmail + ' logged out'});
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/login');
}
