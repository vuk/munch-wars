'use strict';
var sync = 0;
var initializeSound = function () {
  if (localStorage.getItem('muted') === 'true') {
    game.sound.mute = true;
  }
};

function getParameterByName (name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var toggleSound = function () {
  var muted = localStorage.getItem('muted');
  var mutedBool;
  if (muted === 'true') {
    mutedBool = true;
  } else {
    mutedBool = false;
  }
  if (game) {
    game.sound.mute = !mutedBool;
  }
  localStorage.setItem('muted', (!mutedBool).toString());
  if (!mutedBool) {
    $('.sound-off-wrapper').addClass('active');
    $('.sound-on-wrapper').removeClass('active');
  } else {
    $('.sound-on-wrapper').addClass('active');
    $('.sound-off-wrapper').removeClass('active');
  }
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
  paddleTopGap: 0,

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

  bulletLeftUrl: '/assets/bullet-left-50.png',
  bulletLeftName: 'bulletLeft',
  bulletRightUrl: '/assets/bullet-right-50.png',
  bulletRightName: 'bulletRight'
};

var soundAssets = {
  ballBounceURL: 'assets/audio/menu',
  ballBounceName: 'ballBounce',

  ballHitURL: 'assets/audio/menu',
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

  scoreFontStyle: { font: '80px orbitron', fill: '#FFFFFF', align: 'center' },
  instructionsFontStyle: { font: '16px orbitron', fill: '#FFDF00', align: 'center', fontWeight: 500 },
  countdownFontStyle: { font: '72px orbitron', fill: '#FFDF00', align: 'center', fontWeight: 600 },
  getReadyStyle: { font: '28px orbitron', fill: '#FFDF00', align: 'center', fontWeight: 600 },
};

var labels = {
  clickToStart: 'STRELICAMA GORE/DOLE POMERAŠ MUNCH, \nBROJEVIMA 1/2/3 ISPALJUJEŠ MAGIJE \n\n OSTVARI 6 BODOVA ZA POBEDU',
  getReady: 'PRIPREMI SE!'
};

var isHome = false;
var buttonPressed = 0;

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
      color: 'black',
      magic: []
    },
    {
      id: 'right',
      color: 'white',
      magic: []
    }
  ];
};

function handleIncorrect () {
  if (!game.device.desktop) {
    document.getElementById('turn').style.display = 'flex';
  }
}

function handleCorrect () {
  if (!game.device.desktop) {
    document.getElementById('turn').style.display = 'none';
  }
}

mainState.prototype = {
  preload: function () {
    this.strikeCount = 0;
    this.leftStrikeCount = 0;
    this.rightStrikeCount = 0;
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
    this.enablePaddles(true);
    //this.startCountdown();
    var self = this;
    this.cnt = 1;
    this.submitted = false;
    $('#accept_invite').click(function () {
      game.state.start('main', true, false);
    });

    $('#left-player-magic-1, #right-player-magic-1').click(function () {
      self.fireMagic(1);
    });

    $('#left-player-magic-2, #right-player-magic-2').click(function () {
      self.fireMagic(2);
    });

    $('#left-player-magic-3, #right-player-magic-3').click(function () {
      self.fireMagic(3);
    });

    /** If I'm playing vs computer just take my choice of side from local storage **/
    if (computer) {
      this.side = localStorage.getItem('side');
      if (!this.side) {
        this.side = 'black';
      }
      //game.input.onDown.add(this.startCountdown, this);
      this.startCountdown();
      //this.ballSprite.visible = true;
    } else {
      if (userId === getParameterByName('game')) {
        isHome = true;
      }
      socket.on('start_game', function (data) {
        $('#invited_modal').modal('hide');
        if (isHome) {
          self.side = data.guestSide === 'white' ? 'black' : 'white';
        } else {
          self.side = data.guestSide;
        }
        if (data.guestSide === 'white') {
          $('#right-name').html(data.player1.profile.DisplayName);
          $('#right-name-go').html(data.player1.profile.DisplayName);
          $('#right-rank').html('<img src="' + getRankIcon(_.find(data.player1.stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(data.player1.stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
          $('#right-rank-go').html('<img src="' + getRankIcon(_.find(data.player1.stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(data.player1.stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
          $('#left-name').html(data.player2.profile.DisplayName);
          $('#left-name-go').html(data.player2.profile.DisplayName);
          $('#left-rank').html('<img src="' + getRankIcon(_.find(data.player2.stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(data.player2.stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
          $('#left-rank-go').html('<img src="' + getRankIcon(_.find(data.player2.stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(data.player2.stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
        } else {
          $('#right-name').html(data.player2.profile.DisplayName);
          $('#right-name-go').html(data.player2.profile.DisplayName);
          $('#right-rank').html('<img src="' + getRankIcon(_.find(data.player2.stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(data.player2.stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
          $('#right-rank-go').html('<img src="' + getRankIcon(_.find(data.player2.stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(data.player2.stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
          $('#left-name').html(data.player1.profile.DisplayName);
          $('#left-name-go').html(data.player1.profile.DisplayName);
          $('#left-rank').html('<img src="' + getRankIcon(_.find(data.player1.stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(data.player1.stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
          $('#left-rank-go').html('<img src="' + getRankIcon(_.find(data.player1.stats.data.Statistics, { StatisticName: 'Total Points' }) ? _.find(data.player1.stats.data.Statistics, { StatisticName: 'Total Points' }).Value : 0) + '"/>');
        }
        //self.ballSprite.visible = true;
        self.startCountdown();
      });
    }

    socket.on('update_state', function (data) {
      this.lastUpdate = Date.now();
      if (!self.syncData.time || self.syncData.time <= data.time && data.ball.visible) {
        self.syncData = data;
      }
    });
    socket.on('score', function (data) {
      self.scoreLeft = data.scoreLeft;
      self.scoreRight = data.scoreRight;
      self.leftStrikeCount = data.leftStrikeCount;
      self.rightStrikeCount = data.rightStrikeCount;
      self.updateScoreTextFields();
    });

    socket.on('magic', function (data) {
      self.players = data.players;
      self.updatePlayerMagicUI(self.players[0]);
      self.updatePlayerMagicUI(self.players[1]);
    });

    socket.on('sync_shot', function (data) {
      if (data.myId !== userId) {
        self.handleShot(data.side, data.y);
      }
    });
    socket.on('sync_hor', function (data) {
      if (data.myId !== userId) {
        self.handleHor(false);
      }
    });
    socket.on('sync_ver', function (data) {
      if (data.myId !== userId) {
        self.handleVer(false);
      }
    });
    socket.on('sync_double', function (data) {
      if (data.myId !== userId) {
        self.handleDouble(data.side);
      }
    });

    if (!isHome) {
      socket.on('gameover', function (data) {
        self.ballSprite.reset(game.world.centerX, game.world.centerY);
        self.ballSprite.kill();
        $('#game-over').show();
        game.sound.stopAll();
        self.enablePaddles(false);
        self.enableBoundaries(true);
        $('.hide-on-go span').hide();
        self.resetBall();
      });

      socket.on('outOfBounds', function () {
        self.ballOutOfBounds();
      });

    }
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
  lastBallUpdate: 0,
  syncData: {},
  lastUpdate: 0,
  updateState: function () {
    this.lastUpdate = Date.now();
    if (this.syncData) {
      if (this.side === 'white' && this.syncData.paddle && this.syncData.paddle['left'] && this.syncData.paddle['left'].y) {
        this.paddleLeftSprite.body.velocity.y = this.syncData.paddle['left'].velocity;
        this.paddleLeftSprite.y = this.syncData.paddle['left'].y;
      }
      if (this.side === 'black' && this.syncData.paddle && this.syncData.paddle['right'] && this.syncData.paddle['right'].y) {
        this.paddleRightSprite.body.velocity.y = this.syncData.paddle['right'].velocity;
        this.paddleRightSprite.y = this.syncData.paddle['right'].y;
      }
      if (this.syncData && this.syncData.ball && !isHome && this.syncData.ball.x) {
        /*this.ballSprite.x = this.syncData.ball.x + this.ballSprite.width / 2;
        this.ballSprite.y = this.syncData.ball.y + this.ballSprite.height / 2;*/
        /*self.ballSprite.anchor.setTo(0.5, 0.5);*/
        this.ballSprite.visible = this.syncData.ball.visible;
        /*this.ballSprite.body.velocity.set(this.syncData.ball.velocityX, this.syncData.ball.velocityY);
        this.ballSprite.body.velocity.x = this.syncData.ball.velocityX;
        this.ballSprite.body.velocity.y = this.syncData.ball.velocityY;*/
        //game.physics.arcade.moveToXY(this.ballSprite, this.syncData.ball.x + this.ballSprite.width / 2, this.syncData.ball.y + this.ballSprite.height / 2, 0, 20);
        game.add.tween(this.ballSprite).to({
          x: this.syncData.ball.x + this.ballSprite.width / 2,
          y: this.syncData.ball.y + this.ballSprite.height / 2
        }, 22, Phaser.Easing.Linear.None, true, 0);
      }
    }
  },
  update: function () {
    this.updateState();
    this.moveLeftPaddle();
    this.moveRightPaddle();
    this.fireMagic();
    this.y = game.input.y;
    game.physics.arcade.overlap(this.ballSprite, this.paddleGroup, this.collideWithPaddle, null, this);
    game.physics.arcade.overlap(this.ballSprite, this.centerBottomBorder, this.collideWithMagicBounds, null, this);
    game.physics.arcade.overlap(this.ballSprite, this.centerTopBorder, this.collideWithMagicBounds, null, this);
    if (this.bulletRightSprite) {
      this.bulletRightSprite.events.onOutOfBounds.add(this.rightOutBounds, this);
      game.physics.arcade.overlap(this.bulletRightSprite, this.paddleLeftSprite, this.shotLeft, null, this);
    }
    if (this.bulletLeftSprite) {
      this.bulletLeftSprite.events.onOutOfBounds.add(this.leftOutBounds, this);
      game.physics.arcade.overlap(this.bulletLeftSprite, this.paddleRightSprite, this.shotRight, null, this);
    }

    if (this.ballSprite.body.blocked.up || this.ballSprite.body.blocked.down || this.ballSprite.body.blocked.left || this.ballSprite.body.blocked.right) {
      this.sndBallBounce.play();
    }
    var self = this;
    if (isHome && !computer) {
      socket.emit('ball_position', {
        id: getParameterByName('game'),
        x: this.ballSprite.body.x,
        y: this.ballSprite.body.y,
        velocityX: this.ballSprite.body.velocity.x,
        velocityY: this.ballSprite.body.velocity.y,
        visible: this.ballSprite.visible,
        time: Date.now()
      });
    }
    /*else {
         if (!isBallListenerSet) {
           self.ballSprite.body.allowGravity = false;
           self.ballSprite.body.velocity.x = 0;
           self.ballSprite.body.velocity.y = 0;
           socket.on('ball', function (data) {
             self.ballSprite.visible = data.visible;
             self.ballSprite.x = data.x;
             self.ballSprite.y = data.y;
             self.ballSprite.body.velocity.set(data.velocityX, data.velocityY);
           });
           isBallListenerSet = true;
         }
       }*/
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

    this.leftBottomBorder = game.add.sprite(0, 400, graphicAssets.yellowBorderName);
    this.leftBottomBorder.anchor.set(0, 1);

    this.rightBottomBorder = game.add.sprite(game.world.width, 400, graphicAssets.yellowBorderName);
    this.rightBottomBorder.anchor.set(0, 1);

    this.centerBottomBorder = game.add.sprite(game.world.centerX, 400, graphicAssets.redBorderName);
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

    this.ballSprite = game.add.sprite(game.world.centerX, game.world.centerY, graphicAssets.ballName);
    this.ballSprite.anchor.set(0.5, 0.5);

    this.paddleLeftSprite = game.add.sprite(gameProperties.paddleLeft_x, game.world.centerY, graphicAssets.paddleName);
    this.paddleLeftSprite.anchor.set(0.5, 0.5);

    this.paddleRightSprite = game.add.sprite(gameProperties.paddleRight_x, game.world.centerY, graphicAssets.paddleRightName);
    this.paddleRightSprite.anchor.set(0.5, 0.5);

    this.instructions = game.add.text(game.world.centerX, game.world.height - 20, labels.clickToStart, fontAssets.instructionsFontStyle);
    this.instructions.addColor('#FFFFFF', 11);
    this.instructions.addColor('#FFDF00', 15);
    this.instructions.addColor('#FFFFFF', 16);
    this.instructions.addColor('#FFDF00', 20);
    this.instructions.addColor('#FFFFFF', 46);
    this.instructions.addColor('#FFDF00', 47);
    this.instructions.addColor('#FFFFFF', 48);
    this.instructions.addColor('#FFDF00', 49);
    this.instructions.addColor('#FFFFFF', 50);
    this.instructions.addColor('#FFDF00', 51);
    this.instructions.anchor.set(0.5, 1);

    this.hideTextFields();
  },

  startCountdown: function () {
    $('#game-over').hide();
    this.timer = game.time.create();
    this.countdownText = game.add.text(game.world.centerX, game.world.centerY, '3', fontAssets.countdownFontStyle);
    this.getReady = game.add.text(game.world.centerX, 60, labels.getReady, fontAssets.getReadyStyle);
    this.getReady.anchor.set(0.5, 0.5);
    this.countdownText.anchor.set(0.5, 0.5);

    this.timerEvent = this.timer.add(Phaser.Timer.SECOND * 3, this.endTimer, this);

    // Start the timer
    this.timer.start();
  },

  endTimer: function () {
    // Stop the timer when the delayed event triggers
    this.timer.stop();
    this.countdownText.destroy();
    this.getReady.visible = false;
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
    this.ballSprite.reset(game.world.centerX, game.rnd.between(0, gameProperties.screenHeight));
    this.ballSprite.visible = false;
    this.ballSprite.body.velocity.x = 0;
    this.ballSprite.body.velocity.y = 0;
    this.enablePaddles(false);
    this.enableBoundaries(true);
    /*if (computer) {
      game.input.onDown.add(this.startCountdown, this);
    }*/
    this.instructions.visible = true;
  },

  gameOver: function () {
    $('#game-over').show();
    game.sound.stopAll();
    this.ballSprite.reset(game.world.centerX, game.rnd.between(0, gameProperties.screenHeight));
    this.ballSprite.visible = false;
    this.ballSprite.body.velocity.x = 0;
    this.ballSprite.body.velocity.y = 0;
    this.enablePaddles(false);
    this.enableBoundaries(true);
    $('.hide-on-go span').hide();
    if (isHome) {
      socket.emit('game_over', {
        id: getParameterByName('game'),
        scoreLeft: this.scoreLeft,
        leftStrikeCount: this.leftStrikeCount,
        scoreRight: this.scoreRight,
        rightStrikeCount: this.rightStrikeCount
      });
    }
  },

  startGame: function () {
    game.input.onDown.remove(this.startCountdown, this);
    if (localStorage.getItem('muted') === 'true') {
      game.sound.mute = true;
    } else {
      game.sound.mute = false;
    }
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
      this.ballSprite.body.velocity.x = 0;
      this.ballSprite.body.velocity.y = 0;
      game.time.events.add(Phaser.Timer.SECOND * gameProperties.ballStartDelay, this.startBall, this);
    } else {
      this.ballSprite.visible = false;
      this.ballSprite.body.velocity.x = 0;
      this.ballSprite.body.velocity.y = 0;
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
          buttonPressed ++;
          this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_down.isDown || this.y < game.input.y) {
          buttonPressed ++;
          this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
          this.paddleLeftSprite.body.velocity.y = 0;
        }

        if (this.paddleLeftSprite.body.y < gameProperties.paddleTopGap) {
          this.paddleLeftSprite.body.y = gameProperties.paddleTopGap;
        }
        if (this.paddleLeftSprite.body.y + this.paddleLeftSprite.height > gameProperties.screenHeight) {
          this.paddleLeftSprite.body.y = gameProperties.screenHeight - this.paddleLeftSprite.height;
        }
        if (!computer) {
          socket.emit('move_paddle', {
            id: getParameterByName('game'),
            side: 'left',
            velocity: this.paddleLeftSprite.body.velocity.y,
            y: this.paddleLeftSprite.body.y + this.paddleLeftSprite.body.height / 2,
            time: Date.now()
          });
        }
      }
      if (computer && this.side === 'white') {
        if (direction === 'up') {
          this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity * 0.6;
        }
        else if (direction === 'down') {
          this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity * 0.6;
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
          buttonPressed ++;
          this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
        }
        else if (this.paddleRight_down.isDown || this.y < game.input.y) {
          buttonPressed ++;
          this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
        } else {
          this.paddleRightSprite.body.velocity.y = 0;
        }

        if (this.paddleRightSprite.body.y < gameProperties.paddleTopGap) {
          this.paddleRightSprite.body.y = gameProperties.paddleTopGap;
        }
        if (this.paddleRightSprite.body.y + this.paddleRightSprite.height > gameProperties.screenHeight) {
          this.paddleRightSprite.body.y = gameProperties.screenHeight - this.paddleRightSprite.height;
        }
        if (!computer) {
          socket.emit('move_paddle', {
            id: getParameterByName('game'),
            side: 'right',
            velocity: this.paddleRightSprite.body.velocity.y,
            y: this.paddleRightSprite.body.y + this.paddleRightSprite.body.height / 2,
            time: Date.now()
          });
        }
      }
      if (computer && this.side === 'black') {
        if (direction === 'up') {
          this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity * 0.65;
        }
        else if (direction === 'down') {
          this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity * 0.65;
        } else {
          this.paddleRightSprite.body.velocity.y = 0;
        }

        if (this.paddleRightSprite.body.y < gameProperties.paddleTopGap) {
          this.paddleRightSprite.body.y = gameProperties.paddleTopGap;
        }
      }
    }
  },
  tempLeftStrikeCount: 0,
  tempRightStrikeCount: 0,
  collideWithPaddle: function (ball, paddle) {
    this.sndBallHit.play();
    this.strikeCount++;

    this.lastHitBy = (ball.x < gameProperties.screenWidth * 0.5) ? 0 : 1;
    if (this.lastHitBy === 0) {
      if (this.tempLeftStrikeCount < 10) {
        this.tempLeftStrikeCount++;
      }
    } else {
      if (this.tempRightStrikeCount < 10) {
        this.tempRightStrikeCount++;
      }
    }

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
    if (this.lastHitBy < 0 || this.magicCountdown > 0) {
      this.magicCountdown--;
      return;
    }
    var player = this.players[this.lastHitBy];
    this.generateMagic(player, ball, magicBound);
    // Set probability to call spawnMagicByComputerPlayer()
    if (computer && Math.floor(Math.random() * 4) === 2) {
      this.fireMagicByComputerPlayer();
    }
  },

  generateMagic: function (player, ball, magicBound) {
    var isPlayerMagicFull = player.magic.length === 3;
    if (!isPlayerMagicFull && (isHome || computer)) {
      var randomMagic = Math.floor(Math.random() * 4);
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
      this.updatePlayerMagicUI(player);
    }
    if (!isPlayerMagicFull && isHome && !computer) {
      socket.emit('magic_sync', {
        id: getParameterByName('game'),
        players: this.players,
        evt: 'earned'
      });
    }
  },

  fireMagicByComputerPlayer: function () {
    var cpuSide = this.side === 'white' ? 0 : 1;
    if (this.players[cpuSide].magic.length === 0) {
      return;
    }
    var randomMagicIndex = Math.floor(Math.random() * this.players[cpuSide].magic.length);
    this.processMagic(this.players[cpuSide].magic[randomMagicIndex], cpuSide);
    this.players[cpuSide].magic.splice(randomMagicIndex, 1);
  },

  updatePlayerMagicUI: function (player) {
    var allSpriteClassNames = 'sprite-double-size sprite-shoot sprite-hor-position sprite-ver-position sprite-empty';
    jQuery('#' + player.id + '-player-magic-1').removeClass(allSpriteClassNames).addClass((player.magic[0] !== void 0) ? 'sprite-' + player.magic[0] : 'sprite-empty');
    jQuery('#' + player.id + '-player-magic-2').removeClass(allSpriteClassNames).addClass((player.magic[1] !== void 0) ? 'sprite-' + player.magic[1] : 'sprite-empty');
    jQuery('#' + player.id + '-player-magic-3').removeClass(allSpriteClassNames).addClass((player.magic[2] !== void 0) ? 'sprite-' + player.magic[2] : 'sprite-empty');
  },
  fireCount: 10,

  fireMagic: function (magic) {
    if (this.fireCount > 10 || magic) {
      this.fireCount = 0;
      var side = this.side === 'white' ? 1 : 0;
      if (this.buttonOne.isDown && this.players[side].magic[0] || magic === 1) {
        this.processMagic(this.players[side].magic[0], side);
        this.players[side].magic.splice(0, 1);
        socket.emit('magic_sync', {
          id: getParameterByName('game'),
          players: this.players,
          evt: 'fired'
        });
      }
      if (this.buttonTwo.isDown && this.players[side].magic[1] || magic === 2) {
        this.processMagic(this.players[side].magic[1], side);
        this.players[side].magic.splice(1, 1);
        socket.emit('magic_sync', {
          id: getParameterByName('game'),
          players: this.players,
          evt: 'fired'
        });
      }
      if (this.buttonThree.isDown && this.players[side].magic[2] || magic === 3) {
        this.processMagic(this.players[side].magic[2], side);
        this.players[side].magic.splice(2, 1);
        socket.emit('magic_sync', {
          id: getParameterByName('game'),
          players: this.players,
          evt: 'fired'
        });
      }
      this.updatePlayerMagicUI(this.players[side]);
    } else {
      this.fireCount++;
    }
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

  handleShot: function (side, y) {
    this.shotSound.play();
    if (side === 0) {
      this.bulletLeftSprite = game.add.sprite(gameProperties.paddleLeft_x, y || this.paddleLeftSprite.y, graphicAssets.bulletLeftName);
      game.physics.enable(this.bulletLeftSprite, Phaser.Physics.ARCADE);
      this.bulletLeftSprite.enableBody = true;
      this.bulletLeftSprite.body.velocity.x = 800;
      this.bulletLeftSprite.body.velocity.y = 0;
    }
    if (side === 1) {
      this.bulletRightSprite = game.add.sprite(gameProperties.paddleRight_x, y || this.paddleRightSprite.y, graphicAssets.bulletRightName);
      game.physics.enable(this.bulletRightSprite, Phaser.Physics.ARCADE);
      this.bulletRightSprite.enableBody = true;
      this.bulletRightSprite.body.velocity.x = -800;
      this.bulletRightSprite.body.velocity.y = 0;
    }
  },

  processShot: function (side) {
    this.handleShot(side);
    socket.emit('shot_sync', {
      id: getParameterByName('game'),
      y: this.paddleLeftSprite.y + this.paddleLeftSprite.height / 2,
      side: side,
      myId: userId
    });
  },
  doubleActive: [],
  originalPaddleHeight: 0,
  handleDouble: function (side) {
    this.useMagic.play();
    if (side === 0 && !this.doubleActive[side]) {
      this.paddleLeftSprite.key = graphicAssets.paddleDoubleName;
      this.paddleLeftSprite.loadTexture(graphicAssets.paddleDoubleName, 0);
      this.originalPaddleHeight = this.paddleLeftSprite.height;
      this.paddleLeftSprite.height = 120;
    }
    if (side === 1 && !this.doubleActive[side]) {
      this.paddleRightSprite.key = graphicAssets.paddleDoubleRightName;
      this.paddleRightSprite.loadTexture(graphicAssets.paddleDoubleRightName, 0);
      this.originalPaddleHeight = this.paddleRightSprite.height;
      this.paddleRightSprite.height = 120;
    }
    this.doubleActive[side] = true;
  },
  processDouble: function (side) {
    this.handleDouble(side);
    socket.emit('double_sync', {
      id: getParameterByName('game'),
      side: side,
      myId: userId
    });
  },
  handleHor: function (side) {
    this.useMagic.play();
    this.ballSprite.body.velocity.set(-1 * this.ballSprite.body.velocity.x, -1 * this.ballSprite.body.velocity.y);
  },
  processHor: function (side) {
    this.handleHor(side);
    socket.emit('hor_sync', {
      id: getParameterByName('game'),
      myId: userId
    });
  },
  handleVer: function (side) {
    this.useMagic.play();
    this.ballSprite.body.velocity.set(this.ballSprite.body.velocity.x * 1.25, -1 * this.ballSprite.body.velocity.y);
  },
  processVer: function (side) {
    this.handleVer();
    socket.emit('ver_sync', {
      id: getParameterByName('game'),
      myId: userId
    });
  },
  undoMagics: function () {
    this.undoDouble();
  },
  undoDouble: function () {
    if (this.doubleActive[0]) {
      this.paddleLeftSprite.key = graphicAssets.paddleName;
      this.paddleLeftSprite.loadTexture(graphicAssets.paddleName, 0);
      this.paddleLeftSprite.height = 94;
      this.doubleActive[0] = false;
    }
    if (this.doubleActive[1]) {
      this.paddleRightSprite.key = graphicAssets.paddleRightName;
      this.paddleRightSprite.loadTexture(graphicAssets.paddleRightName, 0);
      this.paddleRightSprite.height = 94;
      this.doubleActive[1] = false;
    }
  },
  submitted: false,
  ballOutOfBounds: function () {
    this.lastHitBy = -1;
    this.sndBallMissed.play();
    this.undoMagics();
    if (isHome) {
      socket.emit('outofbounds', {
        id: getParameterByName('game')
      });
    }
    socket.emit('singleOut', {
      userId: userId,
      sync: window.sync
    });
    if (isHome || computer) {
      if (this.ballSprite.x < 0) {
        this.missedSide = 'left';
        this.scoreRight++;
        this.rightStrikeCount += this.tempRightStrikeCount;
        this.tempLeftStrikeCount = 0;
        this.tempRightStrikeCount = 0;
      } else if (this.ballSprite.x > gameProperties.screenWidth) {
        this.missedSide = 'right';
        this.scoreLeft++;
        this.leftStrikeCount += this.tempLeftStrikeCount;
        this.tempLeftStrikeCount = 0;
        this.tempRightStrikeCount = 0;
      }

      this.updateScoreTextFields();
      if (!computer) {
        socket.emit('relevant_score', {
          id: getParameterByName('game'),
          scoreLeft: this.scoreLeft,
          leftStrikeCount: this.leftStrikeCount,
          scoreRight: this.scoreRight,
          rightStrikeCount: this.rightStrikeCount
        });
      }
    }

    if (this.scoreLeft >= gameProperties.scoreToWin) {
      // If host is black player means he's won
      if (isHome) {
        if (!this.submitted) {
          this.submitted = true;
          var winner = {
            id: this.side === 'black' ? userId : opponent ? opponent : localStorage.getItem('opponentId'),
            points: this.leftStrikeCount + 3 * this.scoreLeft,
            goalCount: this.scoreLeft,
            pointsLoser: this.scoreRight,
            loserId: this.side === 'black' ? (opponent ? opponent : localStorage.getItem('opponentId')) : userId,
            side: 'black',
            timeFinished: new Date().toLocaleString(),
            pressCount: buttonPressed,
            verify: verify
          };
          socket.emit('winner', winner);
          buttonPressed = 0;
        }
      } else if (computer && this.side === 'black') {
        if (!this.submitted) {
          this.submitted = true;
          var winnerWhite = {
            id: userId,
            points: this.leftStrikeCount + 3 * this.scoreLeft,
            goalCount: this.scoreLeft,
            pointsLoser: this.scoreRight,
            loserId: 'computer',
            side: 'black',
            timeFinished: new Date().toLocaleString(),
            pressCount: buttonPressed,
            verify: verify
          };
          socket.emit('winner', winnerWhite);
          buttonPressed = 0;
        }
      }
      this.gameOver();
    } else if (this.scoreRight >= gameProperties.scoreToWin) {
      // If host is black player, means guest has won
      if (isHome) {
        socket.emit('winner', {
          id: this.side === 'black' ? (opponent ? opponent : localStorage.getItem('opponentId')) : userId,
          points: this.rightStrikeCount + 3 * this.scoreRight,
          goalCount: this.scoreRight,
          pointsLoser: this.scoreLeft,
          loserId: this.side === 'black' ? userId : (opponent ? opponent : localStorage.getItem('opponentId')),
          side: 'white',
          timeFinished: new Date().toLocaleString(),
          pressCount: buttonPressed,
          verify: verify
        });
        buttonPressed = 0;
      } else if (computer && this.side === 'white') {
        socket.emit('winner', {
          id: userId,
          points: this.rightStrikeCount + 3 * this.scoreRight,
          goalCount: this.scoreRight,
          pointsLoser: this.scoreLeft,
          loserId: 'computer',
          side: 'white',
          timeFinished: new Date().toLocaleString(),
          pressCount: buttonPressed,
          verify: verify
        });
        buttonPressed = 0;
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
    var pts = this.scoreLeft * 3 + this.leftStrikeCount;
    while (pts.toString().length < 5) {
      pts = '0' + pts;
    }
    jQuery('#left-score-go').html(this.scoreLeft);
    $('#left-points').html(pts);
    $('#left-points-go').html(pts);
    //this.tf_scoreRight.text = this.scoreRight;
    jQuery('#right-score').html(this.scoreRight);
    var ptsr = this.scoreRight * 3 + this.rightStrikeCount;
    while (ptsr.toString().length < 5) {
      ptsr = '0' + ptsr;
    }
    jQuery('#right-points').html(ptsr);
    jQuery('#right-points-go').html(ptsr);
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