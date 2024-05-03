const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mysql = require('mysql');

// MySQL connection
const pool = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASS,
  database        : process.env.DB_NAME
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
  const sql = 'INSERT INTO Users (firstName, lastName, email, phoneNumber, zipCode, userType) VALUES (?, ?, ?, ?, ?, ?)';
  pool.query(sql, [firstName, lastName, email, phoneNumber, zipCode, userType], (error, results) => {
    if (error) throw error;
    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Confirmation',
      text: 'Please confirm your email by clicking on this link: [link]'
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.redirect('/login');
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

module.exports = router;
