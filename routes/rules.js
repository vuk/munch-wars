const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/rules', {
    title: 'Pravila',
    active: 'rules',
    playfabId: req.session.userId || null
  });
});

module.exports = router;
