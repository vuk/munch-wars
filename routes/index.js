const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index', {
    title: 'Home | Munch Pong',
    active: 'index',
    playfabId: req.session.userId || null
  });
});

module.exports = router;
