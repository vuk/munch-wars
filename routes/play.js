const express = require('express');
const router = express.Router();
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.query.game);
  if(req.session.userId && req.query.game) {
    playfab.GetPlayerProfile({
      PlayFabId: req.query.game,
      ProfileConstraints: {
        ShowDisplayName: true,
        ShowLinkedAccounts: true
      }
    }, (error, response) => {
      if (error) {
        console.log(error);
        res.redirect('/play');
      } else {
        res.render('pages/play', {
          title: 'Igraj Munch Pong',
          active: 'play',
          playfabId: req.session.userId || null,
          opponentId: req.session.userId === req.query.game ? null : req.query.game || null,
          opponent: req.session.userId === req.query.game ? null : response.data.PlayerProfile,
          profile: req.session.profile || null,
          computer: req.query.computer || false,
          noevent: req.query.noevent || false
        });
      }
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
