'use strict';
module.exports = {
  sockets: [],
  run: function (app, server) {
    var _this = this;
    const io = require('socket.io')(server);
    console.log('Socket server running');

    app.get('/socket', function (req, res) {
      res.send({
        msg: 'socket server is running here'
      });
    });

    io.on('connection', function (socket) {
      console.log(socket);
      _this.sockets.push(socket);
      socket.emit('news', { hello: 'world' });
      socket.on('my other event', function (data) {
        console.log(data);
      });
    });
  }
};