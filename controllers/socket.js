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
      socket.on('accept', (data) => {
        console.log('accept', data);
        this.sockets[data.id].join(data.myId);
        this.sockets[data.myId].join(data.myId);
        console.log(this.io.sockets.adapter.rooms[data.myId].sockets);
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
      socket.on('disconnect', () => {
        console.log('disconnected', socket.id);
      });
    });

    return this;
  }
};