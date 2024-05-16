require('dotenv').config();
const express = require('express');
//const session = require('express-session');
const app = express();
const router = express.Router();

router.post('/api/offices', (req, res) => {
    const { officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState, userid } = req.body;
    const insertQuery = 'INSERT INTO Offices (officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState, userid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState, userid], (err, result) => {
        if (err) throw err;
        res.json({ officeName, address, city, state, zip, phoneNumber, officeLicenseNumber, officeLicenseState, userid });
    });
});

