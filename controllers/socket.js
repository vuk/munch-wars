'use strict';
const playfab = require('playfab-sdk/Scripts/PlayFab/PlayFabClient');
module.exports = {
  sockets: {},
  io: null,
  run: function (app, server) {
    this.io = require('socket.io')(server);
    console.log('Socket server running');

    this.io.on('connection', (socket) => {
      socket.emit('connected', { status: true });
      socket.on('identify', (data) => {
        if (data.id) {
          playfab.GetPlayerProfile({
            PlayFabId : data.id,
            ProfileConstraints : {
              ShowDisplayName : true,
              ShowLinkedAccounts: true
            }
          }, (error, response) => {
            if(error) { console.log(error); }
            else {
              socket.playfabId = data.id;
              delete response.data.PlayerProfile.TitleId;
              if (response.data.PlayerProfile.LinkedAccounts && response.data.PlayerProfile.LinkedAccounts[0].Username) {
                response.data.PlayerProfile.DisplayName = response.data.PlayerProfile.LinkedAccounts[0].Username;
              }
              this.sockets[socket.id] = {
                id: socket.id,
                userId: data.id,
                profile: response.data.PlayerProfile
              };
            }
          });
        }
      });
      socket.on('disconnect', () => {
        delete this.sockets[socket.id];
      });
    });

    return this;
  }
};