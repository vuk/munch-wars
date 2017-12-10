'use strict';
const playfabServer = require('playfab-sdk/Scripts/PlayFab/PlayFabServer');
playfabServer.settings.developerSecretKey = 'X6GUF8OHOC8OIXU1W9P3F77SIJW9X5EZESCNTG8J53G97ANDEE';
module.exports = {
  sockets: {},
  activeUsers: {},
  state: {},
  io: null,
  submitScore: (data) => {
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

    /**
     * User connects -> gets added to list of active players
     * For the sake of explanation let's look at this from first person
     * So - I connect to game
     */
    this.io.on('connection', (socket) => {
      var updateInterval;
      /** I receive an event saying that I'm connected properly */
      socket.emit('connected', { status: true });
      /** From the client I identify myself by sending my playfab ID */
      socket.on('identify', (data) => {
        this.state[data.id] = {
          paddle: {},
          ball: {}
        };
        // If I exist in list of active users I join my own room and my timestamp is updated to current one so that
        // I appear in the list of active users
        if (data.id && this.activeUsers[data.id]) {
          // User joins a room with his own ID
          socket.join(data.id);
          this.activeUsers[data.id].time = Date.now();
          this.sockets[data.id] = socket;
        }
      });
      /**
       * If I select a player from the list of active players, I'll visit a room with ID that is his ID
       * So basically even though I started a game, I am a guest. Player invited to play will act as host
       */
      socket.on('invite', (data) => {
        console.log('invite', data);
        if (this.io.sockets.adapter.rooms[data.host].sockets
        && this.io.sockets.adapter.rooms[data.host].sockets.length === 2) {
          socket.emit('busy', { busy: true });
          return;
        }
        socket.join(data.host);
        this.sockets[data.host].join(data.host);
        console.log(this.io.sockets.adapter.rooms[data.host].sockets);
        setTimeout(() => {
          console.log('accept_invite');
          // So I as a guest will be a player 1
          // And opponent as a host will be a player 2
          this.io.to(data.host).emit('respond_to_invite', {
            player1: this.activeUsers[data.guest],
            player2: this.activeUsers[data.host],
            profile: this.activeUsers[data.guest].profile,
            ranks: this.activeUsers[data.guest].ranks,
            guestSide: data.guestSide
          });
        }, 2000);
      });
      socket.on('accept', (data) => {
        // Make sure room has exactly two members before starting a game
        console.log(this.io.sockets.adapter.rooms[data.host].sockets);
        if (Object.keys(this.io.sockets.adapter.rooms[data.host].sockets).length >= 2) {
          setTimeout(() => {
            console.log('start_game');
            this.io.to(data.host).emit('start_game', {
              player1: this.activeUsers[data.guest], // <- this is me
              player2: this.activeUsers[data.host],
              guestSide: data.guestSide
            });
            updateInterval = setInterval(() => {
              if(this.state[data.host]) {
                this.io.to(data.host).emit('update_state', this.state[data.host]);
              }
            }, 50);
          }, 5000);
        }
      });
      socket.on('move_paddle', (data) => {
        //this.io.to(data.id).emit('move', data);
        if(!this.state[data.id]) {
          this.state[data.id] = {
            paddle: {},
            ball: {}
          };
        }
        this.state[data.id]['paddle'][data.side] = data;
      });
      socket.on('ball_position', (data) => {
        if(!this.state[data.id]) {
          this.state[data.id] = {
            paddle: {},
            ball: {}
          };
        }
        this.state[data.id]['ball'] = data;
        //this.io.to(data.id).emit('ball', data);
      });
      socket.on('relevant_score', (data) => {
        this.io.to(data.id).emit('score', data);
      });
      socket.on('winner', (data) => {
        console.log(data, 'winner');
        this.submitScore(data);
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
        this.io.sockets.adapter.rooms[data.id].sockets.forEach(socket => {
          socket.leave(data.id);
        });
        clearInterval(updateInterval)
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