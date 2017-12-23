'use strict';
const config = require('../config');
const playfabServer = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');
playfabServer.settings.developerSecretKey = config.playfab.secret;
let syncs = {};
module.exports = {
  sockets: {},
  activeUsers: {},
  tokens: {},
  state: {},
  lastSubmit: {},
  io: null,
  submitScore: (data, lastSubmit) => {
    if (data.points > 78) {
      console.log('[' + new Date().toLocaleString() + '] user ' + data.id + ' tried to submit more than max points allowed and should be banned ' + data.points);
      return;
    }
    if (data.points < 18) {
      console.log('[' + new Date().toLocaleString() + '] user ' + data.id + ' tried to submit less than min points allowed and should be banned ' + data.points);
      return;
    }
    if (!lastSubmit[data.id]) {
      lastSubmit[data.id] = 0;
    }
    console.log(lastSubmit);
    let localTime = Date.now();
    if (localTime - lastSubmit[data.id] < 30000) {
      console.log('[' + new Date().toLocaleString() + '] User ' + data.id + ' completed a game in ' + (localTime - lastSubmit[data.id]) / 1000 + ' seconds and should be banned');
      return;
    }
    if (syncs[data.id].syncCount === 0 && syncs[data.id].syncCount > 15) {
      console.log('[' + new Date().toLocaleString() + '] User ' + data.id + ' hasn\'t played but submitted score manually and should be banned');
      return;
    } else {
      console.log('[' + new Date().toLocaleString() + '] User ' + data.id + ' had ' + syncs[data.id].syncCount + ' syncs with server. No cheating involved');
    }
    lastSubmit[data.id] = Date.now();

    playfabServer.UpdatePlayerStatistics({
      'PlayFabId': data.id,
      'Statistics': [
        {
          'StatisticName': 'Monthly Points',
          'Value': data.points
        },
        {
          'StatisticName': 'Weekly Points',
          'Value': data.points
        },
        {
          'StatisticName': 'Points',
          'Value': data.points
        },
        {
          'StatisticName': 'Total Points',
          'Value': data.points
        },
        {
          'StatisticName': 'Wins',
          'Value': 1
        },
        {
          'StatisticName': 'Weekly Wins',
          'Value': 1
        },
        {
          'StatisticName': 'Monthly Wins',
          'Value': 1
        },
        {
          'StatisticName': 'Total Wins',
          'Value': 1
        }
      ]
    }, (err, res) => {
      if (data.side === 'white') {
        playfabServer.GetTitleData({
          Keys: ['White']
        }, (err, result) => {
          if (!err) {
            console.log(result, 'white');
            let white;
            if (result.data.Data['White']) {
              white = parseInt(result.data.Data['White'], 10);
            } else {
              white = 0;
            }
            playfabServer.SetTitleData({
              Key: 'White',
              Value: white + 1
            });
          }
        });
      } else {
        playfabServer.GetTitleData({
          Keys: ['Black']
        }, (err, result) => {
          if (!err) {
            console.log(result, 'black');
            let right;
            if (result.data.Data['Black']) {
              right = parseInt(result.data.Data['Black'], 10);
            } else {
              right = 0;
            }
            playfabServer.SetTitleData({
              Key: 'Black',
              Value: right + 1
            });
          }
        });
      }
      console.log('Submit score', err, res);
    });
  },
  run: function (app, server) {
    this.io = require('socket.io')(server);
    console.log('Socket server running');

    /**
     * User connects -> gets added to list of active players
     * For the sake of explanation let's look at this from first person
     * So - I connect to game
     */
    this.io.on('connection', (socket) => {
      var updateInterval;
      /** I receive an event saying that I'm connected properly */
      socket.emit('connected', {
        status: true
      });
      /** From the client I identify myself by sending my playfab ID */
      socket.on('identify', (data) => {
        this.state[data.id] = {
          paddle: {},
          ball: {
            time: 0
          }
        };
        let sync = Date.now();
        syncs[data.id] = {
          sync: sync,
          syncCount: 0
        };
        socket.emit('syncSingle', {
          sync: sync
        });
        // If I exist in list of active users I join my own room and my timestamp is updated to current one so that
        // I appear in the list of active users
        if (data.id && this.activeUsers[data.id]) {
          // User joins a room with his own ID
          socket.join(data.id);
          this.activeUsers[data.id].time = Date.now();
          this.activeUsers[data.id].available = true;
          this.sockets[data.id] = socket;
        }
      });
      socket.on('singleOut', (data) => {
        let sync = Date.now();
        if (syncs[data.userId] && syncs[data.userId].sync === data.sync) {
          syncs[data.userId].sync = sync;
          syncs[data.userId].syncCount++;
          socket.emit('syncSingle', {
            sync: sync
          });
        } else {
          console.log('[' + new Date().toLocaleString() + '] User ' + data.userId + ' sync wrong.');
        }
      });
      /**
       * If I select a player from the list of active players, I'll visit a room with ID that is his ID
       * So basically even though I started a game, I am a guest. Player invited to play will act as host
       */
      socket.on('invite', (data) => {
        if (this.activeUsers[data.guest]) {
          this.activeUsers[data.guest].available = false;
        }
        if (this.io.sockets.adapter.rooms[data.host] && this.io.sockets.adapter.rooms[data.host].sockets
          && this.io.sockets.adapter.rooms[data.host].sockets.length === 2) {
          socket.emit('busy', { busy: true });
          return;
        }
        if (this.activeUsers[data.host]) {
          this.activeUsers[data.host].available = false;
        }
        if (this.sockets[data.host]) {
          console.log('invite', data);
          setTimeout(() => {
            console.log('accept_invite');
            socket.join(data.host);
            if (this.activeUsers[data.host] && this.activeUsers[data.guest]) {
              this.sockets[data.host].join(data.host);
              // So I as a guest will be a player 1
              // And opponent as a host will be a player 2
              this.io.to(data.host).emit('respond_to_invite', {
                player1: this.activeUsers[data.guest],
                player2: this.activeUsers[data.host],
                profile: this.activeUsers[data.guest].profile,
                ranks: this.activeUsers[data.guest].ranks,
                guestSide: data.guestSide
              });
            }
          }, 2000);
        }
      });
      socket.on('accept', (data) => {
        // Make sure room has exactly two members before starting a game
        if (this.io.sockets.adapter.rooms[data.host] &&
          Object.keys(this.io.sockets.adapter.rooms[data.host].sockets).length >= 2) {
          setTimeout(() => {
            console.log('start_game');
            this.io.to(data.host).emit('start_game', {
              player1: this.activeUsers[data.guest], // <- this is me
              player2: this.activeUsers[data.host],
              guestSide: data.guestSide
            });
            updateInterval = setInterval(() => {
              this.state[data.host].time = Date.now();
              this.io.to(data.host).emit('update_state', this.state[data.host]);
            }, 10);
          }, 5000);
        }
      });
      socket.on('move_paddle', (data) => {
        //this.io.to(data.id).emit('move', data);
        if (!this.state[data.id]) {
          this.state[data.id] = {
            paddle: {},
            ball: {
              time: 0
            }
          };
        }
        this.state[data.id]['paddle'][data.side] = data;
      });
      socket.on('ball_position', (data) => {
        if (!this.state[data.id]) {
          this.state[data.id] = {
            paddle: {},
            ball: {
              time: 0
            }
          };
        }
        if (this.state[data.id]['ball'].time < data.time) {
          this.state[data.id]['ball'] = data;
        }
        //this.io.to(data.id).emit('ball', data);
      });
      socket.on('relevant_score', (data) => {
        this.io.to(data.id).emit('score', data);
      });
      socket.on('winner', (data) => {
        if (Math.abs(data.verify - this.tokens[data.id]) < 1200000) {
          this.submitScore(data, this.lastSubmit);
          //this.activeUsers[data.id].verificationToken = false;
          this.tokens[data.id] = false;
          console.log(data, 'winner');
          console.log(this.tokens[data.id], 'winner');
        } else {
          console.log('[' + new Date().toLocaleString() + '] Player: ' + data.id + ' tried to hack his way up the leaderboard');
        }
      });
      socket.on('magic_sync', data => {
        this.io.to(data.id).emit('magic', data);
      });
      socket.on('shot_sync', data => {
        this.io.to(data.id).emit('sync_shot', data);
      });
      socket.on('hor_sync', data => {
        this.io.to(data.id).emit('sync_hor', data);
      });
      socket.on('ver_sync', data => {
        this.io.to(data.id).emit('sync_ver', data);
      });
      socket.on('double_sync', data => {
        this.io.to(data.id).emit('sync_double', data);
      });
      socket.on('game_over', data => {
        this.io.to(data.id).emit('gameover', data);
        this.io.in(data.id).clients((err, clients) => {
          if (clients.length > 0) {
            clients.forEach((socket_id) => {
              this.io.sockets.sockets[socket_id].leave(data.id);
              this.io.sockets.sockets[socket_id].disconnect();
            });
          }
        });
        clearInterval(updateInterval);
      });
      socket.on('outofbounds', data => {
        this.io.to(data.id).emit('outOfBounds', data);
      });
      socket.on('disconnect', () => {
        console.log('disconnected', socket.id);
      });
    });

    return this;
  }
};