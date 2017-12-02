var express = require('express');
var router = express.Router();
var socket = require('../controllers/socket');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.userId) {
    res.render('pages/profile', {
      title: 'Profil',
      active: 'play',
      playfabId: req.session.userId || null
    });
  } else {
    res.redirect('/play');
  }
});

router.get('/actives', function (req, res, next) {
  console.log(req.app.get('socketio').sockets);
  res.json(req.app.get('socketio').sockets);
  /*res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(req.app.get('socketio').sockets));*/
  //res.json({ a: 1 });
});

module.exports = router;
