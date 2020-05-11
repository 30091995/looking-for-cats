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

const nodemailer = require('nodemailer')

// SMTP 
let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'catvarificationapp@gmail.com',
    pass: 'myAwesomepassword22',
  }
});




//POST : This one add the data taken from the form to the DATABASE 

router.post('/signup', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  // creates a 4 digit random token
  const tokenArr = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10))
  const token = tokenArr.join(''); // 6 digits

  transporter.sendMail({
    from: '"My Awesome Project " <myawesome@project.com>',
    to: email,
    subject: 'Subject',
    text: `Hey, thanks for joining the cat app! Click the link to confirm your mail adress: http://localhost:3000/verify-email-link/${token}`,
    html: `Hey, thanks for joining the cat app! Click the link to confirm your mail adress: http://localhost:3000/verify-email-link/${token}`

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



router.get('/verify-email-link/:token', ensureLogin.ensureLoggedIn(), (req, res) => {
  if (req.user.token === req.params.token) {
    req.user.verifiedEmail = true
    req.user.save().then(() => {
      // res.redirect to an entire page later
      res.redirect('/profile/viewprofile')
    })
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



module.exports = router;