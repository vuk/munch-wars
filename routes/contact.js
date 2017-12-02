const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/contact', {
    title: 'Kontakt',
    active: 'contact',
    playfabId: req.session.userId || null
  });
});

module.exports = router;
