'use strict';
var socket;
(function() {

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
  console.log(data);
  if (data.status) {
    console.log(data);
    socket.emit('identify', { id: userId });
  }
});