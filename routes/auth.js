const express = require('express');
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
const router = express.Router();
const session = require('express-session');

playfab.settings.titleId = 'F06D';

router.post('/login', function(req, res, next) {
  playfab.LoginWithEmailAddress({
    Email: req.body.email,
    Password: req.body.password,
    TitleId: playfab.settings.titleId
  }, function (err, result) {
    if (err) {
      res.redirect('/login');
    } else {
      req.session.userId = result.data.PlayfabId;
      req.session.sessionTicket = result.data.sessionTicket;
      res.redirect('/play');
    }
  })
});

router.post('/register', function(req, res, next) {
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
  })
});

module.exports = router;
