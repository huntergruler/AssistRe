require('dotenv').config();
const express = require('express');
//const session = require('express-session');
const app = express();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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

const YOUR_DOMAIN = 'http://3.129.42.126:3000';
const PRICE_ID = 'price_1PUdczDidT8L3PDw6wpnXHLf'

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

// Route to get the user's session data
router.get('/session-data', (req, res) => {
  res.json({user: req.session.user, firstname: req.session.firstname, userid: req.session.userid, lastname: req.session.lastname, userType: req.session.userType, buyerid: req.session.buyerid, agentid: req.session.agentid, paymentSuccessful: req.session.paymentSuccessful});
});

// Register route
router.get('/register', (req, res) => {
  res.render('register');
});

// Payment route
router.post('/create-checkout-session', async (req, res) => {
  console.log('Create checkout session');
  try {
    const stripesession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1PUdczDidT8L3PDw6wpnXHLf', // Replace with your actual Price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });

    // Log stripesession details
    console.log('Checkout stripesession ID:', stripesession.id);
    console.log('Payment Status:', stripesession.payment_status);
    console.log('Amount Total:', stripesession.amount_total);
    console.log('Customer Email:', stripesession.customer_details.email);

    // Redirect to the stripesession URL
    res.redirect(303, stripesession.url);
  } catch (error) {
    console.error('Error creating checkout stripesession:', error);
    res.status(500).send({ error: error.message });
  }
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
router.get('/dashboard_a', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Dashboard';
    res.redirect('/');
  }
  else {
    res.render('dashboard_a', { user: req.session.user, firstname: req.session.firstname, userid: req.session.userid, lastname: req.session.lastname });
  }
});

router.get('/getOfferCounts', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login';
    res.redirect('/');
  }
  else {
    const userid = req.session.userid;
    const userType = req.session.userType;
    const buyerid = req.session.buyerid;
    var query = `select os.offerStatus buyerStatus, concat('(',count(bam.buyerid),')') cnt
                   from OfferStatuses os 
                        left outer join AgentBuyerMatch bam on (bam.buyerStatus = os.offerStatus and 
                                                                bam.buyerid = ?)
                  where os.userType = 'Buyer'
                  group by 1
                 union
                 select 'AllAvailable', concat('(',count(bam.buyerid),')') cnt
                   from OfferStatuses os 
                        left outer join AgentBuyerMatch bam on (bam.buyerStatus = os.offerStatus and 
                                                                bam.buyerid = ?)
                  where os.userType = 'Buyer'
                    and os.offerStatus not in ('Declined');`;
    db.query(query, [buyerid, buyerid], (error, results) => {
      if (error) {
        console.error('Error fetching buyer profile:', error);
        return res.status(500).send('Server error');
      }
      res.json(results);
    });
  }
});

// Route to get the buyer's profile
router.get('/getOffers', (req, res) => {
  const datatype = req.query.datatype;
  if (!req.session.user) {
    req.session.message = 'Please login to access your Profile';
    res.redirect('/');
  }
  else {
    const datatype = req.query.datatype;
    const agentid = req.query.agentid;
    const buyeragentmatchid = req.query.buyeragentmatchid;
    const buyerid = req.session.userid;

    if (!agentid) {
      var query = `select ofb.buyeragentmatchid, ofb.agentid, ofb.agentofferid, ofb.buyerStatus, ofb.buyerid, ofb.buyerrequestid, ofb.compensationAmount, ofb.dispIdentifier, ofb.expirationCompTimeFrame, ofb.expirationCompensation, ofb.lengthOfService, ofb.levelOfService, ofb.offerDesc, ofb.offerText, ofb.offerTimestamp, ofb.offerType, ofb.retainerCredited, ofb.retainerFee,
                          case when 'New' = 'AllAvailable'
                               then filterstatus
                               else buyerstatus
                          end
                     from OffersForBuyers ofb
                    where buyerid =  ?
                      and case when ? = 'AllAvailable'
                               then filterstatus
                               else buyerstatus
                           end = ?
                    ORDER BY buyerStatus, entrytimestamp DESC
                    ;`;
      db.query(query, [buyerid, datatype, datatype], (error, results) => {
        if (error) {
          console.error('Error fetching buyer profile:', error);
          return res.status(500).send('Server error');
        }
        res.json(results);
      });
    }
    else {
      var query = `select ao.agentofferid, ao.buyerrequestid, ao.buyerid, ao.agentid, ot.offerType, los.levelOfService, ct.compensationType, 
                          case when ct.compensationType = 'Hourly Rate'
                               then concat('$',ao.compensationAmount,' ',ct.compensationTypeUnit)
                               when ct.compensationType = 'Flat Fee'
                               then concat('$',ao.compensationAmount)
                               when ct.compensationType = '% of Sales Price'
                               then concat(ao.compensationAmount,' ',ct.compensationTypeUnit)
                               else ao.compensationAmount
                           end compensationAmount, ao.retainerFee, ao.retainerCredited, ao.lengthOfService, ao.expirationCompensation, ao.expirationCompTimeFrame, ao.offerDesc, DATE_FORMAT(ao.offerTimestamp, '%m/%d/%Y %r') offerTimestamp, bam.buyerStatus, concat(substr(a.firstname,1,1), substr(a.lastname,1,1), ao.agentofferid) dispIdentifier
                     from AgentOffers ao
                     join Agents a on a.userid = ao.agentid
                     join AgentBuyerMatch bam on bam.buyerid = ao.buyerid and bam.agentid = a.userid
                     join LevelsOfService los on los.levelofserviceid = ao.levelofserviceid
                     join CompensationTypes ct on ct.compensationtypeid = ao.compensationtypeid
                     join OfferTypes ot on ot.offertypeid = ao.offertypeid
                    where bam.buyeragentmatchid = ?
                      and ao.agentid = ?
                    order by bam.buyerStatus, ao.entrytimestamp desc`;
      db.query(query, [buyeragentmatchid, agentid], (error, results) => {
        if (error) {
          console.error('Error fetching buyer profile:', error);
          return res.status(500).send('Server error');
        }
        if (results.length === 0) {
          return res.status(404).send('NotFound');
        }
        res.json(results);
      });
    }
  }
});

router.get('/getRequestCounts', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Profile';
    res.redirect('/');
  }
  else {
    const userid = req.session.userid;
    var query = `select case when os.offerStatus in ('New','Read')
                              then 'New'
                              else os.offerStatus
                         end agentStatus, concat('(',count(bam.agentid),')') cnt
                    from OfferStatuses os 
                         left outer join AgentBuyerMatch bam on bam.agentStatus = os.offerStatus and bam.agentid = ?
                   where os.userType = 'Agent'
                   group by 1`;
    db.query(query, [userid], (error, results) => {
      if (error) {
        console.error('Error fetching buyer profile:', error);
        return res.status(500).send('Server error');
      }
      res.json(results);
    });
  }
});

// Route to get the buyer's profile
router.get('/getRequests', (req, res) => {
  const datatype = req.query.datatype;
  if (!req.session.user) {
    req.session.message = 'Please login to access your Profile';
    res.redirect('/');
  }
  else {
    const datatype = req.query.datatype;
    const buyerid = req.query.buyerid;
    const userid = req.session.userid;
    if (!buyerid) {
      var query = `select bam.agentid, bam.buyerid, bam.buyerrequestid, bam.buyeragentmatchid, bam.bathrooms_min, bam.bedrooms_min, bam.buyerType, bam.preferredLanguages, bam.prequalified, format(bam.price_min,0) price_min, format(bam.price_max,0) price_max, bam.propertyType, bam.squareFootage_min, bam.squareFootage_max, bam.timeFrame, DATE_FORMAT(bam.entrytimestamp, '%m/%d/%Y %r') entrytimestamp, bam.zipCodes, bam.agentStatus, concat(substr(b.firstname,1,1), substr(b.lastname,1,1), bam.buyeragentmatchid) dispIdentifier
                     from AgentBuyerMatch bam
                          join Buyers b on b.userid = bam.buyerid
                    where bam.agentid = ?
                      and if(bam.agentStatus = 'Read','New', bam.agentStatus) = ?
                      order by bam.agentStatus, bam.entrytimestamp desc`;
      db.query(query, [userid, datatype], (error, results) => {
        if (error) {
          console.error('Error fetching buyer profile:', error);
          return res.status(500).send('Server error');
        }
        res.json(results);
      });
    }
    else {
      var query = `select bam.agentid, bam.buyerid,  bam.buyerrequestid, bam.bathrooms_min, bam.bedrooms_min, bam.buyerType, bam.preferredLanguages, bam.prequalified, format(bam.price_min,0) price_min, format(bam.price_max,0) price_max, bam.propertyType, bam.squareFootage_min, bam.squareFootage_max, bam.timeFrame, DATE_FORMAT(bam.entrytimestamp, '%m/%d/%Y %r') entrytimestamp, bam.zipCodes, bam.agentStatus, concat(substr(b.firstname,1,1), substr(b.lastname,1,1), bam.buyeragentmatchid) dispIdentifier
                     from AgentBuyerMatch bam
                          join Buyers b on b.userid = bam.buyerid
                    where bam.agentid = ?
                      and bam.buyerid = ?
                      and if(bam.agentStatus = 'Read','New', bam.agentStatus) = ?
                      order by bam.agentStatus, bam.entrytimestamp desc`;
      db.query(query, [userid, buyerid, datatype], (error, results) => {
        if (error) {
          console.error('Error fetching buyer profile:', error);
          return res.status(500).send('Server error');
        }
        if (results.length === 0) {
          return res.status(404).send('NotFound');
        }
        res.json(results);
      });
    }
  }
});

// router.get('/declineRequest', (req, res) => {
//   const buyerid = req.query.buyerid;
//   const updateQuery = 'update AgentBuyerMatch set agentStatus = "Declined" WHERE agentid = ? and buyerid = ?';
//   db.query(updateQuery, [req.session.userid, buyerid], (err, result) => {
//     if (err) throw err;
//     res.json({ success: true });
//   });
// });

router.post('/setStatus', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to save changes';
    res.redirect('/');
  }
  else {
    const status = req.body.status;
    const userType = req.session.userType;
    if (userType === 'Buyer') {
      var buyerid = req.session.userid;
      var agentid = req.body.agentid;
      updateQuery = 'update AgentBuyerMatch set buyerStatus = ? where agentid = ? and buyerid = ?';
    }
    else {
      var agentid = req.session.userid;
      var buyerid = req.body.buyerid;
      updateQuery = 'update AgentBuyerMatch set agentStatus = ? where agentid = ? and buyerid = ?';
    }
    db.query(updateQuery, [status, agentid, buyerid], (error, result) => {
      if (error) {
        console.error('Error saving status:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ success: true });
    });
  }
});


router.post('/saveoffer', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to save changes';
    res.redirect('/');
  }
  else {
    const userid = req.session.userid;
    const action = req.body.action;
    const offerStatus = 'Offered';
    const { buyerid, buyerrequestid, offerType, compensationType, levelOfService, compensationAmount, retainerFee, retainerCredited, lengthOfService, expirationCompensation, expirationCompTimeFrame, offerDesc } = req.body;
    if (action === 'Update') {
      insertQuery = `UPDATE AgentOffers 
                        set offertypeid = ?, 
                            compensationtypeid = ?, 
                            levelofServiceid = ?, 
                            compensationAmount = ?, 
                            retainerFee = ?, 
                            retainerCredited = ?, 
                            lengthOfService = ?, 
                            expirationCompensation = ?, 
                            expirationCompTimeFrame = ?, 
                            offerDesc = ?, 
                            offerStatus = ? 
                      where agentid = ? 
                        and buyerid = ?`;
    } else {
      insertQuery = `INSERT INTO AgentOffers (offertypeid, compensationtypeid, levelofServiceid, compensationAmount, retainerFee, retainerCredited, lengthOfService, expirationCompensation, expirationCompTimeFrame, offerDesc, offerStatus, agentid, buyerid, buyerrequestid) 
                     values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    }
    console.log('Insert Query:', insertQuery);
    console.log('Values:', [offerType, compensationType, levelOfService, compensationAmount, retainerFee, retainerCredited, lengthOfService, expirationCompensation, expirationCompTimeFrame, offerDesc, offerStatus, userid, buyerid, buyerrequestid]);
    db.query(insertQuery, [offerType, compensationType, levelOfService, compensationAmount, retainerFee, retainerCredited, lengthOfService, expirationCompensation, expirationCompTimeFrame, offerDesc, offerStatus, userid, buyerid, buyerrequestid], (error, result) => {
      if (error) {
        console.error('Error saving offer:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ success: true });
    });
  }
});

router.post('/save-OfferDefaults', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to save changes';
    res.redirect('/');
  }
  else {
    const userid = req.session.userid;
    const { offerType, compensationType, levelOfService, compensationAmount, retainerFee, retainerCredited, lengthOfService, expirationCompensation, expirationCompTimeFrame, offerDesc } = req.body;
    insertQuery = 'REPLACE INTO AgentOfferDefaults (agentid, offertypeid, compensationtypeid, levelofserviceid, compensationAmount, retainerFee, retainerCredited, lengthOfService, expirationCompensation, expirationCompTimeFrame, offerDesc) values (?,?,?,?,?,?,?,?,?,?,?)';
    db.query(insertQuery, [userid, offerType, compensationType, levelOfService, compensationAmount, retainerFee, retainerCredited, lengthOfService, expirationCompensation, expirationCompTimeFrame, offerDesc], (error, result) => {
      if (error) {
        console.error('Error saving offer:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ success: true });
    });
  }
});

router.get('/get-OfferDefaults', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to change setting';
    res.redirect('/');
  }
  else {
    const userid = req.session.userid;
    const query = `SELECT offertypeid, compensationtypeid, levelofserviceid, compensationAmount, retainerFee, retainerCredited, lengthOfService, expirationCompensation, expirationCompTimeFrame, offerDesc 
                     FROM AgentOfferDefaults 
                    WHERE agentid = ?`;
    db.query(query, [userid], (error, results) => {
      if (error) {
        console.error('Error fetching offer defaults:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (results.length === 0) {
        return res.status(404).send('No Defaults');
      }
      res.json(results[0]);
    });
  }
});

router.get('/get-offerdetails', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login';
    res.redirect('/');
  }
  else {
    const userid = req.session.userid;
    const buyerid = req.query.buyerid;
    const query = `SELECT offertypeid, compensationtypeid, levelofserviceid, compensationAmount, retainerFee, retainerCredited, lengthOfService, expirationCompensation, expirationCompTimeFrame, offerDesc 
                     FROM AgentOffers 
                    WHERE agentid = ? and buyerid = ?`;
    db.query(query, [userid, buyerid], (error, results) => {
      if (error) {
        console.error('Error fetching offer defaults:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (results.length === 0) {
        return res.status(404).send('No Defaults');
      }
      res.json(results[0]);
    });
  }
});

// Route to get the buyer's profile
router.get('/profile_b', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Profile';
    res.redirect('/');
  }
  else {
    const userid = req.session.userid;
    const query = `select b.userid, b.firstName, b.lastName, b.address, b.city, b.state, b.userid, b.zip, b.email, b.phoneNumber, 
                          ifnull(brd.bathrooms_min,0) bathrooms_min, ifnull(brd.bathrooms_max,0) bathrooms_max, ifnull(brd.bedrooms_min,0) bedrooms_min, ifnull(brd.bedrooms_max,0) bedrooms_max, getBuyerTypesByIds(brd.buyerType) buyerType, ifnull(brd.preferredLanguages,'') preferredLanguages, brd.prequalified, ifnull(brd.price_min,0) price_min, 
                          ifnull(brd.price_max,0) price_max, ifnull(brd.propertyType,'') propertyType, ifnull(brd.squareFootage_min,0) squareFootage_min, ifnull(brd.squareFootage_max,0) squareFootage_max, ifnull(trim(replace(timeframe,substring_index(timeFrame,' ',-1),'')),'') timeFrame, brd.prequalifiedFile, los.levelOfService levelOfServiceDisp, los.levelofserviceid,
                          ifnull(brd.prequalifiedAmount,0) prequalifiedAmount, brd.buyerrequestid, brd.buyerType buyerTypeDisp, if(brd.prequalified = 'Yes',concat('Prequalified for ',CONCAT('$', FORMAT(brd.prequalifiedAmount, 0))),'Not Prequalified') prequalifiedDisp,
                          substring_index(timeFrame,' ',-1) timeframeUnit
                     from Buyers b
                          left outer join BuyerRequestDetails brd on (b.userid = brd.userid)
                          join LevelsOfService los on los.levelofserviceid = brd.levelofserviceid
                    where b.userid = ?`;
    db.query(query, [userid], (error, results) => {
      if (error) {
        console.error('Error fetching buyer profile:', error);
        return res.status(500).send('Server error');
      }
      if (results.length === 0) {
        return res.status(404).send('User not found');
      }
      req.session.buyerrequestid = results[0].buyerrequestid;
      res.render('profile_b', { buyer: results[0] });
    });
  }
});

// Route to get the buyer's profile
router.get('/populateSearchInfoDisplay', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Profile';
    res.redirect('/');
  }
  else {
    const userid = req.session.userid;
    const buyerrequestid = req.session.buyerrequestid;
    const query = `select concat('<div class="buyertype-container">',
                          '<u>Buyer Type</u><br>', getBuyerTypesByIds(brd.buyerType),'</div>',
                          'Property Type: ',propertyType,'<br>',
                          'Service Level: ',levelOfService,'<br>',
                          'Minimum Bedrooms: ',bedrooms_min,'<br>',
                          'Minimum Bathrooms: ',bathrooms_min,'<br>',
                          'SqFt Range: ',FORMAT(brd.squareFootage_min, 0),' to ',FORMAT(brd.squareFootage_max, 0),'<br>',
                          'Price Range: ',CONCAT('$', FORMAT(brd.price_min, 0)),' to ',CONCAT('$', FORMAT(brd.price_max, 0)),'<br>',
                          'Timeframe: ',timeFrame,'<br>',           
                          if(brd.prequalified = 'Yes',concat('Prequalified for ',CONCAT('$', FORMAT(brd.prequalifiedAmount, 0))),'Not Prequalified'),'<br>',
                          'Preferred Languages: ',preferredLanguages,'<br>') searchInfoDisplay, buyerrequestid
                     from Buyers b
                          left outer join BuyerRequestDetails brd on (b.userid = brd.userid)
                          join LevelsOfService los on los.levelofserviceid = brd.levelofserviceid
                    where b.userid = ?`;
    db.query(query, [userid], (error, results) => {
      if (error) {
        console.error('Error fetching offer defaults:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (results.length === 0) {
        return res.status(404).send('No Defaults');
      }
      if (buyerrequestid != 0 && buyerrequestid != results[0].buyerrequestid) {
        req.session.buyerrequestid = results[0].buyerrequestid;
      }
      res.json({ results });
    });
  }
});

// Route to get the buyer's profile
router.get('/dashboard_b', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Dashboard';
    res.redirect('/');
  }
  else {
    const userid = req.session.userid;
    req.session.buyerrequestid = 0;
    const query = `select b.userid, b.firstName, b.lastName, b.address, b.city, b.state, b.userid, b.zip, b.email, b.phoneNumber, 
                          ifnull(brd.bathrooms_min,0) bathrooms_min, ifnull(brd.bathrooms_max,0) bathrooms_max, ifnull(brd.bedrooms_min,0) bedrooms_min, ifnull(brd.bedrooms_max,0) bedrooms_max, getBuyerTypesByIds(brd.buyerType) buyerType, ifnull(brd.preferredLanguages,'') preferredLanguages, brd.prequalified, ifnull(brd.price_min,0) price_min, 
                          ifnull(brd.price_max,0) price_max, ifnull(brd.propertyType,'') propertyType, ifnull(brd.squareFootage_min,0) squareFootage_min, ifnull(brd.squareFootage_max,0) squareFootage_max, ifnull(trim(replace(timeframe,substring_index(timeFrame,' ',-1),'')),'') timeFrame, brd.prequalifiedFile, los.levelOfService levelOfServiceDisp, los.levelofserviceid,
                          ifnull(brd.prequalifiedAmount,0) prequalifiedAmount, brd.buyerrequestid, brd.buyerType buyerTypeDisp, if(brd.prequalified = 'Yes',concat('Prequalified for ',CONCAT('$', FORMAT(brd.prequalifiedAmount, 0))),'Not Prequalified') prequalifiedDisp,
                          substring_index(timeFrame,' ',-1) timeframeUnit
                     from Buyers b
                          left outer join BuyerRequestDetails brd on (b.userid = brd.userid)
                          join LevelsOfService los on los.levelofserviceid = brd.levelofserviceid
                    where b.userid = ?`;
    db.query(query, [userid], (error, results) => {
      if (error) {
        console.error('Error fetching buyer profile:', error);
        return res.status(500).send('Server error');
      }
      if (results.length === 0) {
        return res.status(404).send('User not found');
      }
      req.session.buyerrequestid = results[0].buyerrequestid;
      res.render('dashboard_b', { buyer: results[0] });
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
router.post('/savePropertyChanges', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access your Profile';
    res.redirect('/');
  }
  else {
    const buyerrequestid = req.session.buyerrequestid;
    const { bathrooms_min, bathrooms_max, bedrooms_min, bedrooms_max, buyerType, 
            preferredLanguages, prequalified, price_min, price_max, propertyType, 
            squareFootage_min, squareFootage_max, timeFrame, levelofserviceid, 
            prequalifiedAmount, userid 
          } = req.body;
    let queryParams;
    let query;

    if (buyerrequestid === 0) {
      query = `INSERT Into BuyerRequestDetails (bathrooms_min, bathrooms_max, bedrooms_min, bedrooms_max, buyerType, preferredLanguages, prequalified, price_min, price_max, propertyType, squareFootage_min, squareFootage_max, timeFrame, levelofserviceid, prequalifiedAmount, userid)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      queryParams = [bathrooms_min, bathrooms_max, bedrooms_min, bedrooms_max, buyerType,
                     preferredLanguages, prequalified, price_min, price_max, propertyType,
                     squareFootage_min, squareFootage_max, timeFrame, levelofserviceid,
                     prequalifiedAmount, userid];
    } else {
      query = 'UPDATE BuyerRequestDetails SET bathrooms_min = ?, bathrooms_max = ?, bedrooms_min = ?, bedrooms_max = ?, buyerType = ?, preferredLanguages = ?, prequalified = ?, price_min = ?, price_max = ?, propertyType = ?, squareFootage_min = ?, squareFootage_max = ?, timeFrame = ?, levelofserviceid = ?, prequalifiedAmount = ? WHERE buyerrequestid = ?';
      queryParams = [bathrooms_min, bathrooms_max, bedrooms_min, bedrooms_max, buyerType,
                     preferredLanguages, prequalified, price_min, price_max, propertyType,
                     squareFootage_min, squareFootage_max, timeFrame, levelofserviceid,
                     prequalifiedAmount, buyerrequestid];
    }
    db.query(query, queryParams, (error, results) => {
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

router.get('/removeOffer', (req, res) => {
  const buyerid = req.query.buyerid;
  const updateQuery = 'delete from AgentOffers WHERE agentid = ? and buyerid = ?';
  db.query(updateQuery, [req.session.userid, buyerid], (err, result) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

// router.get('/declineRequest', (req, res) => {
//   const buyerid = req.query.buyerid;
//   const updateQuery = 'update AgentBuyerMatch set agentStatus = "Declined" WHERE agentid = ? and buyerid = ?';
//   db.query(updateQuery, [req.session.userid, buyerid], (err, result) => {
//     if (err) throw err;
//     res.json({ success: true });
//   });
// });


// Login route
// router.get('/login', (req, res) => {
//   const message = req.session.message;

//   // Destroy the session or clear the cookie
//   if (req.session.killsession) {
//     req.session.destroy((err) => {
//       if (err) {
//         return console.error('Failed to destroy the session on logout', err);
//         res.clearCookie('connect.sid'); // If you're using session cookies, clear them
//       }
//     });
//   }
//   res.render('login', { query: req.query, message: message });
// });

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
      var userQuery = 'SELECT password, userid, firstname, lastname, emailverified, paymentSuccessful FROM Agents WHERE email = ?';
      var htmlpage = 'login_a';
    } else if (userType === 'Buyer') {
      var userQuery = 'SELECT password, userid, firstname, lastname, emailverified, paymentSuccessful FROM Buyers WHERE email = ?';
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
        const { userid, firstname, lastname, emailverified, paymentSuccessful } = results[0];
        console.log('paymentSuccessful:', paymentSuccessful);
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
            req.session.agentid = 0;
            req.session.buyerid = 0;
            req.session.paymentSuccessful = paymentSuccessful;
            console.log('User logged in:', email, userType);
            if (userType === 'Agent') {
              req.session.agentid = userid;
              var updateQuery = 'update Agents set lastlogin = now() WHERE email = ?';
            } else if (userType === 'Buyer') {
              req.session.buyerid = userid;
              var updateQuery = 'update Buyers set lastlogin = now() WHERE email = ?';
            }
            db.query(updateQuery, [email], (error, results) => {
              if (error) {
                return res.render(htmlpage, { message: 'Error during database update' });
              }
            });
            res.json({
              success: true,
              firstLogin: false,
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

// Route to get city and state by zip code
router.get('/get-counties', (req, res) => {
  const stateSelect = req.query.stateSelect;
  const query = 'SELECT distinct county FROM ZipCodes WHERE state = ? order by county';
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

// Route to get states
router.get('/get-levelofservice', (req, res) => {
  const query = 'SELECT levelOfService, levelofserviceid FROM LevelsOfService order by levelofserviceid';
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      res.json({ results });
    } else {
      res.status(404).json({ error: 'No levels of service found' });
    }
  });
});

router.get('/get-offertypes', (req, res) => {
  const query = 'SELECT offerType, offertypeid FROM OfferTypes order by offertypeid';
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      res.json({ results });
    } else {
      res.status(404).json({ error: 'No offer types found' });
    }
  });
});

router.get('/get-compensationtypes', (req, res) => {
  const query = 'SELECT compensationType, compensationtypeid FROM CompensationTypes order by compensationtypeid';
  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      res.json({ results });
    } else {
      res.status(404).json({ error: 'No compensation types found' });
    }
  });
});

// Route to get states
router.get('/check-zipcode', (req, res) => {
  const zipCode = req.query.stateSelect;
  const userType = req.session.userType;
  const userid = req.session.userid;
  if (userType === 'Agent') {
    var query = 'SELECT count(*) cnt FROM AgentZipCodes where zipCode = ? and userid = ?';
  }
  else if (userType === 'Buyer') {
    var query = 'SELECT count(*) cnt FROM BuyerZipCodes where zipCode = ? and userid = ?';
  }
  db.query(query, [zipCode, userid], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    else if (results[0].cnt > 0) {
      res.json({ zipCodeResult: 'Selected' });
    } else {
      const query = 'SELECT count(*) cnt FROM ZipCodes where zipCode = ?';
      db.query(query, [zipCode], (error, results) => {
        if (error) {
          return res.status(500).json({ error: 'Internal server error' });
        }
        if (results[0].cnt > 0) {
          res.json({ zipCodeResult: 'Valid' });
        } else {
          res.json({ zipCodeResult: 'Invalid' });
        }
      });
    }
  });
});

// Route to get city and state by zip code
router.get('/get-zipcodes', (req, res) => {
  const stateSelect = req.query.stateSelect;
  const citySelect = req.query.citySelect;
  userid = req.session.userid;
  userType = req.session.userType;

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

// Route to get county and state by zip code
router.get('/get-countyzipcodes', (req, res) => {
  const stateSelect = req.query.stateSelect;
  const countySelect = req.query.countySelect;
  userid = req.session.userid;
  userType = req.session.userType;

  if (userType === 'Agent') {
    var query = `SELECT zipCode 
                   FROM ZipCodes z 
                  WHERE state = ? and county = ?
                    and not exists(select 1 
                                     from AgentZipCodes u 
                                    where userid = ? 
                                      and u.zipCode = z.zipCode) 
                  order by zipCode`;
  } else if (userType === 'Buyer') {
    var query = `SELECT zipCode
    FROM ZipCodes z 
    WHERE state = ? and county = ?
      and not exists(select 1 
                       from BuyerZipCodes u 
                      where userid = ? 
                        and u.zipCode = z.zipCode) 
    order by zipCode`;
  }

  db.query(query, [stateSelect, countySelect, userid], (error, results) => {
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
  // const userid = req.session.userid;
  // const userType = req.session.userType;
  // First, delete all zip codes for this user
  if (userType === 'Agent') {
    var query = 'DELETE FROM AgentZipCodes WHERE userid = ?';
  }
  else if (userType === 'Buyer') {
    var query = 'DELETE FROM BuyerZipCodes WHERE userid = ?';
  }
  db.query(query, [userid], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  // Now insert the new zip codes
  if (zipCodes.length > 0) {
    if (userType === 'Agent') {
      var insertQuery = 'INSERT INTO AgentZipCodes (userid, zipCode) VALUES ?';
    }
    else if (userType === 'Buyer') {
      var insertQuery = 'INSERT INTO BuyerZipCodes (userid, zipCode) VALUES ?';
    }
    const values = zipCodes.map(zipCode => [userid, zipCode]);
    db.query(insertQuery, [values], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ success: true });
    });
  }
  else {
    res.json({ success: true });
  }
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
  const nozips = [
    {
      zipCode: 'No Zip Codes Selected'
    }];
  if (userType === 'Agent') {
    var query = 'SELECT u.zipCode, z.city, z.state, z.stateName FROM AgentZipCodes u, ZipCodes z WHERE u.zipCode = z.zipCode and u.userid = ? order by z.zipCode';
  } else if (userType === 'Buyer') {
    var query = 'SELECT u.zipCode, z.city, z.state, z.stateName FROM BuyerZipCodes u, ZipCodes z WHERE u.zipCode = z.zipCode and u.userid = ? order by z.zipCode';
  }
  db.query(query, [userid], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    } else if (results.length === 0) {
      res.json(nozips);
    } else {
      res.json({ results });
    }
  });
});

// // Route to serve the dashboard_b page
// router.get('/dashboard_b', (req, res) => {
//   if (!req.session.user) {
//     req.session.message = 'Please login to access your Dashboard';
//     //    console.log('Redirecting to:', redirectto);
//     res.redirect('/');
//   }
//   else {
//     res.render('dashboard_b', { user: req.session.user, firstname: req.session.firstname, userid: req.session.userid, lastname: req.session.lastname });
//   }
// });

router.get('/settings_b', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access the Settings page';
    //    console.log('Redirecting to:', redirectto);
    res.redirect('/');
  }
  else {
    res.render('settings_b');
  }
});

router.get('/settings_a', (req, res) => {
  if (!req.session.user) {
    req.session.message = 'Please login to access the Settings page';
    //    console.log('Redirecting to:', redirectto);
    res.redirect('/');
  }
  else {
    res.render('settings_a', { user: req.session.user, firstname: req.session.firstname, userid: req.session.userid, lastname: req.session.lastname });
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
      res.redirect('login_a');
    });
  } else if (type == 'B') {
    db.query('UPDATE Buyers SET emailverified = 1 WHERE email = ? AND verificationtoken = ?', [email, token], (err, result) => {
      res.cookie('data', 'Email Verified', { maxAge: 900000, httpOnly: true });
      if (err) return res.status(500).send('Database error during email verification.');
      if (result.affectedRows === 0) return res.status(404).send('Token not found or email already verified.');
      res.redirect('login_b');
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

router.get('/getBuyerTypes', (req, res) => {
  const query = 'SELECT buyertypeid, buyerType FROM BuyerTypes order by buyertypeid';
  const buyerid = req.session.userid;
  db.query(query, (error, buyerTypes) => {
    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (buyerTypes.length > 0) {
      const typeQuery = 'SELECT buyerType FROM BuyerRequestDetails WHERE userid = ?';
      db.query(typeQuery, [buyerid], (error, buyerTypeResults) => {
        if (error) {
          console.log('Error:', error);
          return res.status(500).json({ error: 'Internal server error' });
        }
        if (buyerTypeResults == 0) {
          buyerTypeResults = [];
        }
        res.json({ buyerTypes, buyerTypeResults });
      });
    } else {
      res.status(404).json({ error: 'No buyer types found' });
    }
  });
});

module.exports = router;
