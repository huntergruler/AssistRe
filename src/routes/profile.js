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

// Ensure you have body-parser configured to parse JSON
router.use(bodyParser.json());
router.use(express.json());
router.use(cookierParser());

router.post('/api/offices', (req, res) => {
    const { officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState, userid } = req.body;
    const insertQuery = 'INSERT INTO Offices (officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState, userid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState, userid], (err, result) => {
        if (err) throw err;
        res.json({ officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState, userid });
    });
});

