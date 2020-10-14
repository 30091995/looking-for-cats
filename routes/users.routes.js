const express = require('express');
const router = express.Router();
const flash = require('connect-flash');

// Require user model

const User = require('../models/User.model')

// Add bcrypt to encrypt passwords
const bcrypt = require('bcrypt');
const bcryptSalt = 10;

// Add passport

const passport = require('passport')

const ensureLogin = require('connect-ensure-login');

router.get('/private-page', ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render('users/', { user: req.user , loggedIn: req.sessionID });
});

//GET : This one render the form to add the data for sign up and log in !

router.get('/signin', (req, res) => {
  res.render('users/signin', {loggedIn: req.sessionID, message : req.flash('error')})//, flashMessages: req.flash('error')})
})


//POST : This one checks if the user really exists in the DATABASE

router.post('/login', passport.authenticate('local', {
  successRedirect: '/private/filteringcats', 
  failureRedirect: '/signin',
  failureFlash: true,
  passReqToCallback: true
}))

const nodemailer = require('nodemailer')

// SMTP 
let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    host: 'smtp.gmail.com',
    user: process.env.GMAIL_MAIL,
    pass: process.env.GMAIL_PASSWORD
  }
});




//POST : This one add the data taken from the form to the DATABASE 

router.post('/signup', (req, res) => {
  const username = req.body.username
  const email = req.body.email
  const password = req.body.password

  // creates a 4 digit random token
  const tokenArr = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10))
  const token = tokenArr.join(''); // 6 digits


  User.findOne({ username })
  .then(user => {
    if (user !== null) {
      req.flash('error','username already exists')
      res.redirect('/signin'); // the username already exists
      throw new Error('username already exists');
    }
    return User.findOne({ email })
  })
  .then((u) => {
    if (u !== null) {
      console.log("Email exists")
      req.flash('error','email already exists')
      res.redirect('/signin'); // the e-mail already exists
      throw new Error('email already exists');
    }
    return transporter.sendMail({
      from: '"The cat app " <myawesome@project.com>',
      to: email,
      subject: 'Email varification token',
      text: `Hey, thanks for joining the cat app! Click the link to confirm your mail adress: ${process.env.EMAIL_LINK}/${token}`,
      html: `Hey, thanks for joining the cat app! Click the link to confirm your mail adress: ${process.env.EMAIL_LINK}/${token}`
  
    })
  })
  .then(() => {
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(req.body.password, salt);


      let user = new User({ username: req.body.username, password: hashPass, email: req.body.email, token: token })
      user.save().then(() => {
        req.logIn(user, () => { res.redirect('/private/filteringcats') })

      })

    })
})



router.get(
  "/users/google/callback",
  passport.authenticate("google", {
    successRedirect: "/private/filteringcats",
    failureRedirect: "/signin" // here you would redirect to the login page using traditional login approach
  })
);



router.get('/verify-email-link/:token', ensureLogin.ensureLoggedIn("/signin"), (req, res) => {

  if (req.user.token === req.params.token) {
    req.user.verifiedEmail = true
    req.user.save().then(() => {
      // res.redirect to an entire page later
      res.redirect('/profile/viewprofile')
    })
  }
  else{
    res.send("something went wrong")
  }
})

/*router.get('/verify-email', (req, res) => {
  res.render('auth/verify')
})

router.post('/verify-email', (req, res) => {
  console.log(req.user)
  if (req.user.token === req.body.token) {
    req.user.verifiedEmail = true
    req.user.save().then(() => {
      // res.redirect to an entire page later
      res.send('successfully verified your email')
    })
  }
}) */

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

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/signin');
});




module.exports = router;