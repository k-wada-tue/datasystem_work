#! /usr/bin/env node --harmony
'use strict';

//TODO: Organize app.js file better

//modules
const express = require('express');
const createError = require('http-errors');
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');

// Establish connection to mongoDB
const InitiateMongoServer = require("./config/db");
// Initiate Mongo Server
InitiateMongoServer();

// Set port
const port = process.env.PORT || 3000;

// Create an application
const app = express();

//Enables to use moment.js in templates
app.locals.moment = require('moment');


//TODO: move this block of code related to real-time data to different files
//TODO: Need proper error handling when there are issues with API

//Socket io
const http = require('http').createServer(app);

//Air Quality real-time data
const airQuality = require('./models/airboxes');

/* Generate real time air quality data by socket.io */
http.listen(port, () => console.log(`Listening on ${port}`));

airQuality.abJson.then(()=> {

  console.log('awaited');
  //Manage connections
  io.sockets.on('connection', function(socket) {

      var intervals = 1500;
      var timeoutId = -1;

      /**
       * Handle "disconnect" events.
       */
      var handleDisconnect = function() {
          console.log('handle disconnect');
          clearTimeout(timeoutId);
      };

      //Generate a request to be sent to the client.
       
      var generateServerRequest = function() {
          console.log('generate server request');
          socket.emit('server request', {
          data: airQuality.airboxes, 
          status: airQuality.dataLoaded
          });
          timeoutId = setTimeout(generateServerRequest, intervals);
      };

      socket.on('disconnect', handleDisconnect);

      timeoutId = setTimeout(generateServerRequest, intervals);
  });
});


// Routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user');
const uploadRouter = require('./routes/upload');

// View engine setup
app.set('views', path.join(__dirname, 'views'));

// Set view engine as EJS
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

// TODO: check the followings and see if there are any unnecessary ones
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use cookie to store token for user authentication
app.use(cookieParser());

// path to the static files: css, javascrip and also raw data* *only for now...raw data has to be stored in the secure database with backup 
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter); //index page
app.use('/user', usersRouter); //for login, signup and personal page
app.use('/user/me', uploadRouter); //user's page (only upload page for now)



//catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;