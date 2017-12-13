var express = require('express');
var router = express.Router();
const playfabServer = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');
const config = require('../config');
playfabServer.settings.developerSecretKey = config.playfab.secret;

/* GET users listing. */
router.get('/', function (req, res, next) {
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
          req.session.totalRank = leaderboardPosition;
          req.session.weeklyRank = leaderboardPosition2;
          req.session.dailyRank = leaderboardPosition3;
          res.render('pages/profile', {
            title: 'Profil',
            active: 'play',
            playfabId: req.session.userId || null,
            totalRank: leaderboardPosition,
            weeklyRank: leaderboardPosition2,
            dailyRank: leaderboardPosition3,
            profile: req.session.profile || null,
            stats: req.session.stats || null,
            rankIcon: getRankIcon(leaderboardPosition.StatValue)
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
  let counter = 0;
  if (req.query.filter) {
    Object.keys(req.app.get('socketio').activeUsers).map((key) => {
      if (Date.now() - req.app.get('socketio').activeUsers[key].time < 10 * 60 * 1000
        && req.app.get('socketio').activeUsers[key].profile.PlayerId !== req.session.userId
        && req.app.get('socketio').activeUsers[key].profile.DisplayName.indexOf(req.query.filter) > -1 && counter <= 50) {
        counter++;
        validUsers[key] = req.app.get('socketio').activeUsers[key];
      }
    });
  } else {
    Object.keys(req.app.get('socketio').activeUsers).map((key) => {
      if (Date.now() - req.app.get('socketio').activeUsers[key].time < 10 * 60 * 1000 && req.app.get('socketio').activeUsers[key].profile.PlayerId !== req.session.userId
        && counter <= 50) {
        counter++;
        validUsers[key] = req.app.get('socketio').activeUsers[key];
      }
    });
  }
  res.json(validUsers);
});

function getRankIcon (tp) {
  var rank;
  if(tp <= 100) {
    rank = '/assets/ranks/1.png';
  }
  if (tp >= 101 && tp <= 200) {
    rank = '/assets/ranks/2.png';
  }
  if (tp >= 201 && tp <= 300) {
    rank = '/assets/ranks/3.png';
  }
  if (tp >= 301 && tp <= 400) {
    rank = '/assets/ranks/4.png';
  }
  if (tp >= 401 && tp <= 500) {
    rank = '/assets/ranks/5.png';
  }
  if (tp >= 501 && tp <= 600) {
    rank = '/assets/ranks/6.png';
  }
  if (tp > 600) {
    rank = '/assets/ranks/7.png';
  }
  return rank;
}

module.exports = router;
