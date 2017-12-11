const express = require('express');
const router = express.Router();
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');
const _ = require('lodash');
playfab.settings.titleId = 'F06D';
playfab.settings.developerSecretKey = 'X6GUF8OHOC8OIXU1W9P3F77SIJW9X5EZESCNTG8J53G97ANDEE';

/* GET home page. */
router.get('/', async (req, res, next) => {
  let statisticsName = 'Total Points';
  if(req.query.period === 'daily') {
    statisticsName = 'Points';
  }
  if(req.query.period === 'weekly') {
    statisticsName = 'Weekly Points';
  }
  //console.log(statisticsName);
  await playfab.GetLeaderboard({
    StartPosition: 0,
    MaxResultsCount: 20,
    ProfileConstraints: {
      ShowDisplayName: true,
      ShowLinkedAccounts: true,
      ShowStatistics: true
    },
    StatisticName: statisticsName
  }, async (err, response) => {
    if (err) {
      console.log(err);
    }
    else {
      //console.log(response.data);
      response.data.Leaderboard.forEach(async (lb, index) => {
        let stat = _.find(lb.Profile.Statistics, { Name: "Total Points"});
        response.data.Leaderboard[index].rankIcon = getRankIcon(stat.Value);
        try {
          response.data.Leaderboard[index].rnks = console.log(await getRankings(lb.PlayFabId));
        } catch (e) {
          console.log(e);
        }
      });
      //console.log(response.data.Leaderboard[0].Profile.Statistics);
      res.render('pages/ranking', {
        title: 'Rang lista',
        active: 'ranking',
        playfabId: req.session.userId || null,
        leaderboard: response.data,
        period: req.query.period || 'total'
      });
    }
  });
});

function getRankings (req) {
  var leaderboardPosition;
  var leaderboardPosition2;
  var leaderboardPosition3;
  return new Promise((resolve, reject) => {
    playfab.GetLeaderboardAroundUser({
      PlayFabId: req,
      StatisticName: 'Total Points',
      MaxResultsCount: 1
    }, (err1, res1) => {
      if (err1) {
        reject(err1);
      }
      if (res1) {
        leaderboardPosition = res1.data.Leaderboard[0] || 0;
      }
      playfab.GetLeaderboardAroundUser({
        PlayFabId: req,
        StatisticName: 'Weekly Points',
        MaxResultsCount: 1
      }, (err2, res2) => {
        if (err2) {
          reject(err2);
        }
        if (res1) {
          leaderboardPosition2 = res2.data.Leaderboard[0];
        }
        playfab.GetLeaderboardAroundUser({
          PlayFabId: req,
          StatisticName: 'Points',
          MaxResultsCount: 1
        }, (err3, res3) => {
          if (err3) {
            reject(err3);
          }
          if (res1) {
            leaderboardPosition3 = res3.data.Leaderboard[0];
          }
          resolve({
            total: leaderboardPosition,
            weekly: leaderboardPosition2,
            daily: leaderboardPosition3,
          })
        });
      });
    });
  });
}

function getRankIcon (tp) {
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
