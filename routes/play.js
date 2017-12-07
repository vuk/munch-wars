const express = require('express');
const router = express.Router();
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.query.game);
  if(req.session.userId && (req.query.game || req.query.computer)) {
    playfab.GetPlayerProfile({
      PlayFabId: req.query.game,
      ProfileConstraints: {
        ShowDisplayName: true,
        ShowLinkedAccounts: true
      }
    }, (error, response) => {
        res.render('pages/play', {
          title: 'Igraj Munch Pong',
          active: 'play',
          playfabId: req.session.userId || null,
          opponentId: req.session.userId === req.query.game ? null : req.query.game || null,
          opponent: req.query.computer || req.query.game && req.session.userId === req.query.game ? null : response.data.PlayerProfile,
          profile: req.session.profile || null,
          computer: req.query.computer || false,
          noevent: req.query.noevent || false
        });
    });
  } else if (req.session.userId && !req.query.game && !req.query.computer) {
    res.redirect('/profile');
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
