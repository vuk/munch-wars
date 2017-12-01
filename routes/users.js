var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.userId) {
    res.render('pages/profile', {
      title: 'Profil',
      active: 'play'
    });
  } else {
    res.redirect('/play');
  }
});

module.exports = router;
