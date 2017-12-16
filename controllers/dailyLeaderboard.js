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
let newWinnersMail = [];

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

  while (newWinners.length < 20 && i < res.data.Leaderboard.length) {
    try {
      console.log(res.data.Leaderboard[i]);
      oldWinners.forEach((oldWinner) => {
        if (res.data.Leaderboard[i].PlayFabId === oldWinner.PlayFabId) {
          throw Error('user already won' + oldWinner.PlayFabId);
        }
      });
      newWinnersMail.push(res.data.Leaderboard[i]);
      if (newWinners.length < 10) {
        newWinners.push(res.data.Leaderboard[i]);
        // Send mail to first ten potential winners
        let email = 'vuks89@gmail.com';
        if(res.data.Leaderboard.Profile.LinkedAccounts && res.data.Leaderboard.Profile.LinkedAccounts[0] && res.data.Leaderboard.Profile.LinkedAccounts[0].Email) {
          email = res.data.Leaderboard.Profile.LinkedAccounts[0].Email;
        } else if (res.data.Leaderboard.Profile.ContactEmailAddresses && res.data.Leaderboard.Profile.ContactEmailAddresses[0]) {
          email = res.data.Leaderboard.Profile.ContactEmailAddresses[0].EmailAddress;
        }
        console.log(email);
        sendWinner({
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
        }, transport);
      }
    } catch (err) {
      console.log(err.toString());
    }
    i++;
  }

  fs.writeFileSync(__dirname + '/../winners/winners-daily-' + today + '.json', JSON.stringify(newWinners), 'utf8');
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
        filename: 'Dobitnici za ' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + '.json',
        content: JSON.stringify(newWinnersMail)
      }
    ],
    text: 'U prilogu se nalaze podaci 20 najboljih ucesnika za ' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear(),
    html: '<p>U prilogu se nalaze podaci 20 najboljih ucesnika za ' + date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + '</p>'
  }, transport);
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