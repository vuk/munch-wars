const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/winners', {
    title: 'Pobednici',
    active: 'winners'
  });
});

module.exports = router;
