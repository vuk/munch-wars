'use strict';

var initializeSound = function () {
  if (localStorage.getItem('muted') === 'true') {
    game.sound.mute = !game.sound.mute;
  }
};

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var toggleSound = function () {
  game.sound.mute = !game.sound.mute;
  localStorage.setItem('muted', game.sound.mute.toString());
};

var gameProperties = {
  screenWidth: 800,
  //screenHeight: 720,
  screenHeight: 400,

  dashSize: 5,

  paddleLeft_x: 30,
  paddleRight_x: 770,
  paddleVelocity: 600,
  paddleSegmentsMax: 8,
  paddleSegmentHeight: 2,
  paddleSegmentAngle: 8,
  paddleTopGap: 10,

  ballVelocity: 600,
  ballRandomStartingAngleLeft: [-120, 120],
  ballRandomStartingAngleRight: [-60, 60],
  ballStartDelay: 2,
  ballVelocityIncrement: 40,
  ballReturnCount: 4,

  scoreToWin: 6,
};

var graphicAssets = {
  ballURL: 'assets/ball-15.png',
  ballName: 'ball',

  paddleURL: 'assets/left-45.png',
  paddleDoubleURL: 'assets/left-90.png',
  paddleName: 'paddle_left',
  paddleDoubleName: 'double_paddle_left',

  paddleRightURL: 'assets/right-45.png',
  paddleRightDoubleUrl: 'assets/right-90.png',
  paddleRightName: 'paddle_right',
  paddleDoubleRightName: 'double_paddle_right',

  yellowBorder: 'assets/yellow-border.png',
  yellowBorderName: 'yellowBorder',
  redBorder: 'assets/red-border.png',
  redBorderName: 'redBorder',

  bulletLeftUrl: '/assets/bullet-left.png',
  bulletLeftName: 'bulletLeft',
  bulletRightUrl: '/assets/bullet-right.png',
  bulletRightName: 'bulletRight'
};

var soundAssets = {
  ballBounceURL: 'assets/ballBounce',
  ballBounceName: 'ballBounce',

  ballHitURL: 'assets/ballHit',
  ballHitName: 'ballHit',

  ballMissedURL: 'assets/ballMissed',
  ballMissedName: 'ballMissed',

  shotUrl: 'assets/audio/shot',
  shotName: 'shot',
  getMagicUrl: 'assets/audio/getmagic',
  getMagicName: 'getMagic',
  useMagicUrl: 'assets/audio/usemagic',
  useMagicName: 'useMagic',

  mp4URL: '.m4a',
  oggURL: '.ogg',
};

var fontAssets = {
  scoreLeft_x: gameProperties.screenWidth * 0.25,
  scoreRight_x: gameProperties.screenWidth * 0.75,
  scoreTop_y: 10,

  scoreFontStyle: {font: '80px orbitron', fill: '#FFFFFF', align: 'center'},
  instructionsFontStyle: {font: '20px orbitron', fill: '#FFDF00', align: 'center', fontWeight: 600},
  countdownFontStyle: {font: '48px orbitron', fill: '#FFDF00', align: 'center', fontWeight: 600},
};

var labels = {
  clickToStart: 'STRELICAMA GORE/DOLE POMERAŠ MUNCH, \nBROJEVIMA 1/2/3 ISPALJUJEŠ MAGIJE \n\n OSTVARI 6 BODOVA ZA POBEDU',
};

var isHome = false;
var isBallListenerSet = false;

var mainState = function (game) {
  this.backgroundGraphics;
  this.ballSprite;
  this.paddleLeftSprite;
  this.paddleRightSprite;
  this.paddleGroup;

  this.paddleLeft_up;
  this.paddleLeft_down;
  this.paddleRight_up;
  this.paddleRight_down;

  this.missedSide;

  this.scoreLeft;
  this.scoreRight;

  this.timer;
  this.timerEvent;

  //this.tf_scoreLeft;
  //this.tf_scoreRight;

  this.sndBallHit;
  this.sndBallBounce;
  this.sndBallMissed;

  this.instructions;
  //this.winnerLeft;
  //this.winnerRight;

  this.ballVelocity;

  // 0 left paddle, 1 right paddle, -1 just lounched
  this.lastHitBy = -1;
  this.players = [
    {
      id: 'left',
      magic: []
    },
    {
      id: 'right',
      magic: []
    }
  ]
};

function handleIncorrect(){
  if(!game.device.desktop){
    document.getElementById('turn').style.display='flex';
  }
}

function handleCorrect(){
  if(!game.device.desktop){
    document.getElementById('turn').style.display='none';
  }
}

mainState.prototype = {
  preload: function () {
    this.strikeCount = 0;
    this.bulletLeftSprite = null;
    this.bulletRightSprite = null;

    game.scale.forceOrientation(true, false);
    game.scale.enterIncorrectOrientation.add(handleIncorrect);
    game.scale.leaveIncorrectOrientation.add(handleCorrect);

    game.load.image(graphicAssets.ballName, graphicAssets.ballURL);
    game.load.image(graphicAssets.paddleName, graphicAssets.paddleURL);
    game.load.image(graphicAssets.paddleDoubleName, graphicAssets.paddleDoubleURL);
    game.load.image(graphicAssets.paddleRightName, graphicAssets.paddleRightURL);
    game.load.image(graphicAssets.paddleDoubleRightName, graphicAssets.paddleRightDoubleUrl);
    game.load.image(graphicAssets.yellowBorderName, graphicAssets.yellowBorder);
    game.load.image(graphicAssets.redBorderName, graphicAssets.redBorder);
    game.load.image(graphicAssets.bulletLeftName, graphicAssets.bulletLeftUrl);
    game.load.image(graphicAssets.bulletRightName, graphicAssets.bulletRightUrl);
    initializeSound();

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    game.load.audio(soundAssets.ballBounceName, [soundAssets.ballBounceURL + soundAssets.mp4URL, soundAssets.ballBounceURL + soundAssets.oggURL]);
    game.load.audio(soundAssets.ballHitName, [soundAssets.ballHitURL + soundAssets.mp4URL, soundAssets.ballHitURL + soundAssets.oggURL]);
    game.load.audio(soundAssets.ballMissedName, [soundAssets.ballMissedURL + soundAssets.mp4URL, soundAssets.ballMissedURL + soundAssets.oggURL]);
    game.load.audio(soundAssets.ballMissedName, [soundAssets.ballMissedURL + soundAssets.mp4URL, soundAssets.ballMissedURL + soundAssets.oggURL]);
    game.load.audio(soundAssets.shotName, [soundAssets.shotUrl + soundAssets.mp4URL, soundAssets.shotUrl + soundAssets.oggURL]);
    game.load.audio(soundAssets.useMagicName, [soundAssets.useMagicUrl + soundAssets.mp4URL, soundAssets.useMagicUrl + soundAssets.oggURL]);
    game.load.audio(soundAssets.getMagicName, [soundAssets.getMagicUrl + soundAssets.mp4URL, soundAssets.getMagicUrl + soundAssets.oggURL]);
  },

  create: function () {
    this.y = game.world.centerY;
    this.initGraphics();
    this.initPhysics();
    this.initKeyboard();
    this.initSounds();
    this.startDemo();
    this.drawBorders();
    //this.startCountdown();
    var self = this;
    this.cnt = 1;

    /** If I'm playing vs computer just take my choice of side from local storage **/
    if (computer) {
      this.side = localStorage.getItem('side');
      if (!this.side) {
        this.side = 'black';
      }
      //game.input.onDown.add(this.startCountdown, this);
      this.startCountdown();
    } else {
      if (userId === getParameterByName('game')) {
        isHome = true;
      }
      socket.on('start_game', function (data) {
        if (isHome) {
          self.side = data.guestSide === 'white' ? 'black' : 'white';
        } else {
          self.side = data.guestSide;
        }
        if (data.guestSide === 'white') {
          $('#right-name').html(data.player1.profile.DisplayName);
          $('#right-name-go').html(data.player1.profile.DisplayName);
          $('#left-name').html(data.player2.profile.DisplayName);
          $('#left-name-go').html(data.player2.profile.DisplayName);
        } else {
          $('#right-name').html(data.player2.profile.DisplayName);
          $('#right-name-go').html(data.player2.profile.DisplayName);
          $('#left-name').html(data.player1.profile.DisplayName);
          $('#left-name-go').html(data.player1.profile.DisplayName);
        }
        self.startCountdown();
      });
    }

    socket.on('move', function (data) {
      if (data.side === 'right' && self.side === 'black') {
        self.paddleRightSprite.body.velocity.y = data.velocity;
        self.paddleRightSprite.y = data.y;
        //game.physics.arcade.moveToXY(self.paddleRightSprite, gameProperties.paddleRight_x, data.y, 0, 40);
        //self.paddleRightSprite.body.velocity.y = data.velocity;
      }
      if (data.side === 'left' && self.side === 'white') {
        self.paddleLeftSprite.body.velocity.y = data.velocity;
        self.paddleLeftSprite.y = data.y;
        //game.physics.arcade.moveToXY(self.paddleLeftSprite, gameProperties.paddleLeft_x, data.y, 0, 40);
        //self.paddleLeftSprite.body.velocity.y = data.velocity;
      }
    });
    var self = this;
    socket.on('score', function (data) {
      self.scoreLeft = data.scoreLeft;
      self.scoreRight = data.scoreRight;
      self.updateScoreTextFields();
    });
  },

  shotRight: function () {
    var timer = game.time.create(false);
    var self = this;
    this.blockRightPaddle = true;
    timer.loop(3000, function () {
      self.blockRightPaddle = false;
    }, this);
    timer.start();
    this.bulletLeftSprite.kill();
  },
  shotLeft: function () {
    var timer = game.time.create(false);
    var self = this;
    this.blockLeftPaddle = true;
    timer.loop(3000, function () {
      self.blockLeftPaddle = false;
    }, this);
    timer.start();
    this.bulletRightSprite.kill();
  },
  leftOutBounds: function () {
    this.bulletLeftSprite.destroy();
  },
  rightOutBounds: function () {
    this.bulletRightSprite.destroy();
  },
  update: function () {
    this.moveLeftPaddle();
    this.moveRightPaddle();
    this.fireMagic();
    this.y = game.input.y;
    game.physics.arcade.overlap(this.ballSprite, this.paddleGroup, this.collideWithPaddle, null, this);
    game.physics.arcade.overlap(this.ballSprite, this.centerBottomBorder, this.collideWithMagicBounds, null, this);
    game.physics.arcade.overlap(this.ballSprite, this.centerTopBorder, this.collideWithMagicBounds, null, this);
    if(this.bulletRightSprite) {
      this.bulletRightSprite.events.onOutOfBounds.add(this.rightOutBounds, this);
      game.physics.arcade.overlap(this.bulletRightSprite, this.paddleLeftSprite, this.shotLeft, null, this);
    }
    if(this.bulletLeftSprite) {
      this.bulletLeftSprite.events.onOutOfBounds.add(this.leftOutBounds, this);
      game.physics.arcade.overlap(this.bulletLeftSprite, this.paddleRightSprite, this.shotRight, null, this);
    }

    if (this.ballSprite.body.blocked.up || this.ballSprite.body.blocked.down || this.ballSprite.body.blocked.left || this.ballSprite.body.blocked.right) {
      this.sndBallBounce.play();
    }
    var self = this;
    if (isHome) {
      socket.emit('ball_position', {
        id: getParameterByName('game'),
        x: this.ballSprite.body.x,
        y: this.ballSprite.body.y,
        velocityX: this.ballSprite.body.velocity.x,
        velocityY: this.ballSprite.body.velocity.y,
        visible: this.ballSprite.visible,
      });
    } else {
      if (!isBallListenerSet) {
        self.ballSprite.body.allowGravity = false;
        self.ballSprite.body.velocity.x = 0;
        self.ballSprite.body.velocity.y = 0;
        socket.on('ball', function (data) {
          self.ballSprite.visible = data.visible;
          /*if (Math.abs(self.ballSprite.body.x - data.x) < 50 && Math.abs(self.ballSprite.body.y - data.y) < 50)*/
          //game.physics.arcade.moveToXY(self.ballSprite, data.x, data.y, 0, 40);
          self.ballSprite.x = data.x;
          self.ballSprite.y = data.y;
          self.ballSprite.body.velocity.set(data.velocityX, data.velocityY);
          /*game.ballSprite.body.velocity.x = data.velocityX;
          game.ballSprite.body.velocity.y = data.velocityY;*/
        });
        isBallListenerSet = true;
      }
    }
    if (computer) {
      var y_pos = this.ballSprite.body.y;
      if (this.side === 'black') {
        var diff = -((this.paddleRightSprite.body.y + (this.paddleRightSprite.body.height / 2)) - y_pos);
      } else if (this.side === 'white') {
        var diff = -((this.paddleLeftSprite.body.y + (this.paddleLeftSprite.body.height / 2)) - y_pos);
      }
      /*if (diff < 0 && diff < -4) { // max speed left
        diff = -5;
      } else if (diff > 0 && diff > 4) { // max speed right
        diff = 5;
      }*/
      if (diff > 10) {
        if (this.side === 'black') {
          this.moveRightPaddle('down');
        } else if (this.side === 'white') {
          this.moveLeftPaddle('down');
        }
      } else if (diff < -10) {
        if (this.side === 'black') {
          this.moveRightPaddle('up');
        } else if (this.side === 'white') {
          this.moveLeftPaddle('up');
        }
      }
      /*if(this.paddle.x < 0) {
        this.paddle.x = 0;
      } else if (this.paddle.x + this.paddle.width > 400) {
        this.paddle.x = 400 - this.paddle.width;
      }*/
    }
  },

  drawBorders: function () {
    this.borderGroup = game.add.group();
    this.borderGroup.enableBody = true;
    this.borderGroup.physicsBodyType = Phaser.Physics.ARCADE;

    this.leftTopBorder = game.add.sprite(0, 0, graphicAssets.yellowBorderName);
    this.leftTopBorder.anchor.set(0, 0);

    this.rightTopBorder = game.add.sprite(game.world.width, 0, graphicAssets.yellowBorderName);
    this.rightTopBorder.anchor.set(0, 0);

    this.leftBottomBorder = game.add.sprite(0, 720, graphicAssets.yellowBorderName);
    this.leftBottomBorder.anchor.set(0, 1);

    this.rightBottomBorder = game.add.sprite(game.world.width, 720, graphicAssets.yellowBorderName);
    this.rightBottomBorder.anchor.set(0, 1);

    this.centerBottomBorder = game.add.sprite(game.world.centerX, 720, graphicAssets.redBorderName);
    this.centerBottomBorder.anchor.set(0.5, 1);

    this.centerTopBorder = game.add.sprite(game.world.centerX, 0, graphicAssets.redBorderName);
    this.centerTopBorder.anchor.set(0.5, 0);

    this.borderGroup.add(this.leftTopBorder);
    this.borderGroup.add(this.leftBottomBorder);
    this.borderGroup.add(this.rightTopBorder);
    this.borderGroup.add(this.rightBottomBorder);
    this.borderGroup.add(this.centerBottomBorder);
    this.borderGroup.add(this.centerTopBorder);

    this.borderGroup.setAll('checkWorldBounds', true);
    this.borderGroup.setAll('body.collideWorldBounds', true);
    this.borderGroup.setAll('body.immovable', true);
  },

  initGraphics: function () {
    this.backgroundGraphics = game.add.graphics(0, 0);
    this.backgroundGraphics.lineStyle(2, 0xFFFFFF, 1);

    /*for (var y = 0; y < gameProperties.screenHeight; y += gameProperties.dashSize * 2) {
      this.backgroundGraphics.moveTo(game.world.centerX, y);
      this.backgroundGraphics.lineTo(game.world.centerX, y + gameProperties.dashSize);
    }*/

    this.ballSprite = game.add.sprite(game.world.centerX, game.world.centerY, graphicAssets.ballName);
    this.ballSprite.anchor.set(0.5, 0.5);

    this.paddleLeftSprite = game.add.sprite(gameProperties.paddleLeft_x, game.world.centerY, graphicAssets.paddleName);
    this.paddleLeftSprite.anchor.set(0.5, 0.5);

    this.paddleRightSprite = game.add.sprite(gameProperties.paddleRight_x, game.world.centerY, graphicAssets.paddleRightName);
    this.paddleRightSprite.anchor.set(0.5, 0.5);

    //this.tf_scoreLeft = game.add.text(fontAssets.scoreLeft_x, fontAssets.scoreTop_y, '0', fontAssets.scoreFontStyle);
    //this.tf_scoreLeft.anchor.set(0.5, 0);

    //this.tf_scoreRight = game.add.text(fontAssets.scoreRight_x, fontAssets.scoreTop_y, '0', fontAssets.scoreFontStyle);
    //this.tf_scoreRight.anchor.set(0.5, 0);

    this.instructions = game.add.text(game.world.centerX, game.world.height - 30, labels.clickToStart, fontAssets.instructionsFontStyle);
    this.instructions.anchor.set(0.5, 1);

    //this.winnerLeft = game.add.text(gameProperties.screenWidth * 0.25, gameProperties.screenHeight * 0.25, labels.winner, fontAssets.instructionsFontStyle);
    //this.winnerLeft.anchor.set(0.5, 0.5);

    //this.winnerRight = game.add.text(gameProperties.screenWidth * 0.75, gameProperties.screenHeight * 0.25, labels.winner, fontAssets.instructionsFontStyle);
    //this.winnerRight.anchor.set(0.5, 0.5);

    this.hideTextFields();
  },

  startCountdown: function () {
    this.timer = game.time.create();
    this.countdownText = game.add.text(game.world.centerX, game.world.centerY, '3', fontAssets.countdownFontStyle);
    this.countdownText.anchor.set(0.5, 0.5);

    this.timerEvent = this.timer.add(Phaser.Timer.SECOND * 3, this.endTimer, this);

    // Start the timer
    this.timer.start();
  },

  endTimer: function () {
    // Stop the timer when the delayed event triggers
    this.timer.stop();
    this.countdownText.destroy();
    this.startGame();
  },

  render: function () {
    if (this.timer && this.timer.running) {
      this.countdownText.setText(this.formatTime(Math.round((this.timerEvent.delay - this.timer.ms) / 1000)), 2, 14, '#ff0');
    }
  },

  formatTime: function (s) {
    // Convert seconds (s) to a nicely formatted and padded time string
    var minutes = '0' + Math.floor(s / 60);
    var seconds = (s - minutes * 60);
    return seconds.toString().substr(-2);
  },

  initPhysics: function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.enable(this.ballSprite, Phaser.Physics.ARCADE);

    this.ballSprite.checkWorldBounds = true;
    this.ballSprite.body.collideWorldBounds = true;
    this.ballSprite.body.immovable = true;
    this.ballSprite.body.bounce.set(1);
    this.ballSprite.events.onOutOfBounds.add(this.ballOutOfBounds, this);

    this.paddleGroup = game.add.group();
    this.paddleGroup.enableBody = true;
    this.paddleGroup.physicsBodyType = Phaser.Physics.ARCADE;

    this.paddleGroup.add(this.paddleLeftSprite);
    this.paddleGroup.add(this.paddleRightSprite);

    this.paddleGroup.setAll('checkWorldBounds', true);
    this.paddleGroup.setAll('body.collideWorldBounds', true);
    this.paddleGroup.setAll('body.immovable', true);
  },

  initKeyboard: function () {
    this.paddleLeft_up = game.input.keyboard.addKey(Phaser.Keyboard.A);
    this.paddleLeft_down = game.input.keyboard.addKey(Phaser.Keyboard.Z);
    this.buttonOne = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    this.buttonTwo = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
    this.buttonThree = game.input.keyboard.addKey(Phaser.Keyboard.THREE);

    this.paddleRight_up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    this.paddleRight_down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
  },

  initSounds: function () {
    this.sndBallHit = game.add.audio(soundAssets.ballHitName);
    this.sndBallBounce = game.add.audio(soundAssets.ballBounceName);
    this.sndBallMissed = game.add.audio(soundAssets.ballMissedName);
    this.shotSound = game.add.audio(soundAssets.shotName);
    this.getMagic = game.add.audio(soundAssets.getMagicName);
    this.useMagic = game.add.audio(soundAssets.useMagicName);
  },

  startDemo: function () {
    this.ballSprite.visible = false;
    /*this.ballSprite.velocity.x = 0;
    this.ballSprite.velocity.y = 0;*/
    //this.resetBall();
    this.enablePaddles(false);
    this.enableBoundaries(true);
    /*if (computer) {
      game.input.onDown.add(this.startCountdown, this);
    }*/
    this.instructions.visible = true;
  },

  gameOver: function () {
    $('#game-over').show();
    this.ballSprite.visible = false;
    this.enablePaddles(false);
    this.enableBoundaries(true);
    $('.hide-on-go span').hide();
  },

  startGame: function () {
    game.input.onDown.remove(this.startCountdown, this);

    this.enablePaddles(true);
    this.enableBoundaries(false);
    this.resetBall();
    this.resetScores();
    this.hideTextFields();
  },

  startBall: function () {
    this.ballVelocity = gameProperties.ballVelocity;
    this.ballReturnCount = 0;
    this.ballSprite.visible = true;

    if (isHome || computer) {
      var randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight.concat(gameProperties.ballRandomStartingAngleLeft));

      if (this.missedSide == 'right') {
        randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight);
      } else if (this.missedSide == 'left') {
        randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleLeft);
      }

      game.physics.arcade.velocityFromAngle(randomAngle, gameProperties.ballVelocity, this.ballSprite.body.velocity);
    }
  },

  resetBall: function () {
    if (isHome || computer) {
      this.ballSprite.reset(game.world.centerX, game.rnd.between(0, gameProperties.screenHeight));
      this.ballSprite.visible = false;
      game.time.events.add(Phaser.Timer.SECOND * gameProperties.ballStartDelay, this.startBall, this);
    }
  },

  enablePaddles: function (enabled) {
    this.paddleGroup.setAll('visible', enabled);
    this.paddleGroup.setAll('body.enable', enabled);

    this.paddleLeft_up.enabled = enabled;
    this.paddleLeft_down.enabled = enabled;
    this.paddleRight_up.enabled = enabled;
    this.paddleRight_down.enabled = enabled;

    this.paddleLeftSprite.y = game.world.centerY;
    this.paddleRightSprite.y = game.world.centerY;
  },

  enableBoundaries: function (enabled) {
    game.physics.arcade.checkCollision.left = enabled;
    game.physics.arcade.checkCollision.right = enabled;
  },

  moveLeftPaddle: function (direction) {
    var direction = direction || null;
    if (!this.blockLeftPaddle) {
      if (this.side === 'black') {
        if (this.paddleRight_up.isDown || this.y > game.input.y) {
          this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_down.isDown || this.y < game.input.y) {
          this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
          this.paddleLeftSprite.body.velocity.y = 0;
        }

        if (this.paddleLeftSprite.body.y < gameProperties.paddleTopGap) {
          this.paddleLeftSprite.body.y = gameProperties.paddleTopGap;
        }
        if (!computer) {
          socket.emit('move_paddle', {
            id: getParameterByName('game'),
            side: 'left',
            velocity: this.paddleLeftSprite.body.velocity.y,
            y: this.paddleLeftSprite.body.y + this.paddleLeftSprite.body.height / 2
          });
        }
      }
      if (computer && this.side === 'white') {
        if (direction === 'up') {
          this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (direction === 'down') {
          this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
          this.paddleLeftSprite.body.velocity.y = 0;
        }

        if (this.paddleLeftSprite.body.y < gameProperties.paddleTopGap) {
          this.paddleLeftSprite.body.y = gameProperties.paddleTopGap;
        }
      }
    }
  },

  moveRightPaddle: function (direction) {
    var direction = direction || null;
    if (!this.blockRightPaddle) {
      if (this.side === 'white') {
        if (this.paddleRight_up.isDown || this.y > game.input.y) {
          this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_down.isDown || this.y < game.input.y) {
          this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
          this.paddleRightSprite.body.velocity.y = 0;
        }

        if (this.paddleRightSprite.body.y < gameProperties.paddleTopGap) {
          this.paddleRightSprite.body.y = gameProperties.paddleTopGap;
        }
        if (!computer) {
          socket.emit('move_paddle', {
            id: getParameterByName('game'),
            side: 'right',
            velocity: this.paddleRightSprite.body.velocity.y,
            y: this.paddleRightSprite.body.y + this.paddleRightSprite.body.height / 2
          });
        }
      }
      if (computer && this.side === 'black') {
        if (direction === 'up') {
          this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (direction === 'down') {
          this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
          this.paddleRightSprite.body.velocity.y = 0;
        }

        if (this.paddleRightSprite.body.y < gameProperties.paddleTopGap) {
          this.paddleRightSprite.body.y = gameProperties.paddleTopGap;
        }
      }
    }
  },

  collideWithPaddle: function (ball, paddle) {
    this.sndBallHit.play();
    this.strikeCount++;

    this.lastHitBy = (ball.x < gameProperties.screenWidth * 0.5) ? 0 : 1;

    var returnAngle;
    var segmentHit = Math.floor((ball.y - paddle.y) / gameProperties.paddleSegmentHeight);

    if (segmentHit >= gameProperties.paddleSegmentsMax) {
      segmentHit = gameProperties.paddleSegmentsMax - 1;
    } else if (segmentHit <= -gameProperties.paddleSegmentsMax) {
      segmentHit = -(gameProperties.paddleSegmentsMax - 1);
    }

    if (paddle.x < gameProperties.screenWidth * 0.5) {
      returnAngle = segmentHit * gameProperties.paddleSegmentAngle;
      game.physics.arcade.velocityFromAngle(returnAngle, this.ballVelocity, this.ballSprite.body.velocity);
    } else {
      returnAngle = 180 - (segmentHit * gameProperties.paddleSegmentAngle);
      if (returnAngle > 180) {
        returnAngle -= 360;
      }

      game.physics.arcade.velocityFromAngle(returnAngle, this.ballVelocity, this.ballSprite.body.velocity);
    }

    this.ballReturnCount++;

    if (this.ballReturnCount >= gameProperties.ballReturnCount) {
      this.ballReturnCount = 0;
      this.ballVelocity += gameProperties.ballVelocityIncrement;
    }
  },

  collideWithMagicBounds: function (ball, magicBound) {
    if (isHome || computer) {
      if (this.lastHitBy < 0 || this.magicCountdown > 0) {
        this.magicCountdown--;
        return;
      }
      var player = this.players[this.lastHitBy];
      if (player.magic.length >= 3) {
        return;
      }
      var randomMagic = Math.floor(Math.random() * 4);
      console.log(player.id + ' gets some random WOODOO: ' + randomMagic);
      switch (randomMagic) {
        case 0:
          player.magic.push('shoot');
          break;
        case 1:
          player.magic.push('double-size');
          break;
        case 2:
          player.magic.push('hor-position');
          break;
        case 3:
          player.magic.push('ver-position');
          break;
      }
      this.getMagic.play();
      this.magicCountdown = 1;

      if (!computer) {
        socket.emit('magic_sync', {
          id: getParameterByName('game'),
          players: this.players,
          evt: 'earned'
        });
      }
      this.renderPlayerMagic(player);
    } else {
      var self = this;
      socket.on('magic', function (data) {
        console.log(data, 'magic');
        self.players = data.players;
        self.renderPlayerMagic(self.players[0]);
        self.renderPlayerMagic(self.players[1]);
      });
    }
  },

  renderPlayerMagic: function(player) {
    var allSpriteClassNames = 'sprite-double-size sprite-shoot sprite-hor-position sprite-ver-position sprite-empty';
    jQuery('#' + player.id + '-player-magic-1').removeClass(allSpriteClassNames).addClass((player.magic[0] !== void 0) ? 'sprite-' + player.magic[0] : 'sprite-empty');
    jQuery('#' +player.id + '-player-magic-2').removeClass(allSpriteClassNames).addClass((player.magic[1] !== void 0) ? 'sprite-' + player.magic[1] : 'sprite-empty');
    jQuery('#' +player.id + '-player-magic-3').removeClass(allSpriteClassNames).addClass((player.magic[2] !== void 0) ? 'sprite-' + player.magic[2] : 'sprite-empty');
  },
  fireCount: 0,

  fireMagic: function () {
    if (this.fireCount > 5) {
      this.fireCount = 0;
      var side = this.side === 'white' ? 1 : 0;
      if (this.buttonOne.isDown && this.players[side].magic[0]) {
        this.processMagic(this.players[side].magic[0], side);
        this.players[side].magic.splice(0, 1);
      }
      if (this.buttonTwo.isDown && this.players[side].magic[1]) {
        this.processMagic(this.players[side].magic[1], side);
        this.players[side].magic.splice(1, 1);
      }
      if (this.buttonThree.isDown && this.players[side].magic[2]) {
        this.processMagic(this.players[side].magic[2], side);
        this.players[side].magic.splice(2, 1);
      }
      this.renderPlayerMagic(this.players[side]);
    } else {
      this.fireCount ++;
    }
    socket.emit('magic_sync', {
      id: getParameterByName('game'),
      players: this.players,
      evt: 'fired'
    });
  },

  processMagic: function (magic, side) {
    switch (magic) {
      case 'shoot':
        this.processShot(side);
        break;
      case 'double-size':
        this.processDouble(side);
        break;
      case 'hor-position':
        this.processHor(side);
        break;
      case 'ver-position':
        this.processVer(side);
        break;
    }
  },
  processShot: function (side) {
    this.shotSound.play();
    if(side === 0) {
      this.bulletLeftSprite = game.add.sprite(gameProperties.paddleLeft_x, this.paddleLeftSprite.y, graphicAssets.bulletLeftName);
      game.physics.enable(this.bulletLeftSprite, Phaser.Physics.ARCADE);
      this.bulletLeftSprite.enableBody = true;
      this.bulletLeftSprite.body.velocity.x = 800;
      this.bulletLeftSprite.body.velocity.y = 0;
    }
    if(side === 1) {
      this.bulletRightSprite = game.add.sprite(gameProperties.paddleRight_x, this.paddleRightSprite.y, graphicAssets.bulletRightName);
      game.physics.enable(this.bulletRightSprite, Phaser.Physics.ARCADE);
      this.bulletRightSprite.enableBody = true;
      this.bulletRightSprite.body.velocity.x = -800;
      this.bulletRightSprite.body.velocity.y = 0;
    }
  },
  doubleActive: [],
  originalPaddleHeight: 0,
  processDouble: function (side) {
    this.useMagic.play();
    if (side === 0 && !this.doubleActive[side]) {
      this.paddleLeftSprite.key = graphicAssets.paddleDoubleName;
      this.paddleLeftSprite.loadTexture(graphicAssets.paddleDoubleName, 0);
      this.originalPaddleHeight = this.paddleLeftSprite.height;
      this.paddleLeftSprite.height *= 1.5;
    }
    if (side === 1 && !this.doubleActive[side]) {
      this.paddleRightSprite.key = graphicAssets.paddleDoubleRightName;
      this.paddleRightSprite.loadTexture(graphicAssets.paddleDoubleRightName, 0);
      this.originalPaddleHeight = this.paddleRightSprite.height;
      this.paddleRightSprite.height *= 1.5;
    }
    this.doubleActive[side] = true;
  },
  processHor: function (side) {
    this.useMagic.play();
    this.ballSprite.body.velocity.set(-1 * this.ballSprite.body.velocity.x, -1 * this.ballSprite.body.velocity.y);
  },
  processVer: function (side) {
    this.useMagic.play();
    this.ballSprite.body.velocity.set(this.ballSprite.body.velocity.x * 1.25, -1 * this.ballSprite.body.velocity.y);
  },
  undoMagics: function () {
    this.undoDouble();
  },
  undoDouble: function () {
    if (this.doubleActive[0]) {
      this.paddleLeftSprite.key = graphicAssets.paddleName;
      this.paddleLeftSprite.loadTexture(graphicAssets.paddleName, 0);
      this.paddleLeftSprite.height /= 1.5;
      this.doubleActive[0] = false;
    }
    if (this.doubleActive[1]) {
      this.paddleRightSprite.key = graphicAssets.paddleRightName;
      this.paddleRightSprite.loadTexture(graphicAssets.paddleRightName, 0);
      this.paddleRightSprite.height  /= 1.5;
      this.doubleActive[1] = false;
    }
  },

  ballOutOfBounds: function () {
    this.lastHitBy = -1;
    this.sndBallMissed.play();
    if (isHome || computer) {
      if (this.ballSprite.x < 0) {
        this.missedSide = 'left';
        this.scoreRight++;
      } else if (this.ballSprite.x > gameProperties.screenWidth) {
        this.missedSide = 'right';
        this.scoreLeft++;
      }

      this.updateScoreTextFields();
      this.undoMagics();
      if (!computer) {
        socket.emit('relevant_score', {
          id: getParameterByName('game'),
          scoreLeft: this.scoreLeft,
          scoreRight: this.scoreRight
        });
      }
    }

    if (this.scoreLeft >= gameProperties.scoreToWin) {
      // If host is black player means he's won
      if (isHome) {
        socket.emit('winner', {
          id: this.side === 'black' ? userId : opponent,
          points: this.strikeCount + 3 * this.scoreLeft,
          pointsLoser: this.scoreRight
        });
      } else if (computer && this.side === 'black') {
        socket.emit('winner', {
          id: userId,
          points: this.strikeCount + 3 * this.scoreLeft,
          pointsLoser: this.scoreRight
        });
      }
      this.gameOver();
    } else if (this.scoreRight >= gameProperties.scoreToWin) {
      // If host is black player, means guest has won
      if (isHome) {
        socket.emit('winner', {
          id: this.side === 'black' ? opponent : userId,
          points: this.strikeCount + 3 * this.scoreRight,
          pointsLoser: this.scoreLeft
        });
      } else if (computer && this.side === 'white') {
        socket.emit('winner', {
          id: userId,
          points: this.strikeCount + 3 * this.scoreLeft,
          pointsLoser: this.scoreRight
        });
      }
      this.gameOver();
    } else {
      this.resetBall();
    }
  },
  resetScores: function () {
    this.scoreLeft = 0;
    this.scoreRight = 0;
    this.updateScoreTextFields();
  },

  updateScoreTextFields: function () {
    //this.tf_scoreLeft.text = this.scoreLeft;
    jQuery('#left-score').html(this.scoreLeft);
    jQuery('#left-score-go').html(this.scoreLeft);
    //this.tf_scoreRight.text = this.scoreRight;
    jQuery('#right-score').html(this.scoreRight);
    jQuery('#right-score-go').html(this.scoreRight);
  },

  hideTextFields: function () {
    this.instructions.visible = false;
    //this.winnerLeft.visible = false;
    //this.winnerRight.visible = false;
  },
};
if ($('#munch-pong').length > 0) {
  var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'munch-pong', false, true);
  game.state.add('main', mainState);
  game.state.start('main');
}