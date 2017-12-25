"use strict";var t=0;var e=function(){if(localStorage.getItem("muted")==="true"){p.sound.mute=true}};function getParameterByName(t,e){if(!e)e=window.location.href;t=t.replace(/[\[\]]/g,"\\$&");var i=new RegExp("[?&]"+t+"(=([^&#]*)|&|#|$)"),s=i.exec(e);if(!s)return null;if(!s[2])return"";return decodeURIComponent(s[2].replace(/\+/g," "))}var i=function(){var t=localStorage.getItem("muted");var e;if(t==="true"){e=true}else{e=false}if(p){p.sound.mute=!e}localStorage.setItem("muted",(!e).toString());if(!e){$(".sound-off-wrapper").addClass("active");$(".sound-on-wrapper").removeClass("active")}else{$(".sound-on-wrapper").addClass("active");$(".sound-off-wrapper").removeClass("active")}};var s={screenWidth:800,screenHeight:400,dashSize:5,paddleLeft_x:30,paddleRight_x:770,paddleVelocity:600,paddleSegmentsMax:8,paddleSegmentHeight:2,paddleSegmentAngle:8,paddleTopGap:0,ballVelocity:600,ballRandomStartingAngleLeft:[-120,120],ballRandomStartingAngleRight:[-60,60],ballStartDelay:2,ballVelocityIncrement:40,ballReturnCount:4,scoreToWin:6};var a={ballURL:"assets/ball-15.png",ballName:"ball",paddleURL:"assets/left-45.png",paddleDoubleURL:"assets/left-90.png",paddleName:"paddle_left",paddleDoubleName:"double_paddle_left",paddleRightURL:"assets/right-45.png",paddleRightDoubleUrl:"assets/right-90.png",paddleRightName:"paddle_right",paddleDoubleRightName:"double_paddle_right",yellowBorder:"assets/yellow-border.png",yellowBorderName:"yellowBorder",redBorder:"assets/red-border.png",redBorderName:"redBorder",bulletLeftUrl:"/assets/bullet-left-50.png",bulletLeftName:"bulletLeft",bulletRightUrl:"/assets/bullet-right-50.png",bulletRightName:"bulletRight"};var l={ballBounceURL:"assets/audio/menu",ballBounceName:"ballBounce",ballHitURL:"assets/audio/menu",ballHitName:"ballHit",ballMissedURL:"assets/ballMissed",ballMissedName:"ballMissed",shotUrl:"assets/audio/shot",shotName:"shot",getMagicUrl:"assets/audio/getmagic",getMagicName:"getMagic",useMagicUrl:"assets/audio/usemagic",useMagicName:"useMagic",mp4URL:".m4a",oggURL:".ogg"};var o={scoreLeft_x:s.screenWidth*.25,scoreRight_x:s.screenWidth*.75,scoreTop_y:10,scoreFontStyle:{font:"80px orbitron",fill:"#FFFFFF",align:"center"},instructionsFontStyle:{font:"16px orbitron",fill:"#FFDF00",align:"center",fontWeight:500},countdownFontStyle:{font:"72px orbitron",fill:"#FFDF00",align:"center",fontWeight:600},getReadyStyle:{font:"28px orbitron",fill:"#FFDF00",align:"center",fontWeight:600}};var r={clickToStart:"STRELICAMA GORE/DOLE POMERAŠ MUNCH, \nBROJEVIMA 1/2/3 ISPALJUJEŠ MAGIJE \n\n OSTVARI 6 BODOVA ZA POBEDU",getReady:"PRIPREMI SE!"};var d=false;var h=0;var n=function(t){this.backgroundGraphics;this.ballSprite;this.paddleLeftSprite;this.paddleRightSprite;this.paddleGroup;this.paddleLeft_up;this.paddleLeft_down;this.paddleRight_up;this.paddleRight_down;this.missedSide;this.scoreLeft;this.scoreRight;this.timer;this.timerEvent;this.sndBallHit;this.sndBallBounce;this.sndBallMissed;this.instructions;this.ballVelocity;this.lastHitBy=-1;this.players=[{id:"left",color:"black",magic:[]},{id:"right",color:"white",magic:[]}]};function handleIncorrect(){if(!p.device.desktop){document.getElementById("turn").style.display="flex"}}function handleCorrect(){if(!p.device.desktop){document.getElementById("turn").style.display="none"}}n.prototype={preload:function(){this.strikeCount=0;this.leftStrikeCount=0;this.rightStrikeCount=0;this.bulletLeftSprite=null;this.bulletRightSprite=null;p.scale.forceOrientation(true,false);p.scale.enterIncorrectOrientation.add(handleIncorrect);p.scale.leaveIncorrectOrientation.add(handleCorrect);p.load.image(a.ballName,a.ballURL);p.load.image(a.paddleName,a.paddleURL);p.load.image(a.paddleDoubleName,a.paddleDoubleURL);p.load.image(a.paddleRightName,a.paddleRightURL);p.load.image(a.paddleDoubleRightName,a.paddleRightDoubleUrl);p.load.image(a.yellowBorderName,a.yellowBorder);p.load.image(a.redBorderName,a.redBorder);p.load.image(a.bulletLeftName,a.bulletLeftUrl);p.load.image(a.bulletRightName,a.bulletRightUrl);e();this.scale.scaleMode=Phaser.ScaleManager.SHOW_ALL;this.scale.pageAlignHorizontally=true;this.scale.pageAlignVertically=true;p.load.audio(l.ballBounceName,[l.ballBounceURL+l.mp4URL,l.ballBounceURL+l.oggURL]);p.load.audio(l.ballHitName,[l.ballHitURL+l.mp4URL,l.ballHitURL+l.oggURL]);p.load.audio(l.ballMissedName,[l.ballMissedURL+l.mp4URL,l.ballMissedURL+l.oggURL]);p.load.audio(l.ballMissedName,[l.ballMissedURL+l.mp4URL,l.ballMissedURL+l.oggURL]);p.load.audio(l.shotName,[l.shotUrl+l.mp4URL,l.shotUrl+l.oggURL]);p.load.audio(l.useMagicName,[l.useMagicUrl+l.mp4URL,l.useMagicUrl+l.oggURL]);p.load.audio(l.getMagicName,[l.getMagicUrl+l.mp4URL,l.getMagicUrl+l.oggURL])},create:function(){this.y=p.world.centerY;this.initGraphics();this.initPhysics();this.initKeyboard();this.initSounds();this.startDemo();this.drawBorders();this.enablePaddles(true);var t=this;this.cnt=1;this.submitted=false;$("#accept_invite").click(function(){p.state.start("main",true,false)});$("#left-player-magic-1, #right-player-magic-1").click(function(){t.fireMagic(1)});$("#left-player-magic-2, #right-player-magic-2").click(function(){t.fireMagic(2)});$("#left-player-magic-3, #right-player-magic-3").click(function(){t.fireMagic(3)});if(computer){this.side=localStorage.getItem("side");if(!this.side){this.side="black"}this.startCountdown()}else{if(userId===getParameterByName("game")){d=true}socket.on("start_game",function(e){$("#invited_modal").modal("hide");if(d){t.side=e.guestSide==="white"?"black":"white"}else{t.side=e.guestSide}if(e.guestSide==="white"){$("#right-name").html(e.player1.profile.DisplayName);$("#right-name-go").html(e.player1.profile.DisplayName);$("#right-rank").html('<img src="'+getRankIcon(_.find(e.player1.stats.data.Statistics,{StatisticName:"Total Points"})?_.find(e.player1.stats.data.Statistics,{StatisticName:"Total Points"}).Value:0)+'"/>');$("#right-rank-go").html('<img src="'+getRankIcon(_.find(e.player1.stats.data.Statistics,{StatisticName:"Total Points"})?_.find(e.player1.stats.data.Statistics,{StatisticName:"Total Points"}).Value:0)+'"/>');$("#left-name").html(e.player2.profile.DisplayName);$("#left-name-go").html(e.player2.profile.DisplayName);$("#left-rank").html('<img src="'+getRankIcon(_.find(e.player2.stats.data.Statistics,{StatisticName:"Total Points"})?_.find(e.player2.stats.data.Statistics,{StatisticName:"Total Points"}).Value:0)+'"/>');$("#left-rank-go").html('<img src="'+getRankIcon(_.find(e.player2.stats.data.Statistics,{StatisticName:"Total Points"})?_.find(e.player2.stats.data.Statistics,{StatisticName:"Total Points"}).Value:0)+'"/>')}else{$("#right-name").html(e.player2.profile.DisplayName);$("#right-name-go").html(e.player2.profile.DisplayName);$("#right-rank").html('<img src="'+getRankIcon(_.find(e.player2.stats.data.Statistics,{StatisticName:"Total Points"})?_.find(e.player2.stats.data.Statistics,{StatisticName:"Total Points"}).Value:0)+'"/>');$("#right-rank-go").html('<img src="'+getRankIcon(_.find(e.player2.stats.data.Statistics,{StatisticName:"Total Points"})?_.find(e.player2.stats.data.Statistics,{StatisticName:"Total Points"}).Value:0)+'"/>');$("#left-name").html(e.player1.profile.DisplayName);$("#left-name-go").html(e.player1.profile.DisplayName);$("#left-rank").html('<img src="'+getRankIcon(_.find(e.player1.stats.data.Statistics,{StatisticName:"Total Points"})?_.find(e.player1.stats.data.Statistics,{StatisticName:"Total Points"}).Value:0)+'"/>');$("#left-rank-go").html('<img src="'+getRankIcon(_.find(e.player1.stats.data.Statistics,{StatisticName:"Total Points"})?_.find(e.player1.stats.data.Statistics,{StatisticName:"Total Points"}).Value:0)+'"/>')}t.startCountdown()})}socket.on("update_state",function(e){this.lastUpdate=Date.now();if(!t.syncData.time||t.syncData.time<=e.time&&e.ball.visible){t.syncData=e}});socket.on("score",function(e){t.scoreLeft=e.scoreLeft;t.scoreRight=e.scoreRight;t.leftStrikeCount=e.leftStrikeCount;t.rightStrikeCount=e.rightStrikeCount;t.updateScoreTextFields()});socket.on("magic",function(e){t.players=e.players;t.updatePlayerMagicUI(t.players[0]);t.updatePlayerMagicUI(t.players[1])});socket.on("sync_shot",function(e){if(e.myId!==userId){t.handleShot(e.side,e.y)}});socket.on("sync_hor",function(e){if(e.myId!==userId){t.handleHor(false)}});socket.on("sync_ver",function(e){if(e.myId!==userId){t.handleVer(false)}});socket.on("sync_double",function(e){if(e.myId!==userId){t.handleDouble(e.side)}});if(!d){socket.on("gameover",function(e){t.ballSprite.reset(p.world.centerX,p.world.centerY);t.ballSprite.kill();$("#game-over").show();p.sound.stopAll();t.enablePaddles(false);t.enableBoundaries(true);$(".hide-on-go span").hide();t.resetBall()});socket.on("outOfBounds",function(){t.ballOutOfBounds()})}},shotRight:function(){var t=p.time.create(false);var e=this;this.blockRightPaddle=true;t.loop(3e3,function(){e.blockRightPaddle=false},this);t.start();this.bulletLeftSprite.kill()},shotLeft:function(){var t=p.time.create(false);var e=this;this.blockLeftPaddle=true;t.loop(3e3,function(){e.blockLeftPaddle=false},this);t.start();this.bulletRightSprite.kill()},leftOutBounds:function(){this.bulletLeftSprite.destroy()},rightOutBounds:function(){this.bulletRightSprite.destroy()},lastBallUpdate:0,syncData:{},lastUpdate:0,updateState:function(){this.lastUpdate=Date.now();if(this.syncData){if(this.side==="white"&&this.syncData.paddle&&this.syncData.paddle["left"]&&this.syncData.paddle["left"].y){this.paddleLeftSprite.body.velocity.y=this.syncData.paddle["left"].velocity;this.paddleLeftSprite.y=this.syncData.paddle["left"].y}if(this.side==="black"&&this.syncData.paddle&&this.syncData.paddle["right"]&&this.syncData.paddle["right"].y){this.paddleRightSprite.body.velocity.y=this.syncData.paddle["right"].velocity;this.paddleRightSprite.y=this.syncData.paddle["right"].y}if(this.syncData&&this.syncData.ball&&!d&&this.syncData.ball.x){this.ballSprite.visible=this.syncData.ball.visible;p.add.tween(this.ballSprite).to({x:this.syncData.ball.x+this.ballSprite.width/2,y:this.syncData.ball.y+this.ballSprite.height/2},22,Phaser.Easing.Linear.None,true,0)}}},update:function(){this.updateState();this.moveLeftPaddle();this.moveRightPaddle();this.fireMagic();this.y=p.input.y;p.physics.arcade.overlap(this.ballSprite,this.paddleGroup,this.collideWithPaddle,null,this);p.physics.arcade.overlap(this.ballSprite,this.centerBottomBorder,this.collideWithMagicBounds,null,this);p.physics.arcade.overlap(this.ballSprite,this.centerTopBorder,this.collideWithMagicBounds,null,this);if(this.bulletRightSprite){this.bulletRightSprite.events.onOutOfBounds.add(this.rightOutBounds,this);p.physics.arcade.overlap(this.bulletRightSprite,this.paddleLeftSprite,this.shotLeft,null,this)}if(this.bulletLeftSprite){this.bulletLeftSprite.events.onOutOfBounds.add(this.leftOutBounds,this);p.physics.arcade.overlap(this.bulletLeftSprite,this.paddleRightSprite,this.shotRight,null,this)}if(this.ballSprite.body.blocked.up||this.ballSprite.body.blocked.down||this.ballSprite.body.blocked.left||this.ballSprite.body.blocked.right){this.sndBallBounce.play()}var t=this;if(d&&!computer){socket.emit("ball_position",{id:getParameterByName("game"),x:this.ballSprite.body.x,y:this.ballSprite.body.y,velocityX:this.ballSprite.body.velocity.x,velocityY:this.ballSprite.body.velocity.y,visible:this.ballSprite.visible,time:Date.now()})}if(computer){var e=this.ballSprite.body.y;if(this.side==="black"){var i=-(this.paddleRightSprite.body.y+this.paddleRightSprite.body.height/2-e)}else if(this.side==="white"){var i=-(this.paddleLeftSprite.body.y+this.paddleLeftSprite.body.height/2-e)}if(i>10){if(this.side==="black"){this.moveRightPaddle("down")}else if(this.side==="white"){this.moveLeftPaddle("down")}}else if(i<-10){if(this.side==="black"){this.moveRightPaddle("up")}else if(this.side==="white"){this.moveLeftPaddle("up")}}}},drawBorders:function(){this.borderGroup=p.add.group();this.borderGroup.enableBody=true;this.borderGroup.physicsBodyType=Phaser.Physics.ARCADE;this.leftTopBorder=p.add.sprite(0,0,a.yellowBorderName);this.leftTopBorder.anchor.set(0,0);this.rightTopBorder=p.add.sprite(p.world.width,0,a.yellowBorderName);this.rightTopBorder.anchor.set(0,0);this.leftBottomBorder=p.add.sprite(0,400,a.yellowBorderName);this.leftBottomBorder.anchor.set(0,1);this.rightBottomBorder=p.add.sprite(p.world.width,400,a.yellowBorderName);this.rightBottomBorder.anchor.set(0,1);this.centerBottomBorder=p.add.sprite(p.world.centerX,400,a.redBorderName);this.centerBottomBorder.anchor.set(.5,1);this.centerTopBorder=p.add.sprite(p.world.centerX,0,a.redBorderName);this.centerTopBorder.anchor.set(.5,0);this.borderGroup.add(this.leftTopBorder);this.borderGroup.add(this.leftBottomBorder);this.borderGroup.add(this.rightTopBorder);this.borderGroup.add(this.rightBottomBorder);this.borderGroup.add(this.centerBottomBorder);this.borderGroup.add(this.centerTopBorder);this.borderGroup.setAll("checkWorldBounds",true);this.borderGroup.setAll("body.collideWorldBounds",true);this.borderGroup.setAll("body.immovable",true)},initGraphics:function(){this.backgroundGraphics=p.add.graphics(0,0);this.backgroundGraphics.lineStyle(2,16777215,1);this.ballSprite=p.add.sprite(p.world.centerX,p.world.centerY,a.ballName);this.ballSprite.anchor.set(.5,.5);this.paddleLeftSprite=p.add.sprite(s.paddleLeft_x,p.world.centerY,a.paddleName);this.paddleLeftSprite.anchor.set(.5,.5);this.paddleRightSprite=p.add.sprite(s.paddleRight_x,p.world.centerY,a.paddleRightName);this.paddleRightSprite.anchor.set(.5,.5);this.instructions=p.add.text(p.world.centerX,p.world.height-20,r.clickToStart,o.instructionsFontStyle);this.instructions.addColor("#FFFFFF",11);this.instructions.addColor("#FFDF00",15);this.instructions.addColor("#FFFFFF",16);this.instructions.addColor("#FFDF00",20);this.instructions.addColor("#FFFFFF",46);this.instructions.addColor("#FFDF00",47);this.instructions.addColor("#FFFFFF",48);this.instructions.addColor("#FFDF00",49);this.instructions.addColor("#FFFFFF",50);this.instructions.addColor("#FFDF00",51);this.instructions.anchor.set(.5,1);this.hideTextFields()},startCountdown:function(){$("#game-over").hide();this.timer=p.time.create();this.countdownText=p.add.text(p.world.centerX,p.world.centerY,"3",o.countdownFontStyle);this.getReady=p.add.text(p.world.centerX,60,r.getReady,o.getReadyStyle);this.getReady.anchor.set(.5,.5);this.countdownText.anchor.set(.5,.5);this.timerEvent=this.timer.add(Phaser.Timer.SECOND*3,this.endTimer,this);this.timer.start()},endTimer:function(){this.timer.stop();this.countdownText.destroy();this.getReady.visible=false;this.startGame()},render:function(){if(this.timer&&this.timer.running){this.countdownText.setText(this.formatTime(Math.round((this.timerEvent.delay-this.timer.ms)/1e3)),2,14,"#ff0")}},formatTime:function(t){var e="0"+Math.floor(t/60);var i=t-e*60;return i.toString().substr(-2)},initPhysics:function(){p.physics.startSystem(Phaser.Physics.ARCADE);p.physics.enable(this.ballSprite,Phaser.Physics.ARCADE);this.ballSprite.checkWorldBounds=true;this.ballSprite.body.collideWorldBounds=true;this.ballSprite.body.immovable=true;this.ballSprite.body.bounce.set(1);this.ballSprite.events.onOutOfBounds.add(this.ballOutOfBounds,this);this.paddleGroup=p.add.group();this.paddleGroup.enableBody=true;this.paddleGroup.physicsBodyType=Phaser.Physics.ARCADE;this.paddleGroup.add(this.paddleLeftSprite);this.paddleGroup.add(this.paddleRightSprite);this.paddleGroup.setAll("checkWorldBounds",true);this.paddleGroup.setAll("body.collideWorldBounds",true);this.paddleGroup.setAll("body.immovable",true)},initKeyboard:function(){this.paddleLeft_up=p.input.keyboard.addKey(Phaser.Keyboard.A);this.paddleLeft_down=p.input.keyboard.addKey(Phaser.Keyboard.Z);this.buttonOne=p.input.keyboard.addKey(Phaser.Keyboard.ONE);this.buttonTwo=p.input.keyboard.addKey(Phaser.Keyboard.TWO);this.buttonThree=p.input.keyboard.addKey(Phaser.Keyboard.THREE);this.paddleRight_up=p.input.keyboard.addKey(Phaser.Keyboard.UP);this.paddleRight_down=p.input.keyboard.addKey(Phaser.Keyboard.DOWN)},initSounds:function(){this.sndBallHit=p.add.audio(l.ballHitName);this.sndBallBounce=p.add.audio(l.ballBounceName);this.sndBallMissed=p.add.audio(l.ballMissedName);this.shotSound=p.add.audio(l.shotName);this.getMagic=p.add.audio(l.getMagicName);this.useMagic=p.add.audio(l.useMagicName)},startDemo:function(){this.ballSprite.reset(p.world.centerX,p.rnd.between(0,s.screenHeight));this.ballSprite.visible=false;this.ballSprite.body.velocity.x=0;this.ballSprite.body.velocity.y=0;this.enablePaddles(false);this.enableBoundaries(true);this.instructions.visible=true},gameOver:function(){$("#game-over").show();p.sound.stopAll();this.ballSprite.reset(p.world.centerX,p.rnd.between(0,s.screenHeight));this.ballSprite.visible=false;this.ballSprite.body.velocity.x=0;this.ballSprite.body.velocity.y=0;this.enablePaddles(false);this.enableBoundaries(true);$(".hide-on-go span").hide();if(d){socket.emit("game_over",{id:getParameterByName("game"),scoreLeft:this.scoreLeft,leftStrikeCount:this.leftStrikeCount,scoreRight:this.scoreRight,rightStrikeCount:this.rightStrikeCount})}},startGame:function(){p.input.onDown.remove(this.startCountdown,this);if(localStorage.getItem("muted")==="true"){p.sound.mute=true}else{p.sound.mute=false}this.enablePaddles(true);this.enableBoundaries(false);this.resetBall();this.resetScores();this.hideTextFields()},startBall:function(){this.ballVelocity=s.ballVelocity;this.ballReturnCount=0;this.ballSprite.visible=true;if(d||computer){var t=p.rnd.pick(s.ballRandomStartingAngleRight.concat(s.ballRandomStartingAngleLeft));if(this.missedSide=="right"){t=p.rnd.pick(s.ballRandomStartingAngleRight)}else if(this.missedSide=="left"){t=p.rnd.pick(s.ballRandomStartingAngleLeft)}p.physics.arcade.velocityFromAngle(t,s.ballVelocity,this.ballSprite.body.velocity)}},resetBall:function(){if(d||computer){this.ballSprite.reset(p.world.centerX,p.rnd.between(0,s.screenHeight));this.ballSprite.visible=false;this.ballSprite.body.velocity.x=0;this.ballSprite.body.velocity.y=0;p.time.events.add(Phaser.Timer.SECOND*s.ballStartDelay,this.startBall,this)}else{this.ballSprite.visible=false;this.ballSprite.body.velocity.x=0;this.ballSprite.body.velocity.y=0}},enablePaddles:function(t){this.paddleGroup.setAll("visible",t);this.paddleGroup.setAll("body.enable",t);this.paddleLeft_up.enabled=t;this.paddleLeft_down.enabled=t;this.paddleRight_up.enabled=t;this.paddleRight_down.enabled=t;this.paddleLeftSprite.y=p.world.centerY;this.paddleRightSprite.y=p.world.centerY},enableBoundaries:function(t){p.physics.arcade.checkCollision.left=t;p.physics.arcade.checkCollision.right=t},moveLeftPaddle:function(t){var t=t||null;if(!this.blockLeftPaddle){if(this.side==="black"){if(this.paddleRight_up.isDown||this.y>p.input.y){h++;this.paddleLeftSprite.body.velocity.y=-s.paddleVelocity}else if(this.paddleRight_down.isDown||this.y<p.input.y){h++;this.paddleLeftSprite.body.velocity.y=s.paddleVelocity}else{this.paddleLeftSprite.body.velocity.y=0}if(this.paddleLeftSprite.body.y<s.paddleTopGap){this.paddleLeftSprite.body.y=s.paddleTopGap}if(this.paddleLeftSprite.body.y+this.paddleLeftSprite.height>s.screenHeight){this.paddleLeftSprite.body.y=s.screenHeight-this.paddleLeftSprite.height}if(!computer){socket.emit("move_paddle",{id:getParameterByName("game"),side:"left",velocity:this.paddleLeftSprite.body.velocity.y,y:this.paddleLeftSprite.body.y+this.paddleLeftSprite.body.height/2,time:Date.now()})}}if(computer&&this.side==="white"){if(t==="up"){this.paddleLeftSprite.body.velocity.y=-s.paddleVelocity*.6}else if(t==="down"){this.paddleLeftSprite.body.velocity.y=s.paddleVelocity*.6}else{this.paddleLeftSprite.body.velocity.y=0}if(this.paddleLeftSprite.body.y<s.paddleTopGap){this.paddleLeftSprite.body.y=s.paddleTopGap}}}},moveRightPaddle:function(t){var t=t||null;if(!this.blockRightPaddle){if(this.side==="white"){if(this.paddleRight_up.isDown||this.y>p.input.y){h++;this.paddleRightSprite.body.velocity.y=-s.paddleVelocity}else if(this.paddleRight_down.isDown||this.y<p.input.y){h++;this.paddleRightSprite.body.velocity.y=s.paddleVelocity}else{this.paddleRightSprite.body.velocity.y=0}if(this.paddleRightSprite.body.y<s.paddleTopGap){this.paddleRightSprite.body.y=s.paddleTopGap}if(this.paddleRightSprite.body.y+this.paddleRightSprite.height>s.screenHeight){this.paddleRightSprite.body.y=s.screenHeight-this.paddleRightSprite.height}if(!computer){socket.emit("move_paddle",{id:getParameterByName("game"),side:"right",velocity:this.paddleRightSprite.body.velocity.y,y:this.paddleRightSprite.body.y+this.paddleRightSprite.body.height/2,time:Date.now()})}}if(computer&&this.side==="black"){if(t==="up"){this.paddleRightSprite.body.velocity.y=-s.paddleVelocity*.65}else if(t==="down"){this.paddleRightSprite.body.velocity.y=s.paddleVelocity*.65}else{this.paddleRightSprite.body.velocity.y=0}if(this.paddleRightSprite.body.y<s.paddleTopGap){this.paddleRightSprite.body.y=s.paddleTopGap}}}},tempLeftStrikeCount:0,tempRightStrikeCount:0,collideWithPaddle:function(t,e){this.sndBallHit.play();this.strikeCount++;this.lastHitBy=t.x<s.screenWidth*.5?0:1;if(this.lastHitBy===0){if(this.tempLeftStrikeCount<10){this.tempLeftStrikeCount++}}else{if(this.tempRightStrikeCount<10){this.tempRightStrikeCount++}}var i;var a=Math.floor((t.y-e.y)/s.paddleSegmentHeight);if(a>=s.paddleSegmentsMax){a=s.paddleSegmentsMax-1}else if(a<=-s.paddleSegmentsMax){a=-(s.paddleSegmentsMax-1)}if(e.x<s.screenWidth*.5){i=a*s.paddleSegmentAngle;p.physics.arcade.velocityFromAngle(i,this.ballVelocity,this.ballSprite.body.velocity)}else{i=180-a*s.paddleSegmentAngle;if(i>180){i-=360}p.physics.arcade.velocityFromAngle(i,this.ballVelocity,this.ballSprite.body.velocity)}this.ballReturnCount++;if(this.ballReturnCount>=s.ballReturnCount){this.ballReturnCount=0;this.ballVelocity+=s.ballVelocityIncrement}},collideWithMagicBounds:function(t,e){if(this.lastHitBy<0||this.magicCountdown>0){this.magicCountdown--;return}var i=this.players[this.lastHitBy];this.generateMagic(i,t,e);if(computer&&Math.floor(Math.random()*4)===2){this.fireMagicByComputerPlayer()}},generateMagic:function(t,e,i){var s=t.magic.length===3;if(!s&&(d||computer)){var a=Math.floor(Math.random()*4);switch(a){case 0:t.magic.push("shoot");break;case 1:t.magic.push("double-size");break;case 2:t.magic.push("hor-position");break;case 3:t.magic.push("ver-position");break}this.getMagic.play();this.magicCountdown=1;this.updatePlayerMagicUI(t)}if(!s&&d&&!computer){socket.emit("magic_sync",{id:getParameterByName("game"),players:this.players,evt:"earned"})}},fireMagicByComputerPlayer:function(){var t=this.side==="white"?0:1;if(this.players[t].magic.length===0){return}var e=Math.floor(Math.random()*this.players[t].magic.length);this.processMagic(this.players[t].magic[e],t);this.players[t].magic.splice(e,1)},updatePlayerMagicUI:function(t){var e="sprite-double-size sprite-shoot sprite-hor-position sprite-ver-position sprite-empty";jQuery("#"+t.id+"-player-magic-1").removeClass(e).addClass(t.magic[0]!==void 0?"sprite-"+t.magic[0]:"sprite-empty");jQuery("#"+t.id+"-player-magic-2").removeClass(e).addClass(t.magic[1]!==void 0?"sprite-"+t.magic[1]:"sprite-empty");jQuery("#"+t.id+"-player-magic-3").removeClass(e).addClass(t.magic[2]!==void 0?"sprite-"+t.magic[2]:"sprite-empty")},fireCount:10,fireMagic:function(t){if(this.fireCount>10||t){this.fireCount=0;var e=this.side==="white"?1:0;if(this.buttonOne.isDown&&this.players[e].magic[0]||t===1){this.processMagic(this.players[e].magic[0],e);this.players[e].magic.splice(0,1);socket.emit("magic_sync",{id:getParameterByName("game"),players:this.players,evt:"fired"})}if(this.buttonTwo.isDown&&this.players[e].magic[1]||t===2){this.processMagic(this.players[e].magic[1],e);this.players[e].magic.splice(1,1);socket.emit("magic_sync",{id:getParameterByName("game"),players:this.players,evt:"fired"})}if(this.buttonThree.isDown&&this.players[e].magic[2]||t===3){this.processMagic(this.players[e].magic[2],e);this.players[e].magic.splice(2,1);socket.emit("magic_sync",{id:getParameterByName("game"),players:this.players,evt:"fired"})}this.updatePlayerMagicUI(this.players[e])}else{this.fireCount++}},processMagic:function(t,e){switch(t){case"shoot":this.processShot(e);break;case"double-size":this.processDouble(e);break;case"hor-position":this.processHor(e);break;case"ver-position":this.processVer(e);break}},handleShot:function(t,e){this.shotSound.play();if(t===0){this.bulletLeftSprite=p.add.sprite(s.paddleLeft_x,e||this.paddleLeftSprite.y,a.bulletLeftName);p.physics.enable(this.bulletLeftSprite,Phaser.Physics.ARCADE);this.bulletLeftSprite.enableBody=true;this.bulletLeftSprite.body.velocity.x=800;this.bulletLeftSprite.body.velocity.y=0}if(t===1){this.bulletRightSprite=p.add.sprite(s.paddleRight_x,e||this.paddleRightSprite.y,a.bulletRightName);p.physics.enable(this.bulletRightSprite,Phaser.Physics.ARCADE);this.bulletRightSprite.enableBody=true;this.bulletRightSprite.body.velocity.x=-800;this.bulletRightSprite.body.velocity.y=0}},processShot:function(t){this.handleShot(t);socket.emit("shot_sync",{id:getParameterByName("game"),y:this.paddleLeftSprite.y+this.paddleLeftSprite.height/2,side:t,myId:userId})},doubleActive:[],originalPaddleHeight:0,handleDouble:function(t){this.useMagic.play();if(t===0&&!this.doubleActive[t]){this.paddleLeftSprite.key=a.paddleDoubleName;this.paddleLeftSprite.loadTexture(a.paddleDoubleName,0);this.originalPaddleHeight=this.paddleLeftSprite.height;this.paddleLeftSprite.height=120}if(t===1&&!this.doubleActive[t]){this.paddleRightSprite.key=a.paddleDoubleRightName;this.paddleRightSprite.loadTexture(a.paddleDoubleRightName,0);this.originalPaddleHeight=this.paddleRightSprite.height;this.paddleRightSprite.height=120}this.doubleActive[t]=true},processDouble:function(t){this.handleDouble(t);socket.emit("double_sync",{id:getParameterByName("game"),side:t,myId:userId})},handleHor:function(t){this.useMagic.play();this.ballSprite.body.velocity.set(-1*this.ballSprite.body.velocity.x,-1*this.ballSprite.body.velocity.y)},processHor:function(t){this.handleHor(t);socket.emit("hor_sync",{id:getParameterByName("game"),myId:userId})},handleVer:function(t){this.useMagic.play();this.ballSprite.body.velocity.set(this.ballSprite.body.velocity.x*1.25,-1*this.ballSprite.body.velocity.y)},processVer:function(t){this.handleVer();socket.emit("ver_sync",{id:getParameterByName("game"),myId:userId})},undoMagics:function(){this.undoDouble()},undoDouble:function(){if(this.doubleActive[0]){this.paddleLeftSprite.key=a.paddleName;this.paddleLeftSprite.loadTexture(a.paddleName,0);this.paddleLeftSprite.height=94;this.doubleActive[0]=false}if(this.doubleActive[1]){this.paddleRightSprite.key=a.paddleRightName;this.paddleRightSprite.loadTexture(a.paddleRightName,0);this.paddleRightSprite.height=94;this.doubleActive[1]=false}},submitted:false,ballOutOfBounds:function(){this.lastHitBy=-1;this.sndBallMissed.play();this.undoMagics();if(d){socket.emit("outofbounds",{id:getParameterByName("game")})}socket.emit("singleOut",{userId:userId,sync:window.sync,buttonPress:h});if(d||computer){if(this.ballSprite.x<0){this.missedSide="left";this.scoreRight++;this.rightStrikeCount+=this.tempRightStrikeCount;this.tempLeftStrikeCount=0;this.tempRightStrikeCount=0}else if(this.ballSprite.x>s.screenWidth){this.missedSide="right";this.scoreLeft++;this.leftStrikeCount+=this.tempLeftStrikeCount;this.tempLeftStrikeCount=0;this.tempRightStrikeCount=0}this.updateScoreTextFields();if(!computer){socket.emit("relevant_score",{id:getParameterByName("game"),scoreLeft:this.scoreLeft,leftStrikeCount:this.leftStrikeCount,scoreRight:this.scoreRight,rightStrikeCount:this.rightStrikeCount})}}if(this.scoreLeft>=s.scoreToWin){if(d){if(!this.submitted){this.submitted=true;var t={id:this.side==="black"?userId:opponent?opponent:localStorage.getItem("opponentId"),points:this.leftStrikeCount+3*this.scoreLeft,goalCount:this.scoreLeft,pointsLoser:this.scoreRight,loserId:this.side==="black"?opponent?opponent:localStorage.getItem("opponentId"):userId,side:"black",timeFinished:(new Date).toLocaleString(),pressCount:h,verify:verify};socket.emit("winner",t);h=0}}else if(computer&&this.side==="black"){if(!this.submitted){this.submitted=true;var e={id:userId,points:this.leftStrikeCount+3*this.scoreLeft,goalCount:this.scoreLeft,pointsLoser:this.scoreRight,loserId:"computer",side:"black",timeFinished:(new Date).toLocaleString(),pressCount:h,verify:verify};socket.emit("winner",e);h=0}}this.gameOver()}else if(this.scoreRight>=s.scoreToWin){if(d){socket.emit("winner",{id:this.side==="black"?opponent?opponent:localStorage.getItem("opponentId"):userId,points:this.rightStrikeCount+3*this.scoreRight,goalCount:this.scoreRight,pointsLoser:this.scoreLeft,loserId:this.side==="black"?userId:opponent?opponent:localStorage.getItem("opponentId"),side:"white",timeFinished:(new Date).toLocaleString(),pressCount:h,verify:verify});h=0}else if(computer&&this.side==="white"){socket.emit("winner",{id:userId,points:this.rightStrikeCount+3*this.scoreRight,goalCount:this.scoreRight,pointsLoser:this.scoreLeft,loserId:"computer",side:"white",timeFinished:(new Date).toLocaleString(),pressCount:h,verify:verify});h=0}this.gameOver()}else{this.resetBall()}},resetScores:function(){this.scoreLeft=0;this.scoreRight=0;this.updateScoreTextFields()},updateScoreTextFields:function(){jQuery("#left-score").html(this.scoreLeft);var t=this.scoreLeft*3+this.leftStrikeCount;while(t.toString().length<5){t="0"+t}jQuery("#left-score-go").html(this.scoreLeft);$("#left-points").html(t);$("#left-points-go").html(t);jQuery("#right-score").html(this.scoreRight);var e=this.scoreRight*3+this.rightStrikeCount;while(e.toString().length<5){e="0"+e}jQuery("#right-points").html(e);jQuery("#right-points-go").html(e);jQuery("#right-score-go").html(this.scoreRight)},hideTextFields:function(){this.instructions.visible=false}};if($("#munch-pong").length>0){var p=new Phaser.Game(s.screenWidth,s.screenHeight,Phaser.AUTO,"munch-pong",false,true);p.state.add("main",n);p.state.start("main")}