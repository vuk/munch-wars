const config = require('../config');
const playFabAdmin = require('playfab-sdk/Scripts/PlayFab/PlayFabAdmin');
const playFabServer = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');
const fs = require('fs');
const _ = require('lodash');

playFabAdmin.settings.developerSecretKey = config.playfab.secret;
playFabServer.settings.developerSecretKey = config.playfab.secret;
playFabAdmin.settings.titleId = config.playfab.title;
playFabServer.settings.titleId = config.playfab.title;
const leaderboards = {
  weekly: 'Weekly Points',
  daily: 'Points',
  weeklyWins: 'Weekly Wins',
  dailyWins: 'Wins'
};

const currentDate = new Date();
let date = currentDate.getDate();
let month = currentDate.getMonth() + 1;
const year = currentDate.getFullYear();
if (date < 10 && date.toString().length < 2) {
  date = '0' + date;
}
if (month < 10 && month.toString().length < 2) {
  month = '0' + month;
}
const today =  month + '-' + date + '-' + year;

let newWinners = [];

// Fetch potential winners
playFabServer.GetLeaderboard({
  MaxResultsCount: 100,
  ProfileConstraints: {
    ShowDisplayName: true,
    ShowLinkedAccounts: true,
    ShowContactEmailAddresses: true
  },
  StartPosition: 0,
  StatisticName: leaderboards.daily
}, (err, res) => {
  if (err) {
    console.log(err);
    return;
  }
  let oldWinners = getPreviousWinners();
  let i = 0;

  while (newWinners.length < 10 && i < res.data.Leaderboard.length) {
    try {
      console.log(res.data.Leaderboard[i]);
      oldWinners.forEach((oldWinner) => {
        if (res.data.Leaderboard[i].PlayFabId === oldWinner.PlayFabId) {
          throw Error('user already won' + oldWinner.PlayFabId);
        }
      });
      newWinners.push(res.data.Leaderboard[i]);
    } catch (err) {
      console.log(err.toString());
    }
    i++;
  }
  fs.writeFileSync(__dirname + '/../winners/winners-daily-' + today + '.json', JSON.stringify(newWinners), 'utf8');
});


playFabAdmin.IncrementPlayerStatisticVersion({
  StatisticName: leaderboards.daily
}, (err, result) => {
  console.log(err, result);
});

playFabAdmin.IncrementPlayerStatisticVersion({
  StatisticName: leaderboards.dailyWins
}, (err, result) => {
  console.log(err, result);
});

function getPreviousWinners () {
  let winners = [];
  fs.readdirSync(__dirname + '/../winners').forEach(file => {
    if (file.indexOf('daily') > -1) {
      let contents = JSON.parse(fs.readFileSync(__dirname + '/../winners/' + file));
      winners = winners.concat(contents);
    }
  });
  return winners;
}