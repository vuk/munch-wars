const express = require('express');
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
const router = express.Router();
const passport = require('passport');

playfab.settings.titleId = 'F06D';

router.post('/login', function (req, res, next) {
  playfab.LoginWithEmailAddress({
    Email: req.body.email,
    Password: req.body.password,
    TitleId: playfab.settings.titleId
  }, function (err, result) {
    if (err) {
      res.redirect('/play');
    } else {
      req.session.userId = result.data.PlayFabId;
      req.session.sessionTicket = result.data.SessionTicket;
      playfab.GetPlayerProfile({
        PlayFabId: result.data.PlayFabId,
        ProfileConstraints: {
          ShowDisplayName: true,
          ShowLinkedAccounts: true
        }
      }, (error, response) => {
        if (error) {
          console.log(error);
          res.redirect('/play');
        }
        else {
          playfab.GetPlayerStatistics({}, (err, stats) => {
            console.log(stats);
            delete response.data.PlayerProfile.TitleId;
            if (response.data.PlayerProfile.LinkedAccounts && response.data.PlayerProfile.LinkedAccounts[0].Username) {
              response.data.PlayerProfile.DisplayName = response.data.PlayerProfile.LinkedAccounts[0].Username;
            }
            req.session.profile = response.data.PlayerProfile;
            req.app.get('socketio').activeUsers[result.data.PlayFabId] = {
              profile: response.data.PlayerProfile,
              time: Date.now()
            };
            req.session.stats = stats;
            res.redirect('/profile');
          });
        }
      });
    }
  });
});

router.get('/register', function (req, res, next) {
  if (req.session.userId) {
    res.redirect('/profile');
  } else {
    res.render('pages/register', {
      title: 'Registrujte se',
      active: 'play',
      playfabId: req.session.userId || null
    });
  }
});

router.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));
router.get('/social-login', passport.authenticate('facebook'),
  (req, res, next) => {
    if (req.error) {
      res.redirect('/play');
    } else {
      req.session.userId = req.user.result.data.PlayFabId;
      req.session.sessionTicket = req.user.result.data.SessionTicket;
      playfab.GetPlayerProfile({
        PlayFabId: req.user.result.data.PlayFabId,
        ProfileConstraints: {
          ShowDisplayName: true,
          ShowLinkedAccounts: true
        }
      }, (error, response) => {
        if (error) {
          console.log(error);
          res.redirect('/play');
        }
        else {
          playfab.GetPlayerStatistics({}, (err, stats) => {
            console.log(stats);
            req.session.stats = stats;
            delete response.data.PlayerProfile.TitleId;
            if (response.data.PlayerProfile.LinkedAccounts && response.data.PlayerProfile.LinkedAccounts[0].Username) {
              response.data.PlayerProfile.DisplayName = response.data.PlayerProfile.LinkedAccounts[0].Username;
            }
            req.session.profile = response.data.PlayerProfile;
            req.app.get('socketio').activeUsers[req.session.userId] = {
              profile: response.data.PlayerProfile,
              time: Date.now()
            };
            res.redirect('/profile');
          });
        }
      });
    }
  });

router.post('/register', function (req, res, next) {
  playfab.RegisterPlayFabUser({
    DisplayName: req.body.username,
    Username: req.body.username,
    Email: req.body.email,
    Password: req.body.password,
    TitleId: playfab.settings.titleId
  }, function (err, result) {
    console.log(err);
    if (err) {
      res.render('pages/register', {
        title: 'Registrujte se',
        active: 'play',
        playfabId: req.session.userId || null,
        error: err.errorMessage
      });
    } else {
      console.log(result);
      req.session.userId = result.data.PlayFabId;
      req.session.sessionTicket = result.data.SessionTicket;
      res.redirect('/profile');
    }
  });
});

router.get('/logout', (req, res, next) => {
  req.session.destroy(function(err) {
    // cannot access session here
    res.redirect('/');
  })
});

module.exports = router;
