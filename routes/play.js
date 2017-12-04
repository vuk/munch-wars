const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.query.game);
  if(req.session.userId) {
    res.render('pages/play', {
      title: 'Igraj Munch Pong',
      active: 'play',
      playfabId: req.session.userId || null,
      opponentId: req.query.game || null,
      profile: req.session.profile || null
    });
  } else {
    res.render('pages/login', {
      title: 'Prijavite se',
      active: 'play',
      playfabId: req.session.userId || null
    });
  }
});

router.get('/opponents', function(req, res, next) {
  if(req.session.userId) {
    res.render('pages/opponents', {
      title: 'Igraj Munch Pong',
      active: 'play',
      playfabId: req.session.userId || null,
      opponentId: req.query.game || null
    });
  } else {
    res.render('pages/login', {
      title: 'Prijavite se',
      active: 'play',
      playfabId: req.session.userId || null
    });
  }
});

module.exports = router;
