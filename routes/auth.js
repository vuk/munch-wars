const express = require('express');
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
const router = express.Router();
const session = require('express-session');
const passport = require('passport');

playfab.settings.titleId = 'F06D';

router.post('/login', function (req, res, next) {
  playfab.LoginWithEmailAddress({
    Email: req.body.email,
    Password: req.body.password,
    TitleId: playfab.settings.titleId
  }, function (err, result) {
    if (err) {
      res.redirect('/login');
    } else {
      req.session.userId = result.data.PlayFabId;
      req.session.sessionTicket = result.data.SessionTicket;
      res.redirect('/play');
    }
  });
});

router.get('/register', function (req, res, next) {
  if (req.session.userId) {
    res.redirect('/play');
  } else {
    res.render('pages/register', {
      title: 'Registrujte se',
      active: 'play'
    });
  }
});

router.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));
router.get('/social-login', passport.authenticate('facebook'),
  function (req, res, next) {
    if (req.error) {
      res.redirect('/login');
    } else {
      req.session.userId = req.user.result.data.PlayFabId;
      req.session.sessionTicket = req.user.result.data.SessionTicket;
      res.redirect('/play');
    }
  });

router.post('/register', function (req, res, next) {
  console.log(req.body);
  playfab.RegisterPlayFabUser({
    DisplayName: req.body.username,
    Username: req.body.username,
    Email: req.body.email,
    Password: req.body.password,
    TitleId: playfab.settings.titleId
  }, function (err, result) {
    if (req.error) {
      res.redirect('/login');
    } else {
      req.session.userId = result.data.PlayFabId;
      req.session.sessionTicket = result.data.SessionTicket;
      res.redirect('/play');
    }
  });
});

module.exports = router;
