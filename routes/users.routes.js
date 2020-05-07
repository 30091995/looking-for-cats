const express = require('express');
const router = express.Router();
// Require user model

const User = require('../models/User.model')

// Add bcrypt to encrypt passwords
const bcrypt = require('bcrypt');
const bcryptSalt = 10;

// Add passport

const passport = require('passport')

const ensureLogin = require('connect-ensure-login');

router.get('/private-page', ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render('users/private', { user: req.user });
});

//GET : This one render the form to add the data for sign up and log in !

router.get('/signin', (req, res) => {
  res.render('users/signin')
})


//POST : This one checks if the user really exists in the DATABASE

router.post('/login', passport.authenticate('local', {
  successRedirect: '/private/filteringcats', // pick up the redirectBackTo parameter and after login redirect the user there. ( default / )
  failureRedirect: '/signin',
  //failureFlash: true,
  //passReqToCallback: true
}))


//POST : This one add the data taken from the form to the DATABASE 

router.post('/signup', (req, res) => {
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(req.body.password, salt);
  let user = new User({ username: req.body.username , password : hashPass , email : req.body.email})
  user.save().then(() => {
    res.redirect('/signin')
  })

})

//  GET: Logging in w google
router.get(
  "/users/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  })
);
router.get(
  "/users/google/callback",
  passport.authenticate("google", {
    successRedirect: "/private/filteringcats",
    failureRedirect: "/signin" // here you would redirect to the login page using traditional login approach
  })
);



module.exports = router;