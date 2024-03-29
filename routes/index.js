const express = require('express');
const router = express.Router();
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');
const _ = require('lodash');
const config = require('../config');
playfab.settings.titleId = config.playfab.title;
playfab.settings.developerSecretKey = config.playfab.secret;

/* GET home page. */
router.get('/', function(req, res, next) {
  playfab.GetTitleData({
    Key: ['Black', 'White']
  }, (err, resp) => {
    if (!err) {
      let black;
      let white;
      if (resp.data.Data['White']) {
        white = resp.data.Data['White'];
      } else {
        white = 0;
      }
      while(white.toString().length < 5) {
        white = '0' + white;
      }
      if (resp.data.Data['Black']) {
        black = resp.data.Data['Black'];
      } else {
        black = 0;
      }
      while(black.toString().length < 5) {
        black = '0' + black;
      }
      res.render('pages/index', {
        title: 'Home | Munch Pong',
        active: 'index',
        playfabId: req.session.userId || null,
        white: white,
        black: black
      });
    }
  });
});

module.exports = router;
