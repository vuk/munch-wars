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

socket = io.connect('http://sentora.vukstankovic.com:3000/');
socket.on('connected', function (data) {
  if (data.status) {
    socket.emit('identify', { id: userId });
  }
});

socket.on('accept_invite', function (data) {
  if (data.player1.profile.PlayerId !== userId) {
    localStorage.setItem('opponentId', data.player1.profile.PlayerId);
    $('#accept_modal').modal();
  }
  if (data.player2.profile.PlayerId !== userId) {
    localStorage.setItem('opponentId', data.player2.profile.PlayerId);
  }
});

$('#accept_invite').click(function () {
  $('#accept_modal').modal('hide');
  socket.emit('accept', {
    myId: userId,
    id: localStorage.getItem('opponentId')
  });
  if(window.location.href.indexOf("play?") === -1) {
    window.location.href = '/play?game=' + userId + '&noevent=true';
  }
});

if (jQuery('#games').length > 0 && !noevent) {
  if (window.location.href.indexOf('?game=') === -1) {
    window.location.href = '/profile';
  } else {
    socket.emit('invite', { id: opponent, myId: userId });
  }
}

// Load opponents
if (jQuery('#opponents').length > 0) {
  $.get('/profile/actives', function (data) {
    for (var key in data) {
      if (key !== userId) {
        $('#opponents').append(
          '<div class="row opponent-row"><a href="/play?game='+ data[key].profile.PlayerId +'">' +
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