const express = require('express');
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
const router = express.Router();

playfab.settings.titleId = 'F06D';

router.post('/login', function(req, res, next) {
  playfab.LoginWithEmailAddress({
    Email: req.body.email,
    Password: req.body.password,
    TitleId: playfab.settings.titleId
  }, function (err, result) {
    if (error) {
      console.log(err);
    } else {
      console.log(result);
    }
  })
});

router.post('/register', function(req, res, next) {
  console.log(req);
  playfab.RegisterPlayFabUser({
    DisplayName: req.params.username,
    Username: req.params.username,
    Email: req.params.email,
    Password: req.params.password,
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
