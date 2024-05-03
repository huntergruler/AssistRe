require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database connection setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to the database');
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});
// Route to display the registration form
app.get('/launch', (req, res) => {
  db.query('SELECT * FROM UserTypes', (err, result) => {
    if (err) throw err;
    res.send(`
      <form action="/register" method="post">
        <select name="usertype">${result.map(u => `<option value="${u.usertypeid}">${u.usertype}</option>`)}</select>
        <input type="text" name="firstname" placeholder="First Name" required />
        <input type="text" name="lastname" placeholder="Last Name" required />
        <input type="text" name="address" placeholder="Address" required />
        <input type="text" name="zip" placeholder="ZIP Code" onblur="fetchCityState(this.value)" required />
        <input type="text" name="city" placeholder="City" readonly />
        <input type="text" name="state" placeholder="State" readonly />
        <input type="email" name="email" placeholder="Email" required />
        <input type="text" name="phonenumber" placeholder="(XXX)XXX-XXXX" required />
        <input type="password" name="password" placeholder="Password" required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" required />
        <button type="submit">Register</button>
      </form>
      <script>
        function fetchCityState(zip) {
          fetch('/zipcode/' + zip)
            .then(response => response.json())
            .then(data => {
              document.querySelector('input[name="city"]').value = data.city;
              document.querySelector('input[name="state"]').value = data.state;
            });
        }
      </script>
    `);
  });
});

// Route to handle registration
app.post('/register', [
  body('email').isEmail(),
  body('phonenumber').matches(/\(\d{3}\)\d{3}-\d{4}/),
  body('password').custom((value, { req }) => {
    if (value !== req.body.confirmPassword) {
      throw new Error('Password confirmation does not match password');
    }
    return true;  // Always return true if validation passes
  })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { usertype, firstname, lastname, address, city, state, zip, email, phonenumber, password } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) throw err;
    const verificationToken = require('crypto').randomBytes(16).toString('hex');
    const userData = { usertype, firstname, lastname, address, city, state, zip, email, phonenumber, username: email, emailverified: 0, verificationtoken: verificationToken, password: hashedPassword };

    db.query('INSERT INTO Users SET ?', userData, (err, result) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      sendVerificationEmail(req, email, verificationToken);
      res.send('Registration successful! Please check your email to verify.');
    });
  });
});

// Function to send a verification email
function sendVerificationEmail(req, email, token) {
  const mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailDetails = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify your email address',
    html: `Please click on this link to verify your email: <a href="http://${req.headers.host}/verify-email?token=${token}&email=${email}">Verify Email</a>`
  };

  mailTransporter.sendMail(mailDetails, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Verification email sent:', info.response);
    }
  });
}


// Route to handle email verification
app.get('/verify-email', (req, res) => {
  const { token, email } = req.query;
  db.query('UPDATE Users SET emailverified = 1 WHERE email = ? AND verificationtoken = ?', [email, token], (err, result) => {
    if (err) return res.status(500).send('Database error during email verification.');
    if (result.affectedRows === 0) return res.status(404).send('Token not found or email already verified.');
    res.send('Email successfully verified!');
  });
});

// Route to fetch city and state based on ZIP code
app.get('/zipcode/:zip', (req, res) => {
  db.query('SELECT city, state FROM ZipCodes WHERE zip = ?', [req.params.zip], (err, result) => {
    if (err) return res.status(500).send(err.message);
    if (result.length === 0) return res.status(404).send('ZIP code not found.');
    res.json(result[0]);
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});