const express = require('express');
const router = express.Router();
const axios = require ('axios');
const api_key = "052a7a0d-fec7-4c35-a488-83eaa0b03072"

//Middleware for authentication 

const ensureLogin = require('connect-ensure-login');

router.get('/filteringcats', ensureLogin.ensureLoggedIn(), (req, res) => {
    res.render('cats/filtering')
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
    console.log(filteredCats)
    res.render('cats/showcats', {cats :filteredCats})
  })
})



module.exports = router;