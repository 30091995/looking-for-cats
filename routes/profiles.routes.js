const express = require('express');
const router = express.Router();
const axios = require ('axios');
// Require user model

const User = require('../models/User.model')

//Middleware for authentication 

const ensureLogin = require('connect-ensure-login');


router.post("/removefavourite/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
  User.update({ _id : req.user.id } , { $pull : { favourite_cats : req.params.id }})
  .then(() => {
    res.redirect("/profile/viewprofile")
  })
})

router.get('/viewprofile', ensureLogin.ensureLoggedIn(), (req, res) => {
  User.findById(req.user.id).then((user) => {
      let promises=user.favourite_cats.map((id) => {
      return axios.get('https://api.thecatapi.com/v1/images/search?breed_ids=' + id)
    })

    Promise.all(promises).then((fetchedCats) => {
      let cats=fetchedCats.map((c) => c.data)
      console.log(cats)
      res.render('profiles/viewprofile', { cats : cats})
    })

  })

})










module.exports = router;