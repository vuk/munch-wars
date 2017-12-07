'use strict';
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
const playfabServer = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');
module.exports = {
  sockets: {},
  activeUsers: {},
  io: null,
  submitScore: (data) => {
    playfabServer.settings.developerSecretKey = 'X6GUF8OHOC8OIXU1W9P3F77SIJW9X5EZESCNTG8J53G97ANDEE';
    playfabServer.UpdatePlayerStatistics({
      "PlayFabId": data.id,
      "Statistics": [
        {
          "StatisticName": "Monthly Points",
          "Value": data.points
        },
        {
          "StatisticName": "Weekly Points",
          "Value": data.points
        },
        {
          "StatisticName": "Points",
          "Value": data.points
        },
        {
          "StatisticName": "Total Points",
          "Value": data.points
        },
        {
          "StatisticName": "Wins",
          "Value": 1
        },
        {
          "StatisticName": "Weekly Wins",
          "Value": 1
        },
        {
          "StatisticName": "Monthly Wins",
          "Value": 1
        },
        {
          "StatisticName": "Total Wins",
          "Value": 1
        }
      ]
    }, (err, res) => {
      console.log('Submit score', err, res);
    });
  },
  run: function (app, server) {
    this.io = require('socket.io')(server);
    console.log('Socket server running');

    this.io.on('connection', (socket) => {
      socket.emit('connected', { status: true });
      socket.on('identify', (data) => {
        if (data.id && this.activeUsers[data.id]) {
          socket.join(data.id);
          this.activeUsers[data.id].time = Date.now();
          this.sockets[data.id] = socket;
        }
      });
      socket.on('invite', (data) => {
        console.log('invite', data);
        socket.join(data.id);
        this.sockets[data.id].join(data.id);
        console.log(this.io.sockets.adapter.rooms[data.id].sockets);
        setTimeout(() => {
          console.log('accept_invite');
          this.io.to(data.id).emit('accept_invite', {
            player1: this.activeUsers[data.myId],
            player2: this.activeUsers[data.id]
          });
        }, 2000);
      });
      let player1;
      let player2;
      socket.on('accept', (data) => {
        player1 = data.myId;
        player2 = data.id;
        if (Object.keys(this.io.sockets.adapter.rooms[data.myId].sockets).length === 2) {
          setTimeout(() => {
            console.log('start_game');
            this.io.to(data.myId).emit('start_game', {
              player1: this.activeUsers[data.myId],
              player2: this.activeUsers[data.id]
            });
          }, 5000);
        }
      });
      socket.on('move_paddle', (data) => {
        this.io.to(data.id).emit('move', data);
      });
      socket.on('ball_position', (data) => {
        this.io.to(data.id).emit('ball', data);
      });
      socket.on('relevant_score', (data) => {
        this.io.to(data.id).emit('score', data);
      });
      socket.on('winner', (data) => {
        console.log(data, 'winner');
        this.submitScore(data);
      });
      socket.on('disconnect', () => {
        console.log('disconnected', socket.id);
      });
    });

    return this;
  }
};