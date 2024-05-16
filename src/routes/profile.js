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
  
