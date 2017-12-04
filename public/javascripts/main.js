'use strict';
var socket;
(function () {

  var soundToggle = document.getElementById('toggle-sound');
  soundToggle.addEventListener('click', function (evt) {
    console.log('toggle sound');
    try {
      toggleSound();
    } catch (err) {
      console.debug(err);
    }
  });

})();

socket = io.connect('http://localhost:3000');
socket.on('connected', function (data) {
  if (data.status) {
    console.log(data);
    socket.emit('identify', { id: userId });
  }
});

socket.on('request_game', function (data) {
  console.log(data);
});

if (jQuery('#games').length > 0) {
  socket.emit('join_game', { opponent: opponent });
}

// Load opponents
if (jQuery('#opponents').length > 0) {
  $.get('/profile/actives', function (data) {
    for (var key in data) {
      if (key !== userId) {
        $('#opponents').append(
          '<div class="row opponent-row"><a href="/play?game='+ data[key].id +'">' +
          '    <div class="col-md-4">'+ data[key].profile.DisplayName +'</div>' +
          '    <div class="col-md-8">' +
          '        <div class="row">' +
          '            <div class="col-md-2">0</div>' +
          '            <div class="col-md-2">0</div>' +
          '            <div class="col-md-2">0</div>' +
          '            <div class="col-md-2">0</div>' +
          '            <div class="col-md-2">0</div>' +
          '            <div class="col-md-2">0</div>' +
          '        </div>' +
          '    </div>' +
          '</a></div>'
        );
      }
    }
  });
}