require('dotenv').config();
const express = require('express');
//const session = require('express-session');
const app = express();

const router = express.Router();
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const saltRounds = 10; // The cost factor controls how much time is needed to calculate a single bcrypt hash.

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

// Route to handle user logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return console.log(err);
      }
      res.send("Logout successful!");
  });
});

// Register route
router.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration with city and state lookup
router.post('/register', (req, res) => {
    const { firstName, lastName, user, phoneNumber, zipCode, userType, password } = req.body;
  
    // First, query the city and state from the ZipCodes table
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error("Hashing error:", err);
        return res.status(500).send('Error hashing password');
      }
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
      const userInsertSql = 'INSERT INTO Users (firstName, lastName, email, verificationtoken, phoneNumber, zip, city, state, usertype, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(userInsertSql, [firstName, lastName, user, verificationtoken, phoneNumber, zipCode, city, state, userType, user, hashedPassword], (userError, userResults) => {
        if (userError) {
            console.error('Error inserting user into database:', userError);
            return res.status(500).send('Error inserting user into database');
        }
        
      // Send confirmation email
      sendVerificationEmail(req, user, verificationtoken);
      res.send('Registration successful! Please check your email to verify.');
 
      });
    });
   });
  });

  router.post('/login', (req, res) => {
    const { user, password } = req.body;
  
    // Query to find the user
    const query = 'SELECT password FROM Users WHERE username = ?';
    db.query(query, [user], (error, results) => {
      if (error) {
        return res.status(500).send('Error during database query');
      }
      if (results.length === 0) {
        return res.status(404).send('User not found');
      }
  
      // Compare the hashed password stored in the database
      bcrypt.compare(password, results[0].password, (err, isMatch) => {
        if (err) {
          return res.status(500).send('Error comparing passwords');
        }
        if (isMatch) {
          // Passwords match
          console.log('User logged in:', user);
          const query = 'UPDATE Users set lastlogin = now()';
          db.query(query, [user], (error, results) => {
            if (error) {
              return res.status(500).send('Error during database query');
            }
          });
          req.session.user = user; // Store the user in the session
          return res.redirect('/dashboard'); // or wherever you want the user to go after login
        } else {
          // Passwords do not match
          return res.status(403).send('Incorrect password');
        }
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

// Route to serve the dashboard page
router.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Access denied. Please login to access this page.");
  }
  res.render('dashboard');
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
function sendVerificationEmail(req, user, token) {
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
      to: user,
      subject: 'Verify your email address',
      html: `Please click on this link to verify your email: <a href="http://${req.headers.host}/verify-email?token=${token}&email=${user}">Verify Email</a>`
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
