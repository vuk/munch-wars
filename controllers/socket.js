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
          console.log(this.activeUsers);
          this.sockets[data.id] = socket;
        }
      });
      socket.on('disconnect', () => {
        console.log('disconnected', socket.id);
      });
    });

    return this;
  }
};