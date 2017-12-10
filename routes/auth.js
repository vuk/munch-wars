const express = require('express');
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
const playfabServer = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');
playfabServer.settings.developerSecretKey = 'X6GUF8OHOC8OIXU1W9P3F77SIJW9X5EZESCNTG8J53G97ANDEE';
const router = express.Router();
const passport = require('passport');

playfab.settings.titleId = 'F06D';
playfabServer.settings.titleId = 'F06D';

router.post('/login', function (req, res, next) {
  playfab.LoginWithEmailAddress({
    Email: req.body.email,
    Password: req.body.password,
    TitleId: playfab.settings.titleId
  }, function (err, result) {
    if (err) {
      res.redirect('/play');
    } else {
      req.session.userId = result.data.PlayFabId;
      req.session.sessionTicket = result.data.SessionTicket;
      playfab.GetPlayerProfile({
        PlayFabId: result.data.PlayFabId,
        ProfileConstraints: {
          ShowDisplayName: true,
          ShowLinkedAccounts: true
        }
      }, (error, response) => {
        if (error) {
          console.log(error);
          res.redirect('/play');
        }
        else {
          playfab.GetPlayerStatistics({}, (err, stats) => {
            delete response.data.PlayerProfile.TitleId;
            if (response.data.PlayerProfile.LinkedAccounts && response.data.PlayerProfile.LinkedAccounts[0].Username) {
              response.data.PlayerProfile.DisplayName = response.data.PlayerProfile.LinkedAccounts[0].Username;
            }
            req.session.profile = response.data.PlayerProfile;
            req.session.stats = stats;
            getRankings(req)
              .then(ranks => {
                req.session.ranks = ranks;
                req.app.get('socketio').activeUsers[result.data.PlayFabId] = {
                  profile: response.data.PlayerProfile,
                  time: Date.now(),
                  stats: stats,
                  ranks: ranks
                };
                res.redirect('/profile');
              });
          });
        }
      });
    }
  });
});

router.get('/register', function (req, res, next) {
  if (req.session.userId) {
    res.redirect('/profile');
  } else {
    res.render('pages/register', {
      title: 'Registrujte se',
      active: 'play',
      playfabId: req.session.userId || null
    });
  }
});

router.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));
router.get('/social-login', passport.authenticate('facebook'),
  (req, res, next) => {
    if (req.error) {
      res.redirect('/play');
    } else {
      req.session.userId = req.user.result.data.PlayFabId;
      req.session.sessionTicket = req.user.result.data.SessionTicket;
      playfab.GetPlayerProfile({
        PlayFabId: req.user.result.data.PlayFabId,
        ProfileConstraints: {
          ShowDisplayName: true,
          ShowLinkedAccounts: true
        }
      }, (error, response) => {
        if (error) {
          console.log(error);
          res.redirect('/play');
        }
        else {
          if (req.user.profile.emails[0]) {
            playfab.AddOrUpdateContactEmail({
              EmailAddress: req.user.profile.emails[0].value
            });
          }
          playfab.GetPlayerStatistics({}, (err, stats) => {
            req.session.stats = stats;
            delete response.data.PlayerProfile.TitleId;
            if (response.data.PlayerProfile.LinkedAccounts && response.data.PlayerProfile.LinkedAccounts[0].Username) {
              response.data.PlayerProfile.DisplayName = response.data.PlayerProfile.LinkedAccounts[0].Username;
            }
            req.session.profile = response.data.PlayerProfile;
            req.session.stats = stats;
            getRankings(req)
              .then(ranks => {
                req.app.get('socketio').activeUsers[req.session.userId] = {
                  profile: response.data.PlayerProfile,
                  time: Date.now(),
                  stats: stats,
                  ranks: ranks
                };
                res.redirect('/profile');
              });
          });
        }
      });
    }
  });

router.post('/register', function (req, res, next) {
  playfab.RegisterPlayFabUser({
    DisplayName: req.body.username.trim(),
    Username: req.body.username.trim(),
    Email: req.body.email.trim(),
    Password: req.body.password.trim(),
    TitleId: playfab.settings.titleId
  }, function (err, result) {
    console.log(err);
    if (err) {
      res.render('pages/register', {
        title: 'Registrujte se',
        active: 'play',
        playfabId: req.session.userId || null,
        errorObject: err,
        username: req.body.username,
        email: req.body.email
      });
    } else {
      console.log(result);
      req.session.userId = result.data.PlayFabId;
      req.session.sessionTicket = result.data.SessionTicket;
      playfab.GetPlayerProfile({
        PlayFabId: result.data.PlayFabId,
        ProfileConstraints: {
          ShowDisplayName: true,
          ShowLinkedAccounts: true
        }
      }, (error, response) => {
        if (error) {
          console.log(error);
          res.redirect('/play');
        }
        else {
          playfab.GetPlayerStatistics({}, (err, stats) => {
            req.session.stats = stats;
            delete response.data.PlayerProfile.TitleId;
            if (response.data.PlayerProfile.LinkedAccounts && response.data.PlayerProfile.LinkedAccounts[0].Username) {
              response.data.PlayerProfile.DisplayName = response.data.PlayerProfile.LinkedAccounts[0].Username;
            }
            req.session.profile = response.data.PlayerProfile;
            req.session.stats = stats;
            getRankings(req)
              .then(ranks => {
                req.app.get('socketio').activeUsers[req.session.userId] = {
                  profile: response.data.PlayerProfile,
                  time: Date.now(),
                  stats: stats,
                  ranks: ranks
                };
                res.redirect('/profile');
              });
          });
        }
      });
    }
  });
});

function getRankings (req) {
  var leaderboardPosition;
  var leaderboardPosition2;
  var leaderboardPosition3;
  return new Promise((resolve, reject) => {
    playfabServer.GetLeaderboardAroundUser({
      PlayFabId: req.session.userId,
      StatisticName: 'Total Points',
      MaxResultsCount: 1
    }, (err1, res1) => {
      if (err1) {
        reject(err1);
      }
      leaderboardPosition = res1.data.Leaderboard[0];
      playfabServer.GetLeaderboardAroundUser({
        PlayFabId: req.session.userId,
        StatisticName: 'Weekly Points',
        MaxResultsCount: 1
      }, (err2, res2) => {
        if (err2) {
          reject(err2);
        }
        leaderboardPosition2 = res2.data.Leaderboard[0];
        playfabServer.GetLeaderboardAroundUser({
          PlayFabId: req.session.userId,
          StatisticName: 'Points',
          MaxResultsCount: 1
        }, (err3, res3) => {
          if (err3) {
            reject(err3);
          }
          leaderboardPosition3 = res3.data.Leaderboard[0];
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

router.get('/logout', (req, res, next) => {
  req.session.destroy(function(err) {
    // cannot access session here
    res.redirect('/play');
  })
});

router.get('/forgot', (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/profile');
  } else {
    res.render('pages/forgot', {
      title: 'Zaboravljena šifra',
      active: 'play'
    });
  }
});

router.post('/reset', (req, res, next) => {
  if (req.body.email) {
    playfab.SendAccountRecoveryEmail({
      Email: req.body.email,
      TitleId: 'F06D'
    }, (err, response) => {
      if (err) {
        console.log(err);
        res.redirect('/forgot');
      } else {
        res.render('pages/reset-confirm', {
          title: 'Zaboravljena šifra',
          active: 'play'
        });
      }
    });
  } else {
    res.redirect('/forgot');
  }
});

module.exports = router;
