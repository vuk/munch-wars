const express = require('express');
const router = express.Router();
const session = require('express-session');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.userId) {
    res.render('pages/play', {
      title: 'Igraj Munch Pong',
      active: 'play'
    });
  } else {
    res.render('pages/login', {
      title: 'Prijavite se',
      active: 'play'
    });
  }
});

module.exports = router;
