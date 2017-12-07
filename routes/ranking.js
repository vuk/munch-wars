const express = require('express');
const router = express.Router();
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');
playfab.settings.titleId = 'F06D';
playfab.settings.developerSecretKey = 'X6GUF8OHOC8OIXU1W9P3F77SIJW9X5EZESCNTG8J53G97ANDEE';

/* GET home page. */
router.get('/', function(req, res, next) {
  let statisticsName = 'Total Points';
  if(req.query.period === 'daily') {
    statisticsName = 'Points';
  }
  if(req.query.period === 'weekly') {
    statisticsName = 'Weekly Points';
  }
  console.log(statisticsName);
  playfab.GetLeaderboard({
    StartPosition: 0,
    MaxResultsCount: 20,
    ProfileConstraints: {
      ShowDisplayName: true,
      ShowLinkedAccounts: true,
      ShowStatistics: true
    },
    StatisticName: statisticsName
  }, (err, response) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log(response.data);
      response.data.Leaderboard.forEach(lb => {
        console.log(lb.Profile.Statistics);
      });
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

module.exports = router;
