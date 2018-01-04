const config = require('../config');
const playFabAdmin = require('playfab-sdk/Scripts/PlayFab/PlayFabAdmin');
const playFabServer = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const _ = require('lodash');

const transport = nodemailer.createTransport({
  host: 'mail.munchwars.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  auth: {
    user: 'info@munchwars.com',
    pass: 'jaffaivan10'
  },
  tls: {
    rejectUnauthorized: false
  }
});

//sendWinner(message, transport);

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
const today = month + '-' + date + '-' + year;

let newWinners = [];
let newWinnersMail = '';
let count5 = 0;
let recipients = 'vuks89@gmail.com';

// Fetch potential winners
playFabServer.GetLeaderboard({
  MaxResultsCount: 100,
  ProfileConstraints: {
    ShowDisplayName: true,
    ShowLinkedAccounts: true,
    ShowContactEmailAddresses: true
  },
  StartPosition: 0,
  StatisticName: leaderboards.weekly
}, (err, res) => {
  if (err) {
    console.log(err);
    return;
  }
  let oldWinners = getPreviousWinners();
  let i = 0;

  while (count5 < 5 && i < res.data.Leaderboard.length) {
    try {
      oldWinners.forEach((oldWinner) => {
        if (res.data.Leaderboard[i].PlayFabId === oldWinner.PlayFabId) {
          throw Error('user already won' + oldWinner.PlayFabId);
        }
      });
      let email = '';
      if(res.data.Leaderboard[i].Profile.LinkedAccounts && res.data.Leaderboard[i].Profile.LinkedAccounts[0] && res.data.Leaderboard[i].Profile.LinkedAccounts[0].Email) {
        recipients += ', ' + res.data.Leaderboard[i].Profile.LinkedAccounts[0].Email;
        email = res.data.Leaderboard[i].Profile.LinkedAccounts[0].Email;
      } else if (res.data.Leaderboard[i].Profile.LinkedAccounts[0].Platform === 'Facebook' &&
        res.data.Leaderboard[i].Profile.ContactEmailAddresses &&
        res.data.Leaderboard[i].Profile.ContactEmailAddresses[0]) {
        recipients += ', ' + res.data.Leaderboard[i].Profile.ContactEmailAddresses[0].EmailAddress;
        email = res.data.Leaderboard[i].Profile.ContactEmailAddresses[0].EmailAddress;
      } else {
        email = 'missing';
      }
      newWinnersMail += res.data.Leaderboard[i].Profile.LinkedAccounts[0].Username + ' - ' + email + '\n';
      count5 ++;
      if (newWinners.length < 1) {
        newWinners.push(res.data.Leaderboard[i]);
        // Send mail to first ten potential winners
        if(res.data.Leaderboard[i].Profile.LinkedAccounts && res.data.Leaderboard[i].Profile.LinkedAccounts[0] && res.data.Leaderboard[i].Profile.LinkedAccounts[0].Email) {
          recipients += ', ' + res.data.Leaderboard[i].Profile.LinkedAccounts[0].Email;
        } else if (res.data.Leaderboard[i].Profile.LinkedAccounts[0].Platform &&
          res.data.Leaderboard[i].Profile.ContactEmailAddresses &&
          res.data.Leaderboard[i].Profile.ContactEmailAddresses[0]) {
          recipients += ', ' + res.data.Leaderboard[i].Profile.ContactEmailAddresses[0].EmailAddress;
        }
        console.log(email);
      }
    } catch (err) {
      console.log(err);
    }
    i++;
  }
  console.log('Mails of new winners', newWinnersMail);
  console.log('Recipients', recipients);

  /*sendWinner({
    from: 'info@munchwars.com',
    to: email,
    bcc: 'vuks89@gmail.com',
    subject: 'Čestitamo osvojili ste nagradu na MunchWars takmičenju!',
    text: 'Kao jedan od 10 najbolje plasiranih igrača u prethodnom danu, osvojili ste veliku MunchWars kutiju!\n' +
    '\n' +
    'Molimo vas da nam u roku od 48 sati pošaljete na mail info@munchwars.com podatke o adresi na koju je potrebno da isporučimo vašu nagradu:\n' +
    'ime i prezime\n' +
    'ulicu i broj\n' +
    'pošanski broj i grad\n' +
    'kontakt telefon\n' +
    '\n' +
    'Hvala na učešću i puno sreće u daljem takmičenju!\n' +
    '\n' +
    'munchwars.com',
    html: '<p>Kao jedan od 10 najbolje plasiranih igrača u prethodnom danu, osvojili ste veliku MunchWars kutiju!</p>' +
    '<p>Molimo vas da nam u roku od 48 sati pošaljete na mail info@munchwars.com podatke o adresi na koju je potrebno da isporučimo vašu nagradu:</p>' +
    '<ul><li>ime i prezime</li>' +
    '<li>ulicu i broj</li>' +
    '<li>pošanski broj i grad</li>' +
    '<li>kontakt telefon</li></ul>' +
    '<p>Hvala na učešću i puno sreće u daljem takmičenju!</p>' +
    '<p>munchwars.com</p>'
  }, transport);*/

  /*fs.writeFileSync(__dirname + '/../winners/winners-weekly-' + today + '.json', JSON.stringify(newWinners), 'utf8');
  // send of list winners to administrators
  let date = new Date();
  sendWinner({
    from: 'info@munchwars.com',
    //to: 'vuks89@gmail.com,vuks89@live.com',
    to: 'info@munchwars.com,nevena.vasiljevic@popular.rs',
    bcc: 'vuks89@gmail.com',
    subject: 'Dobitnici za ' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear(),
    attachments: [
      {   // utf-8 string as an attachment
        filename: 'Dobitnici za ' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + '.txt',
        content: newWinnersMail
      }
    ],
    text: 'U prilogu se nalaze podaci 5 najboljih ucesnika za prethodnu nedelju ' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear(),
    html: '<p>U prilogu se nalaze podaci 5 najboljih ucesnika za prethodnu nedelju ' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + '</p>'
  }, transport);*/
});

playFabAdmin.IncrementPlayerStatisticVersion({
  StatisticName: leaderboards.weekly
}, (err, result) => {
  console.log(err, result);
});

playFabAdmin.IncrementPlayerStatisticVersion({
  StatisticName: leaderboards.weeklyWins
}, (err, result) => {
  console.log(err, result);
});

function getPreviousWinners () {
  let winners = [];
  fs.readdirSync(__dirname + '/../winners').forEach(file => {
    if (file.indexOf('weekly') > -1) {
      let contents = JSON.parse(fs.readFileSync(__dirname + '/../winners/' + file));
      winners = winners.concat(contents);
    }
  });
  return winners;
}

function sendWinner (messageOptions, transport) {
  transport.sendMail(messageOptions, (error, response) => {
    if (error) {
      console.log(error);
      return;
    }

    // response.statusHandler only applies to 'direct' transport
    response.statusHandler.once('failed', (data) => {
      console.log(
        'Permanently failed delivering message to %s with the following response: %s',
        data.domain, data.response);
    });

    response.statusHandler.once('requeue', (data) => {
      console.log('Temporarily failed delivering message to %s', data.domain);
    });

    response.statusHandler.once('sent', (data) => {
      console.log('Message was accepted by %s', data.domain);
    });
  });
}