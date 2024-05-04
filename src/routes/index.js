require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

// Database connection setup
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  // test the connection
  db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database');
  });

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Landing page route
router.get('/', (req, res) => {
  res.render('index');
});

// Login route
router.get('/login', (req, res) => {
  res.render('login');
});

// Register route
router.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration with city and state lookup
router.post('/register', (req, res) => {
    const { firstName, lastName, email, phoneNumber, zipCode, userType } = req.body;
  
    // First, query the city and state from the ZipCodes table
    const zipQuery = 'SELECT city, state FROM ZipCodes WHERE zipCode = ?';
    db.query(zipQuery, [zipCode], (error, results) => {
      if (error) {
        return res.status(500).send('Error accessing the database');
      }
      if (results.length === 0) {
        return res.status(404).send('Zip code not found');
      }
      
      const { city, state } = results[0];

      const verificationtoken = require('crypto').randomBytes(16).toString('hex');
      // Now insert the user into the Users table with city and state
      const userInsertSql = 'INSERT INTO Users (firstName, lastName, email, verificationtoken, phoneNumber, zip, city, state, usertype, username) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(userInsertSql, [firstName, lastName, email, verificationtoken, phoneNumber, zipCode, city, state, userType,email], (userError, userResults) => {
        if (userError) {
            console.error('Error inserting user into database:', userError);
            return res.status(500).send('Error inserting user into database');
        }
        
      // Send confirmation email
      sendVerificationEmail(req, email, verificationtoken);
      res.send('Registration successful! Please check your email to verify.');
 
      });
    });
  });
  
// Route to get city and state by zip code
router.get('/get-city-state', (req, res) => {
  const zipCode = req.query.zipCode;
  if (!zipCode) {
      return res.status(400).json({error: 'Zip code is required'});
  }

  const query = 'SELECT city, state FROM ZipCodes WHERE zipCode = ?';
  db.query(query, [zipCode], (error, results) => {
      if (error) {
          return res.status(500).json({error: 'Internal server error'});
      }
      if (results.length > 0) {
          const { city, state } = results[0];
          res.json({ city, state });
      } else {
          res.status(404).json({error: 'No data found for this zip code'});
      }
  });
});
// Route to check if user exists
router.get('/check-user', (req, res) => {
  const username = req.query.username;
  if (!username) {
      return res.status(400).json({error: 'User Name is required'});
  }
  const query = 'SELECT count(*) cnt FROM Users WHERE username = ?';
  db.query(query, [username], (error, results) => {
      if (error) {
          return res.status(500).json({error: 'Internal server error'});
      }

      if (results[0].cnt > 0) {
        // User Name is already taken
        res.json({ available: false });
      } else {
        // User Name is available
        res.json({ available: true });
      }
  });
});

// Password reset route
router.get('/reset', (req, res) => {
  res.render('reset');
});

// Handle password reset
router.post('/reset', (req, res) => {
  const email = req.body.email;
  // Send reset email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    text: 'Please reset your password by clicking on this link: [reset link]'
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.send('Reset email sent');
});

// Route to handle email verification
router.get('/verify-email', (req, res) => {
    const { token, email } = req.query;
    db.query('UPDATE Users SET emailverified = 1 WHERE email = ? AND verificationtoken = ?', [email, token], (err, result) => {
      if (err) return res.status(500).send('Database error during email verification.');
      if (result.affectedRows === 0) return res.status(404).send('Token not found or email already verified.');
      res.send('Email successfully verified!');
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
  
module.exports = router;
