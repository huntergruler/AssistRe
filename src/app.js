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
  cookie: {
    secure: false, // set to true if you're using HTTPS
    maxAge: 1000 * 60 * 15 // sets the cookie to expire after 15 minutes
}
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.use((req, res, next) => {
  req.session._garbage = Date();
  req.session.touch();
  next();
});

// Use routes
app.use('/', indexRouter);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
