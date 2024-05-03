require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const indexRouter = require('./routes/index');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/', indexRouter);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
