const express = require('express');
const router = express.Router();
const axios = require ('axios');
const api_key = "052a7a0d-fec7-4c35-a488-83eaa0b03072"
const User = require('../models/User.model')

//Middleware for authentication 

const ensureLogin = require('connect-ensure-login');


router.get('/filteringcats/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
  axios.get('https://api.thecatapi.com/v1/images/search?breed_ids=' + req.params.id).then((cat) => {
    console.log(cat.data[0].breeds[0])
    res.render('cats/catdetails', {cat : cat.data[0].breeds[0] , pic : cat.data[0] , loggedIn: req.sessionID })
  })
})



router.post('/filteringcats/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
  User.findByIdAndUpdate(req.user.id ,
    { $push : { favourite_cats : req.params.id}}
    )
  .then(() => {
    res.redirect('/private/filteringcats')
  })
})



router.get('/filteringcats', ensureLogin.ensureLoggedIn(), (req, res) => {
    res.render('cats/filtering', {loggedIn: req.sessionID})
})



router.post('/filteringcats', ensureLogin.ensureLoggedIn(), (req, res) => {
  let filteredCats = []
  axios.get('https://api.thecatapi.com/v1/breeds?api_key=' + api_key).then((fetchedCats) => {
    fetchedCats.data.forEach(cat => {
    if((cat.adaptability == req.body.adaptability) || (cat.affection_level == req.body.affectionLevel) || (cat.dog_friendly == req.body.dogFriendly) || (cat.intelligence == req.body.intelligence) || (cat.rare == req.body.rare))
    {
      filteredCats.push(cat)
    }
    });
    res.render('cats/showcats', {cats :filteredCats, loggedIn: req.sessionID})
  })
})





module.exports = router;