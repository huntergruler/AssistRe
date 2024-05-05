require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const indexRouter = require('./routes/index');

// Set up session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // for development, set secure: true in production
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Use routes
app.use('/', indexRouter);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
