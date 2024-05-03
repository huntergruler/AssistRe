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

// Handle registration
router.post('/register', (req, res) => {
  const { firstName, lastName, email, phoneNumber, zipCode, userType } = req.body;
  // Query to insert user into database
  const verificationToken = require('crypto').randomBytes(16).toString('hex');
  const sql = 'INSERT INTO Users (firstName, lastName, email, verificationtoken, phoneNumber, zip, userType) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [firstName, lastName, email, verificationToken, phoneNumber, zipCode, userType], (error, results) => {
    if (error) throw error;

    // Send confirmation email
    sendVerificationEmail(req, email, verificationToken);
    res.send('Registration successful! Please check your email to verify.');
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
app.get('/verify-email', (req, res) => {
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
