const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/play', {
    title: 'Igraj Munch Pong',
    active: 'play'
  });
});

module.exports = router;
