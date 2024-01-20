'use strict';
// ================================================================
// get all the tools we need
// ================================================================
var express = require('express');
var routes = require('./public/routes/index.js');
var port = process.env.PORT || 3000;
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var api_routes = require('./public/routes/api_routes');
var bodyParser = require('body-parser');
var app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
var cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const router = require('./public/routes/api_routes');
dotenv.config();

const database = process.env.MONGOLAB_URI;
mongoose
  .connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log('mongoDB connect'))
  .catch((err) => console.log(err));
// ================================================================
// setup our express application
// ================================================================
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.static('uploads'));
app.use('/api', api_routes);
app.set('view engine', 'ejs');

app.use(cookieParser('SecretStringForCookies'));
app.use(bodyParser.json());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: 'XCR3rsasa%RDHHH',
    cookie: {
      maxAge: 60000,
    },
  })
);
app.use(flash());
// ================================================================
// setup routes
// ================================================================
routes(app);
// ================================================================
// start our server
// ================================================================
app.listen(port, function () {
  console.log('Server listening on port ' + port + '...');
});
