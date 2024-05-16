require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();
const nodemailer = require('nodemailer');
const cookierParser = require('cookie-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const saltRounds = 10; // The cost factor controls how much time is needed to calculate a single bcrypt hash.


const indexRouter = require('./routes/index');
//const profileRouter = require('./routes/profile');

// Ensure you have body-parser configured to parse JSON
router.use(bodyParser.json());
router.use(express.json());
router.use(cookierParser());


// Set up session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // set to true if you're using HTTPS
    maxAge: 1000 * 60 * 15 // sets the cookie to expire after 15 minutes
}
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.session._garbage = Date();
  req.session.touch();
  next();
});

// Use routes
app.use('/', indexRouter);
app.use('/', profileRouter);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
