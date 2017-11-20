'use strict';
module.exports = {
  run: function () {
    const app = require('express')();
    const server = require('http').Server(app);
    const io = require('socket.io')(server);

    server.listen(8080);

    app.get('/', function (req, res) {
      res.send({
        msg: 'socket server is running here'
      });
    });

    io.on('connection', function (socket) {
      socket.emit('news', { hello: 'world' });
      socket.on('my other event', function (data) {
        console.log(data);
      });
    });
  }
};