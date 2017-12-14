const express = require('express');
const router = express.Router();
const fs = require('fs');
const _ = require('lodash');

/* GET home page. */
router.get('/', function(req, res, next) {
  let winners = getDailyWinners();
  let weeklyWinners = getWeeklyWinners();
  Array.prototype.push.apply(winners, weeklyWinners);
  console.log(winners);
  winners = _.orderBy(winners, ['date'], ['desc']);

  res.render('pages/winners', {
    title: 'Pobednici',
    active: 'winners',
    winners: winners,
    playfabId: req.session.userId || null
  });
});

function getDailyWinners () {
  let winners = [];
  fs.readdirSync(__dirname + '/../winners').forEach(file => {
    if (file.indexOf('daily') > -1) {
      let date = file.substr(14, 10);
      date = new Date(date);
      console.log(date);
      let contents = JSON.parse(fs.readFileSync(__dirname + '/../winners/' + file));
      var dayName;
      switch(date.getDay()) {
        case 0:
          dayName = 'nedelju';
          break;
        case 1:
          dayName = 'ponedeljak';
          break;
        case 2:
          dayName = 'utorak';
          break;
        case 3:
          dayName = 'sredu';
          break;
        case 4:
          dayName = 'četvrtak';
          break;
        case 5:
          dayName = 'petak';
          break;
        case 6:
          dayName = 'subotu';
      }
      let period = 'Dnevni dobitnici';
      let formattedDate = date.getDate() + '.' + (parseInt(date.getMonth(), 10) + 1) + '.';
      winners.push({
        date: date,
        dayName: dayName,
        type: 'daily',
        period: period,
        formattedDate: formattedDate,
        typeNum: 0,
        winners: contents
      });
    }
  });
  return winners;
}

function getWeeklyWinners () {
  let winners = [];
  fs.readdirSync(__dirname + '/../winners').forEach(file => {
    if (file.indexOf('weekly') > -1) {
      let date = file.substr(15, 10);
      date = new Date(date);
      console.log(date);
      let dayName = '';
      let contents = JSON.parse(fs.readFileSync(__dirname + '/../winners/' + file));
      let period = 'Nedeljni dobitnik';
      let formattedDate = date.getDate() + '.' + (parseInt(date.getMonth(), 10) + 1) + '.';
      winners.push({
        date: date,
        dayName: dayName,
        type: 'weekly',
        period: period,
        formattedDate: formattedDate,
        typeNum: 1,
        winners: contents
      });
    }
  });
  console.log(winners);
  return winners;
}

module.exports = router;