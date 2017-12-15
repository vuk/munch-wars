const express = require('express');
const router = express.Router();
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.userId && (req.query.game || req.query.computer)) {
    let availableOpponent = null;
    let opponentsOpponent = null;
    if (req.query.game) {
      availableOpponent = req.app.get('socketio').activeUsers[req.query.game].available;
      opponentsOpponent = req.app.get('socketio').activeUsers[req.query.game].opponent;
    }
    if (req.query.computer || availableOpponent || opponentsOpponent === req.session.userId || req.query.game === req.session.userId) {
      let token = Date.now();
      if (req.query.game) {
        req.app.get('socketio').activeUsers[req.query.game].available = false;
        req.app.get('socketio').activeUsers[req.query.game].opponent = req.session.userId;
        req.app.get('socketio').activeUsers[req.query.game].verificationToken = token;
      }
      req.app.get('socketio').activeUsers[req.session.userId].available = false;
      req.app.get('socketio').activeUsers[req.session.userId].opponent = req.query.game ? req.query.game : null;
      req.app.get('socketio').activeUsers[req.session.userId].verificationToken = token;
    } else {
      res.redirect('/play/opponents');
    }
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
          stats: req.session.stats || null,
          computer: req.query.computer || false,
          noevent: req.query.noevent || false,
          verify: req.app.get('socketio').activeUsers[req.session.userId].verificationToken
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
