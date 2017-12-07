var express = require('express');
var router = express.Router();
const playfabServer = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');

/* GET users listing. */
router.get('/', function(req, res, next) {
  playfabServer.settings.developerSecretKey = 'X6GUF8OHOC8OIXU1W9P3F77SIJW9X5EZESCNTG8J53G97ANDEE';
  if(req.session.userId) {
    var leaderboardPosition = playfabServer.GetLeaderboardAroundUser({
      PlayFabId: req.session.userId,
      StatisticName: "Total Points",
      MaxResultsCount : 1
    });
    log.debug(leaderboardPosition.Position);
    var leaderboardPosition2 = playfabServer.GetLeaderboardAroundUser({
      PlayFabId: req.session.userId,
      StatisticName: "Weekly Points",
      MaxResultsCount : 1
    });
    var leaderboardPosition3 = playfabServer.GetLeaderboardAroundUser({
      PlayFabId: req.session.userId,
      StatisticName: "Points",
      MaxResultsCount : 1
    });
    res.render('pages/profile', {
      title: 'Profil',
      active: 'play',
      playfabId: req.session.userId || null,
      totalRank: leaderboardPosition,
      weeklyRank: leaderboardPosition2,
      dailyRank: leaderboardPosition3,
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
