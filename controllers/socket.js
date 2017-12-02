'use strict';
module.exports = {
  sockets: {},
  io: null,
  run: function (app, server) {
    this.io = require('socket.io')(server);
    console.log('Socket server running');

    this.io.on('connection', (socket) => {
      this.sockets[socket.id] = {
        id: socket.id
      };
      socket.emit('connected', { status: true });
      socket.on('identify', (data) => {
        if (data.id) {
          console.log(data);
          socket.playfabId = data.id;
          this.sockets[socket.id] = {
            id: socket.id,
            userId: data.id
          };
        }
      });
      socket.on('disconnect', () => {
        delete this.sockets[socket.id];
      });
    });

    return this;
  }
};