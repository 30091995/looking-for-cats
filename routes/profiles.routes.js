const express = require('express');
const router = express.Router();
const axios = require('axios');
const cloudinary = require('cloudinary');
const Cat = require('../models/Cat.model')
const cloudinaryStorage = require('multer-storage-cloudinary');
// package to allow <input type="file"> in forms
const multer = require('multer');
// Require user model

const User = require('../models/User.model')

//Middleware for authentication 

const ensureLogin = require('connect-ensure-login');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

var storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'my-cats', // The name of the folder in cloudinary
  allowedFormats: ['jpg', 'png'],
  filename: function (req, file, cb) {
    cb(null, file.originalname); // The file on cloudinary would have the same name as the original file name
  }
});

const uploadCloud = multer({ storage: storage });


router.post("/removefavourite/:id", ensureLogin.ensureLoggedIn(), (req, res) => {
  User.update({ _id: req.user.id }, { $pull: { favourite_cats: req.params.id } })
    .then(() => {
      res.redirect("/profile/viewprofile")
    })
})

router.get('/viewprofile', ensureLogin.ensureLoggedIn(), (req, res) => {

  let promises = req.user.favourite_cats.map((id) => {
    return axios.get('https://api.thecatapi.com/v1/images/search?breed_ids=' + id)
  })

  let dbCatPromise = Cat.find({ owner: req.user.id })

  Promise.all([dbCatPromise, ...promises]).then((fetchedCats) => {
    let myCats = fetchedCats.shift()
    let cats = fetchedCats.map((c) => c.data)
    res.render('profiles/viewprofile', { myCats, cats, emailVarification: req.user.verifiedEmail, loggedIn: req.sessionID , googleID : req.user.googleID, name: req.user.username})
  })



})

router.post('/addcat',uploadCloud.single('my-photo'), (req, res) => {
  const imageURL = req.file.url;
  Cat.create({ name: req.body.name, description: req.body.description, imgUrl: imageURL, owner: req.user.id }).then((cat) => {
    res.redirect('/profile/viewprofile')
  })
})

router.post('/removemycat/:id', ensureLogin.ensureLoggedIn(), (req, res) => {
  Cat.findByIdAndDelete(req.params.id).then(() => {
    res.redirect('/profile/viewprofile')
  })
})










module.exports = router;