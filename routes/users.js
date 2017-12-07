var express = require('express');
var router = express.Router();
const playfabServer = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');

/* GET users listing. */
router.get('/', function (req, res, next) {
  playfabServer.settings.developerSecretKey = 'X6GUF8OHOC8OIXU1W9P3F77SIJW9X5EZESCNTG8J53G97ANDEE';
  if (req.session.userId) {
    var leaderboardPosition;
    var leaderboardPosition2;
    var leaderboardPosition3;
    playfabServer.GetLeaderboardAroundUser({
      PlayFabId: req.session.userId,
      StatisticName: 'Total Points',
      MaxResultsCount: 1
    }, (err1, res1) => {
      leaderboardPosition = res1.data.Leaderboard[0];
      playfabServer.GetLeaderboardAroundUser({
        PlayFabId: req.session.userId,
        StatisticName: 'Weekly Points',
        MaxResultsCount: 1
      }, (err2, res2) => {
        leaderboardPosition2 = res2.data.Leaderboard[0];
        playfabServer.GetLeaderboardAroundUser({
          PlayFabId: req.session.userId,
          StatisticName: 'Points',
          MaxResultsCount: 1
        }, (err3, res3) => {
          leaderboardPosition3 = res3.data.Leaderboard[0];
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
        });
      });
    });
  } else {
    res.redirect('/play');
  }
});

router.get('/actives', function (req, res, next) {
  let validUsers = {};
  if (req.query.filter) {
    Object.keys(req.app.get('socketio').activeUsers).map((key) => {
      if (Date.now() - req.app.get('socketio').activeUsers[key].time < 10 * 60 * 1000
        && req.app.get('socketio').activeUsers[key].profile.PlayerId !== req.session.userId
        && req.app.get('socketio').activeUsers[key].profile.DisplayName.indexOf(req.query.filter) > -1) {
        validUsers[key] = req.app.get('socketio').activeUsers[key];
      }
    });
  } else {
    Object.keys(req.app.get('socketio').activeUsers).map((key) => {
      if (Date.now() - req.app.get('socketio').activeUsers[key].time < 10 * 60 * 1000 && req.app.get('socketio').activeUsers[key].profile.PlayerId !== req.session.userId) {
        validUsers[key] = req.app.get('socketio').activeUsers[key];
      }
    });
  }
  res.json(validUsers);
});

module.exports = router;
