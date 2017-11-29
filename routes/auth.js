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
    console.log(req.error, req.user, req.info);
    if (req.error) {
      res.redirect('/login');
    } else {
      req.session.userId = req.user.result.data.PlayFabId;
      req.session.sessionTicket = req.user.result.data.SessionTicket;
      res.redirect('/play');
    }
  });

/*passport.authenticate('facebook',
  function (error, user, info) {
    console.log('error', error, 'user', user, 'info', info);
  })*/
/*router.get('/social-login', function (req, res, next) {
  if (req.session.userId) {
    res.redirect('/play');
  } else {
    playfab.LoginWithFacebook({}, function (err, result) {

    });
  }
});*/

router.post('/register', function (req, res, next) {
  console.log(req.body);
  playfab.RegisterPlayFabUser({
    DisplayName: req.body.username,
    Username: req.body.username,
    Email: req.body.email,
    Password: req.body.password,
    TitleId: playfab.settings.titleId
  }, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400);
      res.json(err);
    } else {
      res.status(200);
      res.json(result);
      console.log(result);
    }
  });
});

module.exports = router;
