require('dotenv').config();
const express = require('express');
//const session = require('express-session');
const app = express();

const router = express.Router();
const nodemailer = require('nodemailer');
const cookierParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const saltRounds = 10; // The cost factor controls how much time is needed to calculate a single bcrypt hash.
const bodyParser = require('body-parser');

// Ensure you have body-parser configured to parse JSON
router.use(bodyParser.json());
router.use(express.static(path.join(__dirname, 'public')));
router.use(express.json());
router.use(cookierParser());
const upload = multer({ dest: 'uploads/' });

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

// Landing page route
router.get('/zipcodetest', (req, res) => {
  res.render('zipcodetest');
});

// Register route
router.get('/register', (req, res) => {
  res.render('register');
});

// Handle registration with city and state lookup
router.post('/register', (req, res) => {
  const { firstName, lastName, email, phoneNumber, address, zipCode, userType, password } = req.body;

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
      // Now insert the user into the Agents table with city and state

      if (userType === 'Agent') {
        var InsertSql = 'INSERT INTO Agents (firstName, lastName, email, verificationtoken, phoneNumber, zip, address, city, state, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      } else if (userType === 'Buyer') {
        var InsertSql = 'INSERT INTO Buyers (firstName, lastName, email, verificationtoken, phoneNumber, zip, address, city, state, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      }
      db.query(InsertSql, [firstName, lastName, email, verificationtoken, phoneNumber, zipCode, address, city, state, hashedPassword], (userError, userResults) => {
        if (userError) {
          console.error('Error inserting user into database:', userError);
          return res.status(500).send('Error inserting user into database');
        }
        // Send confirmation email
        sendVerificationEmail(req, email, verificationtoken, userType);
        res.send('Registration successful! Please check your email to verify.');

      });
    });
  });
});

// Route to get the buyer's profile
router.get('/profile_b', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Profile';
    res.redirect('/');
  }
  else {
    const userid = req.session.userid;

    const query = `select b.firstName, b.lastName, b.address, b.city, b.state, b.userid, b.zip, b.email, b.phoneNumber, 
                          b.bathrooms_min, b.bathrooms_max, b.bedrooms_min, b.bedrooms_max, b.buyerType, b.preferredLanguages, b.prequalified, b.price_min, 
                          b.price_max, b.propertyType, b.squareFootage_min, b.squareFootage_max, b.state, b.timeFrame, b.userPhoto, b.prequalifiedFile
                     from Buyers b
                    where b.userid = ?`;
    db.query(query, [userid], (error, results) => {
      if (error) {
        console.error('Error fetching buyer profile:', error);
        return res.status(500).send('Server error');
      }
      if (results.length === 0) {
        return res.status(404).send('User not found');
      }
      res.render('profile_b', { buyer: results[0] });
    });
  }
});

// Route to update the buyer's profile
router.post('/profile_b', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Profile';
    res.redirect('/');
  }
  else {
    const { firstName, lastName, address, city, state, zip, phoneNumber, userid } = req.body;

    const query = 'UPDATE Buyers SET firstName = ?, lastName = ?, address = ?, city = ?, state = ?, zip = ?, phoneNumber = ? WHERE userid = ?';
    db.query(query, [firstName, lastName, address, city, state, zip, phoneNumber, userid], (error, results) => {
      if (error) {
        console.error('Error updating buyer profile:', error);
        return res.status(500).send('Server error');
      }

      res.send({ success: true });
    });
  }
});

// Route to update the buyer's profile
router.post('/profile_b_property', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Profile';
    res.redirect('/');
  }
  else {
    const { bathrooms_min, bathrooms_max, bedrooms_min, bedrooms_max, buyerType, preferredLanguages, prequalified, price_min, price_max, propertyType, squareFootage_min, squareFootage_max, timeFrame, userPhoto, userid } = req.body;
    const query = 'UPDATE Buyers SET bathrooms_min = ?, bathrooms_max = ?, bedrooms_min = ?, bedrooms_max = ?, buyerType = ?, preferredLanguages = ?, prequalified = ?, price_min = ?, price_max = ?, propertyType = ?, squareFootage_min = ?, squareFootage_max = ?, timeFrame = ?, userPhoto = ? WHERE userid = ?';
    db.query(query, [bathrooms_min, bathrooms_max, bedrooms_min, bedrooms_max, buyerType, preferredLanguages, prequalified, price_min, price_max, propertyType, squareFootage_min, squareFootage_max, timeFrame, userPhoto, userid], (error, results) => {
      if (error) {
        console.error('Error updating buyer profile:', error);
        return res.status(500).send('Server error');
      }

      res.send({ success: true });
    });
  }
});

// Assuming `db` is your MySQL connection db, already set up in app.js
router.get('/profile_a', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Profile';
    res.redirect('/');
  }
  else {
    userid = req.session.userid;
    const query = `SELECT a.agentlicenseid, date_format(a.licenseExpirationDate,"%m/%d/%Y") licenseExpirationDate, a.licenseNumber, a.licenseState, a.userid 
                     FROM AgentLicenses a 
                    WHERE userid = ?`;
    db.query(query, [userid], (err, licenseresults) => {
      if (err) throw err;
      let hasLicenses = licenseresults.length > 0;
      const query = 'SELECT * FROM AgentOffices a where userid = ?';
      db.query(query, [userid], (err, officeresults) => {
        if (err) throw err;
        let hasOffices = officeresults.length > 0;
        const query = `SELECT agenttransactionid, transactionDate, transactionAmount, propertytype, levelofservice, compensationtype
                             FROM AgentTransactionHistory_v h 
                            WHERE userid = ?`;
        db.query(query, [userid], (err, transactionresults) => {
          if (err) throw err;
          let hasTransactions = transactionresults.length > 0;
          res.render('profile_a', { licenses: licenseresults, offices: officeresults, transactions: transactionresults, hasLicenses: hasLicenses, hasTransactions: hasTransactions, hasOffices: hasOffices, user: req.session.user, firstname: req.session.firstname, userid: req.session.userid, lastname: req.session.lastname });
        });
      });
    });
  }
});

router.get('/api/profile_a', (req, res) => {
  userid = req.session.userid;
  const query = `SELECT a.agentlicenseid, date_format(a.licenseExpirationDate,"%m/%d/%Y") licenseExpirationDate, a.licenseNumber, a.licenseState, a.userid 
                     FROM AgentLicenses a 
                    WHERE userid = ?`;
  db.query(query, [userid], (err, licenseresults) => {
    if (err) throw err;
    let hasLicenses = licenseresults.length > 0;
    const query = 'SELECT * FROM AgentOffices a where userid = ?';
    db.query(query, [userid], (err, officeresults) => {
      if (err) throw err;
      let hasOffices = officeresults.length > 0;
      const query = `SELECT agenttransactionid, transactionDate, transactionAmount, propertytype, levelofservice, compensationtype
                             FROM AgentTransactionHistory_v h 
                            WHERE userid = ?`;
      db.query(query, [userid], (err, transactionresults) => {
        if (err) throw err;
        let hasTransactions = transactionresults.length > 0;
        res.json({ licenses: licenseresults, offices: officeresults, transactions: transactionresults, hasLicenses: hasLicenses, hasTransactions: hasTransactions, hasOffices: hasOffices, user: req.session.user, firstname: req.session.firstname, userid: req.session.userid, lastname: req.session.lastname });
      });
    });
  });
});

router.post('/api/licenses', (req, res) => {
  const { licenseNumber, licenseState, licenseExpirationDate } = req.body;
  const insertQuery = 'INSERT INTO AgentLicenses (licenseNumber, licenseState, licenseExpirationDate, userid) VALUES (?, ?, ?, ?)';
  db.query(insertQuery, [licenseNumber, licenseState, licenseExpirationDate, req.session.userid], (err, result) => {
    if (err) throw err;
    agentlicenseid = result.insertId;
    res.json({ agentlicenseid, licenseNumber, licenseState, licenseExpirationDate });
  });
});

router.delete('/api/licenses/:id', (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM AgentLicenses WHERE agentlicenseid = ?';
  db.query(deleteQuery, [id], (err, result) => {
    if (err) throw err;
    res.status(204).send();
  });
});


// Login route
router.get('/login', (req, res) => {
  const message = req.session.message;

  // Destroy the session or clear the cookie
  if (req.session.killsession) {
    req.session.destroy((err) => {
      if (err) {
        return console.error('Failed to destroy the session on logout', err);
        res.clearCookie('connect.sid'); // If you're using session cookies, clear them
      }
    });
  }
  res.render('login', { query: req.query, message: message });
});

// Login route
router.get('/login_a', (req, res) => {
  const message = req.session.message;

  // Destroy the session or clear the cookie
  if (req.session.killsession) {
    req.session.destroy((err) => {
      if (err) {
        return console.error('Failed to destroy the session on logout', err);
        res.clearCookie('connect.sid'); // If you're using session cookies, clear them
      }
    });
  }
  res.render('login_a', { query: req.query, message: message });
});

// Login route
router.get('/login_b', (req, res) => {
  const message = req.session.message;

  // Destroy the session or clear the cookie
  if (req.session.killsession) {
    req.session.destroy((err) => {
      if (err) {
        return console.error('Failed to destroy the session on logout', err);
        res.clearCookie('connect.sid'); // If you're using session cookies, clear them
      }
    });
  }
  res.render('login_b', { query: req.query, message: message });
});

// Logout route
router.get('/logout', (req, res) => {
  // Redirect to login with a logout message
  req.session.message = 'Successfully logged out';
  req.session.killsession = true;
  res.redirect('/');
});

router.post('/login', [
  body('email').trim().escape(),
  body('password').isLength({ min: 4 }).trim().escape()], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, userType } = req.body;
    if (userType === 'Agent') {
      var userQuery = 'SELECT password, userid, firstname, lastname, emailverified FROM Agents WHERE email = ?';
      var htmlpage = 'login_a';
    } else if (userType === 'Buyer') {
      var userQuery = 'SELECT password, userid, firstname, lastname, emailverified FROM Buyers WHERE email = ?';
      var htmlpage = 'login_b';
    }
    res.setHeader('Content-Type', 'application/json');
    db.query(userQuery, [email], (error, results) => {
      if (error) {
        return res.render(htmlpage, { message: 'Error during database query' });
      }
      else if (results.length === 0) {
        // Send response when email is not found
        res.json({
          success: false,
          message: "Invalid credentials."
        });
      } else if (results[0].emailverified === 0) {
        // Send response when email is not verified
        res.json({
          success: false,
          message: "Verify your email address and then try to login again."
        });
      } else {
        const { userid, firstname, lastname } = results[0];
        bcrypt.compare(password, results[0].password, (err, isMatch) => {
          if (!isMatch || err) {
            res.json({
              success: false,
              message: "Invalid credentials."
            });
          }
          else if (isMatch) {
            req.session.user = email;
            req.session.userid = userid;
            req.session.firstname = firstname;
            req.session.lastname = lastname;
            req.session.userType = userType;
            console.log('User logged in:', email, userType);
            if (userType === 'Agent') {
              var updateQuery = 'update Agents set lastlogin = now() WHERE email = ?';
            } else if (userType === 'Buyer') {
              var updateQuery = 'update Buyers set lastlogin = now() WHERE email = ?';
            }
            db.query(updateQuery, [email], (error, results) => {
              if (error) {
                return res.render(htmlpage, { message: 'Error during database update' });
              }
            });
            res.json({
              success: true,
              message: "Successful Login"
            });
          }
        });
      }
    });
  });

// Route to get city and state by zip code
router.get('/get-city-state', (req, res) => {
  const zipCode = req.query.zipCode;
  if (!zipCode) {
    return res.status(400).json({ error: 'Zip code is required' });
  }

  const query = 'SELECT city, state FROM ZipCodes WHERE zipCode = ?';
  db.query(query, [zipCode], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      const { city, state } = results[0];
      res.json({ city, state });
    } else {
      res.status(404).json({ error: 'No data found for this zip code' });
    }
  });
});

// Route to check if user exists
router.get('/check-user', (req, res) => {
  const email = req.query.email;
  const usertype = req.query.usertype;
  if (!email) {
    return res.status(400).json({ error: 'User Name is required' });
  }
  if (usertype == 'Agent') {
    const query = 'SELECT count(*) cnt FROM Agents WHERE email = ?';
    db.query(query, [email], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (results[0].cnt > 0) {
        // User Name is already taken
        res.json({ available: false });
      } else {
        // User Name is available
        res.json({ available: true });
      }
    });
  }
  else {
    const query = 'SELECT count(*) cnt FROM Buyers WHERE email = ?';
    db.query(query, [email], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (results[0].cnt > 0) {
        // User Name is already taken
        res.json({ available: false });
      } else {
        // User Name is available
        res.json({ available: true });
      }
    });
  }
});
// Route to check if user exists
router.get('/check-license', (req, res) => {
  const userid = req.session.userid;
  const licenseState = req.query.licenseState;
  const query = 'SELECT count(*) cnt FROM ZipCodes WHERE state = ?';
  db.query(query, [licenseState], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results[0].cnt == 0) {
      // Is not a valid state
      res.json({ stateResult: 'Invalid' });
    } else {
      const query = 'SELECT count(*) cnt FROM AgentLicenses WHERE userid = ? and licenseState = ?';
      db.query(query, [userid, licenseState], (error, results) => {
        if (error) {
          return res.status(500).json({ error: 'Internal server error' });
        }
        if (results[0].cnt > 0) {
          // License for this state exists
          res.json({ stateResult: 'Used' });
        } else {
          // Is a valid state
          res.json({ stateResult: 'Valid' });
        }
      });
    }
  });
});

// Route to get city and state by zip code
router.get('/get-cities', (req, res) => {
  const stateSelect = req.query.stateSelect;
  const query = 'SELECT distinct city FROM ZipCodes WHERE state = ? order by city';
  db.query(query, [stateSelect], (error, results) => {
    //    console.log('Results:', results);

    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      res.json({ results });
    } else {
      res.status(404).json({ error: 'No zips found for this state' });
    }
  });
});

// Route to get states
router.get('/get-states', (req, res) => {
  const stateSelect = req.query.stateSelect;
  const query = 'SELECT distinct state, stateName FROM ZipCodes where stateName is not null order by stateName';
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      res.json({ results });
    } else {
      res.status(404).json({ error: 'No zips found for this state' });
    }
  });
});

// Route to get city and state by zip code
router.get('/get-zipcodes', (req, res) => {
  const stateSelect = req.query.stateSelect;
  const citySelect = req.query.citySelect;
  userid = req.session.userid;
  userType = req.session.userType;
  userid = '1000000002'
  userType = 'Buyer'

  if (userType === 'Agent') {
  var query = `SELECT zipCode 
                   FROM ZipCodes z 
                  WHERE state = ? and city = ?
                    and not exists(select 1 
                                     from AgentZipCodes u 
                                    where userid = ? 
                                      and u.zipCode = z.zipCode) 
                  order by zipCode`;
  } else if (userType === 'Buyer') {
    var query = `SELECT zipCode
    FROM ZipCodes z 
    WHERE state = ? and city = ?
      and not exists(select 1 
                       from BuyerZipCodes u 
                      where userid = ? 
                        and u.zipCode = z.zipCode) 
    order by zipCode`;
  }

  db.query(query, [stateSelect, citySelect, userid], (error, results) => {
    //    console.log('Results:', results);

    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      res.json({ results });
    } else {
      res.status(404).json({ error: 'No zips found for this state' });
    }
  });
});

router.post('/process-zip-codes', (req, res) => {
  const { zipCodes } = req.body;
  const userid = req.session.userid;
  // First, delete all zip codes for this user
  const query = 'DELETE FROM AgentZipCodes WHERE userid = ?';
  db.query(query, [userid], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  // Now insert the new zip codes
  const insertQuery = 'INSERT INTO AgentZipCodes (userid, zipCode) VALUES ?';
  const values = zipCodes.map(zipCode => [userid, zipCode]);
  db.query(insertQuery, [values], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ success: true });
  });
});

router.post('/api/offices', (req, res) => {
  const userid = req.session.userid;
  const { officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState } = req.body;

  const insertQuery = 'INSERT INTO AgentOffices (officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState, userid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(insertQuery, [officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState, userid], (err, result) => {
    if (err) throw err;
    agentofficeid = result.insertId;
    res.json({ agentofficeid, officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState, userid });
  });
});

router.delete('/api/licenses/:id', (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM AgentLicenses WHERE agentlicenseid = ?';
  db.query(deleteQuery, [id], (err, result) => {
    if (err) throw err;
    res.status(204).send();
  });
});


router.delete('/api/offices/:id', (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM AgentOffices WHERE agentofficeid = ?';
  db.query(deleteQuery, [id], (err, result) => {
    if (err) throw err;
    res.status(204).send();
  });
});


// Route to get city and state by zip code
router.get('/get-agentzipcodes', (req, res) => {
  userid = req.session.userid;
  userType = req.session.userType;
  if (userType === 'Agent') {
    var query = 'SELECT u.zipCode, z.city, z.state, z.stateName FROM AgentZipCodes u, ZipCodes z WHERE u.zipCode = z.zipCode and u.userid = ? order by z.state, z.city, z.zipCode';
  } else if (userType === 'Buyer') {
    var query = 'SELECT u.zipCode, z.city, z.state, z.stateName FROM BuyerZipCodes u, ZipCodes z WHERE u.zipCode = z.zipCode and u.userid = ? order by z.state, z.city, z.zipCode';
  }
  db.query(query, [userid], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      res.json({ results });
    } else {
      res.status(404).json({ error: 'No zips found for this state' });
    }
  });
});

// Route to get city and state by zip code
router.get('/get-userzipcodes', (req, res) => {
  userid = req.session.userid;
  userType = req.session.userType;
  userid = '1000000002'
  userType = 'Buyer'
  if (userType === 'Agent') {
    var query = 'SELECT u.zipCode, z.city, z.state, z.stateName FROM AgentZipCodes u, ZipCodes z WHERE u.zipCode = z.zipCode and u.userid = ? order by z.state, z.city, z.zipCode';
  } else if (userType === 'Buyer') {
    var query = 'SELECT u.zipCode, z.city, z.state, z.stateName FROM BuyerZipCodes u, ZipCodes z WHERE u.zipCode = z.zipCode and u.userid = ? order by z.state, z.city, z.zipCode';
  }
  db.query(query, [userid], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      res.json({ results });
    } else {
      res.status(404).json({ error: 'No zips found for this state' });
    }
  });
});

// Route to serve the dashboard_a page
router.get('/dashboard_a', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Dashboard';
    //    console.log('Redirecting to:', redirectto);
    res.redirect('/');
  }
  else {
    res.render('dashboard_a', { user: req.session.user, firstname: req.session.firstname, userid: req.session.userid, lastname: req.session.lastname });
  }
});

// Route to serve the dashboard_b page
router.get('/dashboard_b', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Dashboard';
    //    console.log('Redirecting to:', redirectto);
    res.redirect('/');
  }
  else {
    res.render('dashboard_b', { user: req.session.user, firstname: req.session.firstname, userid: req.session.userid, lastname: req.session.lastname });
  }
});

router.get('/settings', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access the Settings page';
    //    console.log('Redirecting to:', redirectto);
    res.redirect('/');
  }
  else {
    res.render('settings');
  }
});

// Password reset route
router.get('/reset', (req, res) => {
  res.render('reset');
});

// Handle resetting the password
router.post('/reset', (req, res) => {
  const { email, token, password, resetType } = req.body;

  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error("Hashing error:", err);
      return res.status(500).send('Error hashing password');
    }
    if (resetType == 'A') { // Agent
      var updateQuery = 'UPDATE Agents SET password = ? WHERE email = ? & resetToken = ?';
    }
    else if (resetType == 'B') { // Buyer
      var updateQuery = 'UPDATE Buyers SET password = ? WHERE email = ? & resetToken = ?';
    }
    console.log('Update Query:', updateQuery, 'Email:', email, 'Token:', token, 'Password:', password, 'Hashed Password:', hashedPassword);
    db.query(updateQuery, [hashedPassword, email, token], (error, results) => {
      if (error) {
        return res.status(500).send('Error accessing the database');
      }
      // Redirect to login with a password changed message
      if (resetType == 'A') {
        res.redirect('/login_a?passwordchanged=true');
      } else if (resetType == 'B') {  // Buyer
        res.redirect('/login_b?passwordchanged=true');
      }
    });
  });
});

// send password reset email route
router.get('/sendreset', (req, res) => {
  const data = req.cookies.data;
  res.render('sendreset', { data: data });
});

router.post('/sendreset', (req, res) => {
  const email = req.body.email;
  const userType = req.body.userType;
  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetTokenExpire = Date.now() + 900000; // 15 minutes from now
  const resetTokenExpireDate = new Date(resetTokenExpire);
  console.log(userType, email, resetToken, resetTokenExpireDate);
  if (userType == 'Agent') {
    // Store the reset token and its expiration in the database
    var updateQuery = 'UPDATE Agents SET resetToken=?, resetTokenExpire=? WHERE email=?';
    resetType = 'A';
  } else if (userType == 'Buyer') {
    // Store the reset token and its expiration in the database
    var updateQuery = 'UPDATE Buyers SET resetToken=?, resetTokenExpire=? WHERE email=?';
    resetType = 'B';
  }
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
      html: `Please reset your password by clicking on this link: <a href="http://${req.headers.host}/reset-password?token=${resetToken}&resetType=${resetType}">Reset Password</a>`
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

router.post('/buyersubmit', upload.fields([{ name: 'prequalifiedFile' }, { name: 'userPhoto' }]), (req, res) => {
  const {
    firstName, lastName, address, city, state, zip, email,
    phoneNumber, propertyType, bedrooms, bathrooms, squareFootage,
    priceRange, timeFrame, prequalified, preferredLanguages, password
  } = req.body;

  const buyerTypes = req.body.buyerType; // This will be an array
  const buyerType = Array.isArray(buyerTypes) ? buyerTypes.join(', ') : buyerTypes;


  const prequalifiedFile = req.files['prequalifiedFile'] ? req.files['prequalifiedFile'][0].path : null;
  const userPhoto = req.files['userPhoto'][0].path;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = `INSERT INTO Buyers (buyerType, firstName, lastName, address, city, state, zip, email, phoneNumber, propertyType, bedrooms, bathrooms, squareFootage, priceRange, timeFrame, prequalified, prequalified_file_location, emailverified, userPhoto, preferredLanguages, password)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`;

  db.query(sql, [buyerType, firstName, lastName, address, city, state, zip, email, phoneNumber, propertyType, bedrooms, bathrooms, squareFootage, priceRange, timeFrame, prequalified, prequalifiedFile, userPhoto, preferredLanguages, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      res.json({ success: false, error: err });
    } else {
      res.json({ success: true });
    }
  });
});

router.get('/reset-password', (req, res) => {
  const { token, resetType } = req.query;
  // Verify the token and its expiration
  console.log('Token:', token, 'Reset Type:', resetType);
  if (resetType == 'A') {
    var query = 'SELECT * FROM Agents WHERE resetToken=? AND resetTokenExpire > ?';
  } else if (resetType == 'B') {
    var query = 'SELECT * FROM Buyers WHERE resetToken=? AND resetTokenExpire > ?';
  }
  const date = new Date(Date.now())
  db.query(query, [token, date], (error, results) => {
    if (error || results.length === 0) {
      //      res.status(400).send('Invalid or expired token');
      res.cookie('data', 'Bad Token', { maxAge: 900000, httpOnly: true });
      res.redirect('/sendreset')
      return
    }
    // Serve the password reset form
    res.render('reset', { email: results[0].email, token: token, resetType: resetType });
  });
});

// Route to handle email verification
router.get('/verify-email', (req, res) => {
  const { token, email, type } = req.query;
  if (type == 'A') {
    db.query('UPDATE Agents SET emailverified = 1 WHERE email = ? AND verificationtoken = ?', [email, token], (err, result) => {
      res.cookie('data', 'Email Verified', { maxAge: 900000, httpOnly: true });
      if (err) return res.status(500).send('Database error during email verification.');
      if (result.affectedRows === 0) return res.status(404).send('Token not found or email already verified.');
      res.redirect('login');
    });
  } else if (type == 'B') {
    db.query('UPDATE Buyers SET emailverified = 1 WHERE email = ? AND verificationtoken = ?', [email, token], (err, result) => {
      res.cookie('data', 'Email Verified', { maxAge: 900000, httpOnly: true });
      if (err) return res.status(500).send('Database error during email verification.');
      if (result.affectedRows === 0) return res.status(404).send('Token not found or email already verified.');
      res.redirect('login');
    });
  }
});


// Function to send a verification email
function sendVerificationEmail(req, email, token, userType) {
  const mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  if (userType == 'Agent') {
    usertype = 'A';
  } else if (userType == 'Buyer') {
    usertype = 'B';
  }

  const mailDetails = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify your email address',
    html: `Please click on this link to verify your email: <a href="http://${req.headers.host}/verify-email?token=${token}&email=${email}&type=${usertype}">Verify Email</a>`
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
