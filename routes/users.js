var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.userId) {
    res.render('pages/profile', {
      title: 'Profil',
      active: 'play',
      playfabId: req.session.userId || null,
      profile: req.session.profile || null,
      stats: req.session.stats || null
    });
  } else {
    res.redirect('/play');
  }
});

router.get('/actives', function (req, res, next) {
  let validUsers = {};
  Object.keys(req.app.get('socketio').activeUsers).map((key) => {
    console.log(req.session.userId);
    if(Date.now() - req.app.get('socketio').activeUsers[key].time < 10*60*1000 && req.app.get('socketio').activeUsers[key].profile.PlayerId !== req.session.userId){
      validUsers[key] = req.app.get('socketio').activeUsers[key];
    }
  });
  res.json(validUsers);
});

module.exports = router;
