require('dotenv').config();
const express = require('express');
//const session = require('express-session');
const app = express();

const router = express.Router();
const nodemailer = require('nodemailer');
const cookierParser = require('cookie-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const saltRounds = 10; // The cost factor controls how much time is needed to calculate a single bcrypt hash.
const bodyParser = require('body-parser');
const profileRoutes = require('./profile');

// Ensure you have body-parser configured to parse JSON
router.use(bodyParser.json());
router.use(express.json());
router.use(cookierParser());
  // Assuming `db` is your MySQL connection db, already set up in app.js
  router.get('/profile', (req, res) => {
    if (!req.session.user) {
      req.session.message = 'Please login to access the Profile';
      res.redirect('/login');  
    }
          const query = 'SELECT a.agentlicenseid, date_format(a.licenseExpirationDate,"%m/%d/%Y") licenseExpirationDate, a.licenseNumber, a.licenseState, a.userid FROM AgentLicenses a where userid = ?'; 
      db.query(query,[ req.session.userid ], (err, results) => {
          if (err) throw err;
          let hasLicenses = results.length > 0;
          res.render('profile', { licenses: results, hasLicenses: hasLicenses, user: req.session.user, firstname: req.session.firstname, userid: req.session.userid, lastname: req.session.lastname});
        });
  });
  
