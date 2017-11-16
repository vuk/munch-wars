const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/awards', {
    title: 'Nagrade',
    active: 'awards'
  });
});

module.exports = router;
