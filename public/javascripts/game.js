'use strict';
var initializeSound = function () {
  if (localStorage.getItem('muted') === 'true') {
    game.sound.mute = !game.sound.mute;
  }
};

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

  ballVelocity: 500,
  ballRandomStartingAngleLeft: [-120, 120],
  ballRandomStartingAngleRight: [-60, 60],
  ballStartDelay: 2,
  ballVelocityIncrement: 25,
  ballReturnCount: 4,

  scoreToWin: 6,
};

var graphicAssets = {
  ballURL: 'assets/ball-10.png',
  ballName: 'ball',

  paddleURL: 'assets/left-45.png',
  paddleName: 'paddle_left',

  paddleRightURL: 'assets/right-45.png',
  paddleRightName: 'paddle_right',

  yellowBorder: 'assets/yellow-border.png',
  yellowBorderName: 'yellowBorder',
  redBorder: 'assets/red-border.png',
  redBorderName: 'redBorder'
};

var soundAssets = {
  ballBounceURL: 'assets/ballBounce',
  ballBounceName: 'ballBounce',

  ballHitURL: 'assets/ballHit',
  ballHitName: 'ballHit',

  ballMissedURL: 'assets/ballMissed',
  ballMissedName: 'ballMissed',

  mp4URL: '.m4a',
  oggURL: '.ogg',
};

var fontAssets = {
  scoreLeft_x: gameProperties.screenWidth * 0.25,
  scoreRight_x: gameProperties.screenWidth * 0.75,
  scoreTop_y: 10,

  scoreFontStyle: { font: '80px orbitron', fill: '#FFFFFF', align: 'center' },
  instructionsFontStyle: { font: '20px orbitron', fill: '#FFDF00', align: 'center', fontWeight: 600 },
  countdownFontStyle: { font: '30px orbitron', fill: '#FFDF00', align: 'center', fontWeight: 600 },
};

var labels = {
  clickToStart: 'STRELICAMA GORE/DOLE POMERAŠ MUNCH, \nBROJEVIMA 1/2/3 ISPALJUJEŠ MAGIJE \n\n OSTVARI 6 BODOVA ZA POBEDU',
};

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
};

mainState.prototype = {
  preload: function () {
    game.load.image(graphicAssets.ballName, graphicAssets.ballURL);
    game.load.image(graphicAssets.paddleName, graphicAssets.paddleURL);
    game.load.image(graphicAssets.paddleRightName, graphicAssets.paddleRightURL);
    game.load.image(graphicAssets.yellowBorderName, graphicAssets.yellowBorder);
    game.load.image(graphicAssets.redBorderName, graphicAssets.redBorder);
    initializeSound();

    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    game.load.audio(soundAssets.ballBounceName, [soundAssets.ballBounceURL + soundAssets.mp4URL, soundAssets.ballBounceURL + soundAssets.oggURL]);
    game.load.audio(soundAssets.ballHitName, [soundAssets.ballHitURL + soundAssets.mp4URL, soundAssets.ballHitURL + soundAssets.oggURL]);
    game.load.audio(soundAssets.ballMissedName, [soundAssets.ballMissedURL + soundAssets.mp4URL, soundAssets.ballMissedURL + soundAssets.oggURL]);
  },

  create: function () {
    this.initGraphics();
    this.initPhysics();
    this.initKeyboard();
    this.initSounds();
    this.startDemo();
    this.drawBorders();
    //this.startCountdown();
  },

  update: function () {
    this.moveLeftPaddle();
    this.moveRightPaddle();
    game.physics.arcade.overlap(this.ballSprite, this.paddleGroup, this.collideWithPaddle, null, this);

    if (this.ballSprite.body.blocked.up || this.ballSprite.body.blocked.down || this.ballSprite.body.blocked.left || this.ballSprite.body.blocked.right) {
      this.sndBallBounce.play();
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
    var bottomLeft = new Phaser.Rectangle(0, 715, 427, 5);
    var topLeft = new Phaser.Rectangle(0, 0, 427, 5);
    var topCenter = new Phaser.Rectangle(0, 0, 427, 5);
    var bottomCenter = new Phaser.Rectangle(0, 0, 427, 5);
    var topRight = new Phaser.Rectangle(0, 0, 427, 5);
    var bottomRight = new Phaser.Rectangle(0, 0, 427, 5);
  },

  initGraphics: function () {
    this.backgroundGraphics = game.add.graphics(0, 0);
    this.backgroundGraphics.lineStyle(2, 0xFFFFFF, 1);

    for (var y = 0; y < gameProperties.screenHeight; y += gameProperties.dashSize * 2) {
      this.backgroundGraphics.moveTo(game.world.centerX, y);
      this.backgroundGraphics.lineTo(game.world.centerX, y + gameProperties.dashSize);
    }

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

  endTimer: function() {
    // Stop the timer when the delayed event triggers
    this.timer.stop();
    this.countdownText.destroy();
  },

  render: function () {
    if (this.timer && this.timer.running) {
      this.countdownText.setText(this.formatTime(Math.round((this.timerEvent.delay - this.timer.ms) / 1000)), 2, 14, "#ff0");
    }
  },

  formatTime: function(s) {
    // Convert seconds (s) to a nicely formatted and padded time string
    var minutes = "0" + Math.floor(s / 60);
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

    this.paddleLeftSprite.body.checkCollision.up = false;
    this.paddleLeftSprite.body.checkCollision.down = false;
    this.paddleLeftSprite.body.checkCollision.left = false;

    this.paddleRightSprite.body.checkCollision.up = false;
    this.paddleRightSprite.body.checkCollision.down = false;
    this.paddleRightSprite.body.checkCollision.right = false;

    this.paddleGroup.setAll('checkWorldBounds', true);
    this.paddleGroup.setAll('body.collideWorldBounds', true);
    this.paddleGroup.setAll('body.immovable', true);
  },

  initKeyboard: function () {
    this.paddleLeft_up = game.input.keyboard.addKey(Phaser.Keyboard.A);
    this.paddleLeft_down = game.input.keyboard.addKey(Phaser.Keyboard.Z);

    this.paddleRight_up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    this.paddleRight_down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
  },

  initSounds: function () {
    this.sndBallHit = game.add.audio(soundAssets.ballHitName);
    this.sndBallBounce = game.add.audio(soundAssets.ballBounceName);
    this.sndBallMissed = game.add.audio(soundAssets.ballMissedName);
  },

  startDemo: function () {
    this.ballSprite.visible = false;
    this.resetBall();
    this.enablePaddles(false);
    this.enableBoundaries(true);
    game.input.onDown.add(this.startGame, this);

    this.instructions.visible = true;
  },

  startGame: function () {
    game.input.onDown.remove(this.startGame, this);

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

    var randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight.concat(gameProperties.ballRandomStartingAngleLeft));

    if (this.missedSide == 'right') {
      randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleRight);
    } else if (this.missedSide == 'left') {
      randomAngle = game.rnd.pick(gameProperties.ballRandomStartingAngleLeft);
    }

    game.physics.arcade.velocityFromAngle(randomAngle, gameProperties.ballVelocity, this.ballSprite.body.velocity);
  },

  resetBall: function () {
    this.ballSprite.reset(game.world.centerX, game.rnd.between(0, gameProperties.screenHeight));
    this.ballSprite.visible = false;
    game.time.events.add(Phaser.Timer.SECOND * gameProperties.ballStartDelay, this.startBall, this);
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

  moveLeftPaddle: function () {
    if (this.paddleLeft_up.isDown) {
      this.paddleLeftSprite.body.velocity.y = -gameProperties.paddleVelocity;
    }
    else if (this.paddleLeft_down.isDown) {
      this.paddleLeftSprite.body.velocity.y = gameProperties.paddleVelocity;
    } else {
      this.paddleLeftSprite.body.velocity.y = 0;
    }

    if (this.paddleLeftSprite.body.y < gameProperties.paddleTopGap) {
      this.paddleLeftSprite.body.y = gameProperties.paddleTopGap;
    }
  },

  moveRightPaddle: function () {
    if (this.paddleRight_up.isDown) {
      this.paddleRightSprite.body.velocity.y = -gameProperties.paddleVelocity;
    }
    else if (this.paddleRight_down.isDown) {
      this.paddleRightSprite.body.velocity.y = gameProperties.paddleVelocity;
    } else {
      this.paddleRightSprite.body.velocity.y = 0;
    }

    if (this.paddleRightSprite.body.y < gameProperties.paddleTopGap) {
      this.paddleRightSprite.body.y = gameProperties.paddleTopGap;
    }
  },

  collideWithPaddle: function (ball, paddle) {
    this.sndBallHit.play();

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

  ballOutOfBounds: function () {
    this.sndBallMissed.play();

    if (this.ballSprite.x < 0) {
      this.missedSide = 'left';
      this.scoreRight++;
    } else if (this.ballSprite.x > gameProperties.screenWidth) {
      this.missedSide = 'right';
      this.scoreLeft++;
    }

    this.updateScoreTextFields();

    if (this.scoreLeft >= gameProperties.scoreToWin) {
      //this.winnerLeft.visible = true;
      this.startDemo();
    } else if (this.scoreRight >= gameProperties.scoreToWin) {
      //this.winnerRight.visible = true;
      this.startDemo();
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
    //this.tf_scoreRight.text = this.scoreRight;
    jQuery('#right-score').html(this.scoreRight);
  },

  hideTextFields: function () {
    this.instructions.visible = false;
    //this.winnerLeft.visible = false;
    //this.winnerRight.visible = false;
  },
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'munch-pong', false, true);
game.state.add('main', mainState);
game.state.start('main');