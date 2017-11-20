'use strict';
(function() {
  var soundToggle = document.getElementById('toggle-sound');
  console.log(soundToggle);

  soundToggle.addEventListener('click', function (evt) {
    console.log('toggle sound');
    toggleSound();
  });
})();