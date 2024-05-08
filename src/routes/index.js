require('dotenv').config();
const express = require('express');
//const session = require('express-session');
const app = express();

const router = express.Router();
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validStates = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
const { body, validationResult } = require('express-validator');
const saltRounds = 10; // The cost factor controls how much time is needed to calculate a single bcrypt hash.
const bodyParser = require('body-parser');

// Ensure you have body-parser configured to parse JSON
router.use(bodyParser.json());
router.use(express.json());

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

      const verificationtoken = crypto.randomBytes(16).toString('hex');
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

  // Assuming `db` is your MySQL connection db, already set up in app.js
  router.get('/profile', (req, res) => {
    if (!req.session.user) {
      return res.status(401).send("Access denied. Please login to access this page.");
    }
        const query = 'SELECT * FROM AgentLicenseInfo where userid = ?'; 
      db.query(query,[ req.session.userid ], (err, results) => {
          if (err) throw err;
          let hasLicenses = results.length > 0;
//          hasLicenses = true;
//          console.log('hasLicenses:',hasLicenses);
          res.render('profile', { licenses: results, hasLicenses: hasLicenses });
      });
  });



  // GET RID OF THIS, DEBUG ONLY
  router.get('/all', (req, res) => {
    const query = 'SELECT * FROM AgentLicenseInfo'; 
      db.query(query,[ req.session.userid ], (err, results) => {
        if (error) {
          return res.status(500).json({error: 'Internal server error'});
        }
        if (results.length > 0) {
          res.json({results});
        }
      });
  });

  router.get('/launch', (req, res) => {
    return res.status(500).json({error: 'Bad request'});
  });
  
  router.post('/api/licenses', (req, res) => {
    console.log('req.body:',req.body);
      const { licensenumber, licensestate } = req.body;
      const insertQuery = 'INSERT INTO AgentLicenseInfo (licensenumber, licensestate, userid) VALUES (?, ?, ?)';
      db.query(insertQuery, [licensenumber, licensestate, req.session.userid], (err, result) => {
          if (err) throw err;
          res.json({ id: result.insertId, licensenumber, licensestate });
      });
  });

  router.put('/api/licenses/:id', (req, res) => {
      const { id } = req.params;
      const { licensenumber, licensestate } = req.body;
  
      if (!validStates.includes(licensestate)) {
          return res.status(400).json({ error: 'Invalid state abbreviation' });
      }
  
      const updateQuery = 'UPDATE AgentLicenseInfo SET licensenumber = ?, licensestate = ? WHERE id = ?';
      db.query(updateQuery, [licensenumber, licensestate, id], (err, result) => {
          if (err) {
              return res.status(500).json({ error: 'Database error during the update' });
          }
          if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'License not found' });
          }
          res.json({ id, licensenumber, licensestate });
      });
  });

  router.delete('/api/licenses/:id', (req, res) => {
      const { id } = req.params;
      const deleteQuery = 'DELETE FROM AgentLicenseInfo WHERE agentlicenseid = ?';
      db.query(deleteQuery, [id], (err, result) => {
          if (err) throw err;
          res.status(204).send();
      });
  });
 

// Login route
router.get('/login', (req, res) => {
  const message = req.session.message;
  if (message) {
    res.redirect('login?messagein=${ message }');
//    req.session.message = null;
  }
  else  
  {
    res.render('login', { query: req.query });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  // Destroy the session or clear the cookie
  req.session.destroy((err) => {
      if (err) {
          return console.error('Failed to destroy the session on logout', err);
      }
      res.clearCookie('connect.sid'); // If you're using session cookies, clear them

      // Redirect to login with a logout message
      res.redirect('/login?loggedOut=true');
  });
});

router.post('/login', [
  body('username').trim().escape(),
  body('password').isLength({ min: 4 }).trim().escape()], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
  const { username, password } = req.body;
//  console.log('User', username, 'Password', password);  
  const query = 'SELECT password, userid, firstname, lastname, emailverified FROM Users WHERE username = ?';
  res.setHeader('Content-Type', 'application/json');
  db.query(query, [username], (error, results) => {
    if (error) {
      return res.render('login', { errorMessage: 'Error during database query' });
    }
    if (results[0].emailverified === 0) {
            // Send response when email is not verified
            res.json({
              success: false,
              message: "Verify your email address and then try to login again."
          });
     } else {
      const { userid, firstname, lastname } = results[0];
      
      bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) {
        return res.render('login', { errorMessage: 'Error comparing passwords' });
      } else {
        if (isMatch) {
          req.session.user = username;
          req.session.userid = userid;
          req.session.firstname = firstname;
          req.session.lastname = lastname;
          console.log('User logged in:', username);
          res.json({
            success: true,
            message: "Successful Login"});
        } else {
            // Send response when email is not verified
            res.json({
              success: false,
              message: "Invalid credentials."
            });
          }
        }
        });
      };
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
    const message = 'Please login to access the Dashboard';
    req.session.message = message;
    console.log('Message:', message);
    res.redirect('/login', { messagein: message });  
  }
  else { 
  res.render('dashboard', { user: req.session.user, firstname: req.session.firstname, userid: req.session.userid, lastname: req.session.lastname});
  }
});

// Password reset route
router.get('/reset', (req, res) => {
  res.render('reset');
});

// Handle resetting the password
router.post('/reset', (req, res) => {
  const { email, token, password } = req.body;

  // First, query the city and state from the ZipCodes table
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error("Hashing error:", err);
      return res.status(500).send('Error hashing password');
    }
    const updateQuery = 'UPDATE Users SET password = ? WHERE username = ?';
    db.query(updateQuery, [hashedPassword , email], (error, results) => {
    if (error) {
      return res.status(500).send('Error accessing the database');
    }
      // Redirect to login with a logout message
      res.redirect('/login?passwordchanged=true');

    });
  });
 });

// send password reset email route
router.get('/sendreset', (req, res) => {
  res.render('sendreset');
});

router.post('/sendreset', (req, res) => {
  const email = req.body.email;
  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetTokenExpire = Date.now() + 900000; // 15 minutes from now
  console.log('Reset token:', resetToken, 'Expires:', resetTokenExpire);
  // Store the reset token and its expiration in the database
  const updateQuery = 'UPDATE Users SET resetToken=?, resetTokenExpire=? WHERE email=?';
  db.query(updateQuery, [resetToken, new Date(resetTokenExpire), email], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).send('Database error');
    }

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
      subject: 'Password Reset',
      html: `Please reset your password by clicking on this link: <a href="http://${req.headers.host}/reset-password?token=${resetToken}">Reset Password</a>`
    };

    mailTransporter.sendMail(mailDetails, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).send('Error sending reset email');
      }
      console.log('Reset email sent:', info.response);
      res.send('Reset email sent');
    });
  });
});

router.get('/reset-password', (req, res) => {
  const { token } = req.query;
  // Verify the token and its expiration
  const query = 'SELECT * FROM Users WHERE resetToken=? AND resetTokenExpire > ?';
  db.query(query, [token, Date.now()], (error, results) => {
    if (error || results.length === 0) {
      return res.status(400).send('Invalid or expired token');
    }
    // Serve the password reset form
    res.render('reset', { email: results[0].email, token: token });
  });
});

// Route to handle email verification
router.get('/verify-email', (req, res) => {
    const { token, email } = req.query;
    db.query('UPDATE Users SET emailverified = 1 WHERE email = ? AND verificationtoken = ?', [email, token], (err, result) => {
      if (err) return res.status(500).send('Database error during email verification.');
      if (result.affectedRows === 0) return res.status(404).send('Token not found or email already verified.');
      res.redirect('login', { emailverified: true });
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
