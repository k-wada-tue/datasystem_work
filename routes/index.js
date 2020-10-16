const express = require('express');
const router = express.Router();

const metadata = require('../models/metadata');

//TODO: Perhaps, need more efficient ways to organize directories...
const directory = require("../models/directories");
const css = directory.css;
const js = directory.js;
const img = directory.img;
const avtimg = directory.avtimg;
const dtimg = directory.dtimg;
const dt =  directory.dt;

const auth = require("../middleware/auth");

/* Display publicly accessible data */
let data;
async function displayMetadata() {
  try {
    data = await metadata
      .find({})
      .populate('contributor', '_id name organization avatar')//Join metadata with users' data 
      .sort({title: 1})
      .exec(function (err, results) {
        if (err) return handleError(err);
        data = results;
    });
    return data
  } catch (err) {
    return handleError(res, err);
  }
} displayMetadata();


// Assign URLs
//TODO: now "username" is set "undefined" to prevent errors. username has to be assigned if users are login. Therefore, it needs some valuable to check login condition (search for cookies?) and if true, it returns user info includes user name.
//TODO: Check if this structure is ok/efficient
router.get('/', (async (req, res, next) => { //Top page
    try{
      await displayMetadata;
      res.render('index.ejs',{data: data, css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined}); 
    } catch (err) { next(err);}
}))
.get('/user/login', (req, res) => { //User login page
    try{
      res.render('user/login.ejs',{messageUser: undefined, messagePassword: undefined, messageError: undefined, successMessage: undefined, css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined}); 
    } catch (err) { next(err);}
})
.get('/user/success', (req, res) => {
    try{
      res.render('user/success.ejs',{css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined}); 
    } catch (err) { next(err);}
})
.get('/user/signup', (req, res) => { //User signup page
  try{
    res.render('user/signup.ejs',{messageName: undefined, messageUser: undefined, messagePassword: undefined, messageError: undefined, css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined}); 
  } catch (err) { next(err);}
})
//The followings are the individual page for map-based data visualizations
//mp1
.get('/visualizations/5de59e378da07a1aafe0ddf4', (async (req, res, next) => {
    try{
      await displayMetadata;
      res.render('visualizations/5de59e378da07a1aafe0ddf4',{data: data,css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined}); 
    } catch (err) { next(err);}
}))
//mp2
.get('/visualizations/5deed118b14cc01493360222', (async (req, res, next) => {
    try{
      await displayMetadata;
      res.render('visualizations/5deed118b14cc01493360222',{data: data,css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined}); 
    } catch (err) { next(err);}
}))
//mp3
.get('/visualizations/5df0acbfa144f7093d6a0a8c', (async (req, res, next) => {
    try{
      await displayMetadata;
      res.render('visualizations/5df0acbfa144f7093d6a0a8c',{data: data,css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined}); 
    } catch (err) { next(err);}
}))//mp4
.get('/visualizations/5df0aef161ba510966339670', (async (req, res, next) => {
    try{
      await displayMetadata;
      res.render('visualizations/5df0aef161ba510966339670',{data: data,css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined}); 
    } catch (err) { next(err);}
}))
//mp5
.get('/visualizations/5dfcd0fcd91a5709e379fbe9', (async (req, res, next) => {
    try{
      await displayMetadata;
      res.render('visualizations/5dfcd0fcd91a5709e379fbe9',{data: data,css: css, js: js, img: img, avtimg: avtimg, dtimg: dtimg, dt: dt, username: undefined}); 
    } catch (err) { next(err);}
}));

module.exports = router;
