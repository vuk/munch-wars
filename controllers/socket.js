'use strict';
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
module.exports = {
  sockets: {},
  activeUsers: {},
  io: null,
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
        console.log('invite');
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
      socket.on('disconnect', () => {
        console.log('disconnected', socket.id);
      });
    });

    return this;
  }
};