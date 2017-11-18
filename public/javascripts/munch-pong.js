'use strict';
function HomeState () {
  console.log('%Home State', 'color:white; background:red');
}

HomeState.prototype = {

  init: function () {

  },

  preload: function () {
    game.load.image('hello', 'https://s3.amazonaws.com/uploads-1969f46zwpmbh5cm3kr2/hello.png');
  },

  create: function () {
    this.hello_sprite = game.add.sprite(250, 300, 'hello');
  },

  update: function () {
    this.hello_sprite.angle += 1;
  },

  shutdown: function () {

  },

  destroy: function (question) {

  }
};

var game = new window.Phaser.Game(800, 600, window.Phaser.CANVAS, 'munch-pong', {
  preload: function () {
    this.load.crossOrigin = 'Anonymous';
  }
}, true, false);

var home = new HomeState();

game.state.add('Home', home);
game.state.start('Home', true, true);