import Global from '../global.js';
import CONFIG from '../config.js';



// TECHNICAL VARIABLES
var cursors;
var self;
var socket;
var gameWidth = CONFIG.DEFAULT_WIDTH;
var gameHeight = CONFIG.DEFAULT_HEIGHT;


// GAME VARIABLES
var hero_small_ship_list = [];
var enemy_small_ship_list = [];
var small_ship_rows = CONFIG.DEFAULT_SMALL_SHIP_ROWS;
var small_ship_columns = CONFIG.DEFAULT_SMALL_SHIP_COLUMNS;


var oldPositionX;



// POWER UP VARIABLES 
var powerUpBatteryHostActive = false;
var powerUpBatteryGuestActive = false;
var powerUpBatteryHostCooldown = 5;
var powerUpBatteryGuestCooldown = 5;


var ballUpdater;


var gameOver;
var playerSpeed;


var maxVelocity = 500;
var spawnVelocity = 150;
var ballVelocityY = 150;

var planet_hero;
var planet_enemy;
var health_host = 3;
var health_guest = 3;
var ballVelocityX = 80;
var initialCountdown = 5;
var ballLaunched = false;
var ballCanBeLaunched = false;
var blocks;
var hostServe = false;
var guestServe = false;
var ui_element_countdown;
var ui_element_countdown_list = [];

var power_up_hero;
var power_up_enemy;
var power_up_list = [];
var power_up_counter = 0;

var powerUpList;

var powerUpAtGuestCounter = 0;
var powerUpGuestList = [];
var thunderBallOne;
var thunderBallTwo;
var powerUpThunderActive = false;
var thunderSphere;
var onlyOnce = true;

var pointerLocationX = 0;
var myCharacterSpriteLocationX = 0;

var alphaRot = 0;
var betaRot = 0;
var gammaRot = 0;
var alphaAcc = 0;
var betaAcc = 0;
var gammaAcc = 0;
var gammaRotNeutral = 0;


// GAME OBEJCT VARIABLES
var myCharacterSprite;
var myCharacterConfig = {
  playerID: -1,
  socketID: "empty",
  status: "default",
  positionX: 0,
  positionY: 0,
  isPresent: false,
  isHost: false,
  isGuest: false
};

var enemyCharacterSprite;
var enemyCharacterConfig = {
  playerID: -1,
  socketID: "empty",
  status: "default",
  positionX: 0,
  positionY: 0,
  isPresent: false,
  isHost: false,
  isGuest: false
};

var ballSprite;
var ballConfig = {
  status: "default",
  velocityY: 0,//CONFIG.DEFAULT_VELOCITY_Y_BALL,
  velocityX: 0,//CONFIG.DEFAULT_VELOCITY_X_BALL,
  spawnX: 0,//CONFIG.DEFAULT_SPAWN_X_BALL,
  spawnY: 0,//CONFIG.DEFAULT_SPAWN_Y_BALL,
  positionX: 0,//CONFIG.DEFAULT_SPAWN_X_BALL,
  positionY: 0,//CONFIG.DEFAULT_SPAWN_Y_BALL,
  bounce: 0,//CONFIG.DEFAULT_BOUNCE_BALL,
  isPresent: false
}


export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {

    // Game Element UI

    this.load.image('ui_element_1', 'assets/GameScene/ui_element_1.png')
    this.load.image('ui_element_2', 'assets/GameScene/ui_element_2.png')
    this.load.image('ui_element_3', 'assets/GameScene/ui_element_3.png')
    this.load.image('ui_element_begin', 'assets/GameScene/ui_element_begin.png')

    // Game Assets

    this.load.image('energy_sphere_basic', 'assets/GameScene/energy_sphere_basic.png')
    this.load.image('energy_sphere_thunder', 'assets/GameScene/energy_sphere_thunder.png')
    this.load.image('background', 'assets/Background/background.png')

    this.load.image('ship_large_blue', 'assets/GameScene/ship_large_blue_half_shield.png')
    this.load.image('ship_large_blue_ftl_mode', 'assets/GameScene/ship_large_blue_half_shield_ftl_mode.png')
    this.load.image('ship_small_blue', 'assets/GameScene/ship_small_blue.png')
    this.load.image('ship_large_red', 'assets/GameScene/ship_large_red_half_shield.png')
    this.load.image('ship_large_red_ftl_mode', 'assets/GameScene/ship_large_red_half_shield_ftl_mode.png')
    this.load.image('ship_small_red', 'assets/GameScene/ship_small_red.png')

    this.load.image('planet_enemy_stage_0', 'assets/GameScene/planet_enemy_stage_0.png')
    this.load.image('planet_enemy_stage_1', 'assets/GameScene/planet_enemy_stage_1.png')
    this.load.image('planet_enemy_stage_2', 'assets/GameScene/planet_enemy_stage_2.png')
    this.load.image('planet_enemy_stage_3', 'assets/GameScene/planet_enemy_stage_3.png')

    this.load.image('planet_hero_stage_0', 'assets/GameScene/planet_orange_stage_0.png')
    this.load.image('planet_hero_stage_1', 'assets/GameScene/planet_orange_stage_1.png')
    this.load.image('planet_hero_stage_2', 'assets/GameScene/planet_orange_stage_2.png')
    this.load.image('planet_hero_stage_3', 'assets/GameScene/planet_orange_stage_3.png')

    this.load.image('power_up_thunder_blue', 'assets/GameScene/power_up_thunder_blue.png')
    this.load.image('power_up_battery_blue', 'assets/GameScene/power_up_battery_blue.png')
    this.load.image('power_up_shield_blue', 'assets/GameScene/power_up_shield_blue.png')
    this.load.image('power_up_thunder_red', 'assets/GameScene/power_up_thunder_red.png')
    this.load.image('power_up_battery_red', 'assets/GameScene/power_up_battery_red.png')
    this.load.image('power_up_shield_red', 'assets/GameScene/power_up_shield_red.png')
    powerUpList = ["power_up_shield", "power_up_battery", "power_up_thunder"];



  }

  create() {

    // Socket Communication
    self = this;
    socket = io();

    // Gyroscope default
    gammaRotNeutral = gammaRot;


    // Scene Management
    self.scene.launch("StartScene");
    self.scene.bringToTop("StartScene");
    self.scene.launch("UIScene");
    self.scene.bringToTop("UIScene");
    self.scene.setVisible(false);

   


    // Place gameobjects


    var background = self.physics.add.sprite(0, 0, 'background').setOrigin(0,0);

    myCharacterSprite = self.physics.add.sprite(CONFIG.DEFAULT_SPAWN_X_HOST, CONFIG.DEFAULT_SPAWN_Y_HOST, 'ship_large_blue').setOrigin(0,0).setScale(0.5);
    myCharacterSprite.setCollideWorldBounds(true);
    myCharacterSprite.setImmovable(true);
  

    enemyCharacterSprite = self.physics.add.sprite(CONFIG.DEFAULT_SPAWN_X_GUEST, CONFIG.DEFAULT_SPAWN_Y_GUEST, 'ship_large_red').setOrigin(0,0).setScale(0.5);
    enemyCharacterSprite.setCollideWorldBounds(true);
    enemyCharacterSprite.setImmovable(true);


    ballSprite = self.physics.add.sprite(myCharacterSprite.x +30 , myCharacterSprite.y + 80, 'energy_sphere_basic').setOrigin(0,0).setScale(0.7);
    ballConfig.isPresent = true;
    ballSprite.setCollideWorldBounds(true);
    spawnBall();
    
    planet_hero = self.physics.add.sprite(138, 5, 'planet_hero_stage_0').setOrigin(0,0).setScale(1.2).setImmovable(true).setName("planet_hero");
    planet_hero.flipY = true;
    ui_element_countdown = self.physics.add.sprite(180, 410, 'ui_element_3').setOrigin(0,0);

      
    planet_enemy = self.physics.add.sprite(138, 740, 'planet_enemy_stage_0').setOrigin(0,0).setScale(1.2).setImmovable(true).setName("planet_enemy");
    blocks = self.physics.add.group({
      allowGravity: false
    })

    power_up_hero = this.physics.add.group({
    });
    power_up_enemy = this.physics.add.group({
    });

        
    for (let i = 0; i < small_ship_columns; i++) {
      hero_small_ship_list[i] = [];
      enemy_small_ship_list[i] = [];
      for(let j = 0; j < small_ship_rows; j++) {
        let xHost = (160 * Math.cos(i*((Math.PI/5))) + 172);
        let yHost = (100 * Math.sin(i*((Math.PI/5))) + 25) + (j*30); 
        hero_small_ship_list[i][j] = blocks.create(xHost, yHost, "ship_small_blue").setOrigin(0,0).setImmovable(true).setName("hostBlock" + i + j);
        enemy_small_ship_list[i][j] = blocks.create(xHost, -1 * yHost + (gameHeight -25), "ship_small_red").setOrigin(0,0).setImmovable(true).setName("guestBlock" + i + j);
      }
    }

    // Controls

    cursors = self.input.keyboard.createCursorKeys();
    if(window.DeviceOrientationEvent){
      window.addEventListener("deviceorientation", orientation, false);
    }else{
      console.log("DeviceOrientationEvent is not supported");
    }
    if(window.DeviceMotionEvent){
      window.addEventListener("devicemotion", motion, false);
    }else{
      console.log("DeviceMotionEvent is not supported");
    }


    // Timer Event
    self.time.addEvent({ delay: 1, callback: ballUpdate, callbackScope: self, loop: true });


    // Sockets 

    socket.on('characterSpawn', function (myCharacter, enemyCharacter, ball) {

      myCharacterConfig = myCharacter;
      enemyCharacterConfig = enemyCharacter;
      if (myCharacterConfig.isHost){
         // Randomly choose player with first serve
        if (getRandomInt(0, 1) == 0){
          hostServe = true;
        }
        else{
          guestServe = true;
        }
        Global.isHost = true;
        myCharacterConfig.positionX = CONFIG.DEFAULT_SPAWN_X_HOST;
        myCharacterConfig.positionY = CONFIG.DEFAULT_SPAWN_Y_HOST;
        enemyCharacterConfig.positionX = CONFIG.DEFAULT_SPAWN_X_GUEST;
        enemyCharacterConfig.positionY = CONFIG.DEFAULT_SPAWN_Y_GUEST;
        myCharacterSprite.setTexture("ship_large_blue");
        myCharacterSprite.body.checkCollision.up = false;

        enemyCharacterSprite.setTexture("ship_large_red");
      }
      else{
        myCharacterConfig.positionX = CONFIG.DEFAULT_SPAWN_X_GUEST;
        myCharacterConfig.positionY = CONFIG.DEFAULT_SPAWN_Y_GUEST;
        enemyCharacterConfig.positionX = CONFIG.DEFAULT_SPAWN_X_HOST;
        enemyCharacterConfig.positionY = CONFIG.DEFAULT_SPAWN_Y_HOST;
        myCharacterSprite.setTexture("ship_large_red");
        myCharacterSprite.body.checkCollision.down = false;

        enemyCharacterSprite.setTexture("ship_large_blue");
      }
      myCharacterSprite.setPosition(myCharacterConfig.positionX, myCharacterConfig.positionY).setOrigin(0,0);
      enemyCharacterSprite.setPosition(enemyCharacterConfig.positionX, enemyCharacterConfig.positionY).setOrigin(0,0);
      ballConfig = ball;

      socket.emit('playerMovementServer', myCharacterSprite, myCharacterConfig, enemyCharacterSprite, enemyCharacterConfig);
    });

    socket.on('playerConnectedCounter', function (){
      Global.connectedPlayers = Global.connectedPlayers + 1;
    });

    socket.on('guestCollision', function (ball) {
      change_direction_up();
    });

    socket.on('enableCollsionGuest', function(){
      onlyOnce = true;
    });


    socket.on('startGame', function (){
      setTimeout(function(){ 
        self.scene.get("StartScene").cameras.main.fadeOut(2000, 0, 0, 0)
        self.cameras.main.fadeIn(2000, 0, 0, 0)
        self.scene.get("StartScene").scene.setVisible(false);
        self.scene.get("StartScene").scene.setActive(false);

        // Timer
        
        self.time.addEvent({ delay: 1000, callback: onEvent, callbackScope: this, loop: true });

      }, 1500);
      


      if (myCharacterConfig.isHost){

        // Collider

        //self.physics.add.collider(enemyCharacterSprite, ballSprite, change_direction_up);
        self.physics.add.collider(myCharacterSprite, ballSprite, change_direction_down);
        self.physics.add.collider(blocks, ballSprite, destroyBlock);
        self.physics.add.collider(planet_hero, ballSprite, takeDamageHero);
        self.physics.add.collider(planet_enemy, ballSprite, takeDamageEnemy);
        self.physics.add.collider(enemyCharacterSprite, power_up_enemy, activatePowerUp);
        self.physics.add.collider(myCharacterSprite, power_up_hero, activatePowerUp);

      }
      if (!myCharacterConfig.isHost){
        self.physics.add.collider(myCharacterSprite, ballSprite, guestCollision);
        myCharacterSprite.body.checkCollision.down = false;

      }

    
  });

    socket.on('gameOver', function (hostLost){
      Global.hostLost = hostLost;
      gameOver = true;
      ballSprite.setActive(false);
      ballSprite.setVisible(false);
      self.scene.get("StartScene").cameras.main.fadeOut(2000, 0, 0, 0)
      self.scene.pause("GameScene");
      setTimeout(function(){ 
        self.scene.get("StartScene").cameras.main.fadeOut(2000, 0, 0, 0)
        self.scene.get("GameScene").scene.setVisible(false);
        self.scene.launch("GameOverScene");
        self.scene.get("GameOverScene").scene.setVisible(true);
      }, 1000);
    });

    socket.on('takeDamage', function (hostDamage){
      if(hostDamage){
        health_host--;
        hostServe = true;
        guestServe = false;
        if (health_host == 2){
          planet_hero.setTexture('planet_hero_stage_1')
    
        }
        else if (health_host == 1){
          planet_hero.setTexture('planet_hero_stage_2')
        }
        else if (health_host == 0){
          planet_hero.setTexture('planet_hero_stage_3')
          socket.emit('gameOverServer', true)
          Global.hostLost = true;
          gameOver = true;
        }
      }
      else{
        health_guest--;
        hostServe = false;
        guestServe = true;
        if (health_guest == 2){
          planet_enemy.setTexture('planet_enemy_stage_1')
        }
        else if (health_guest == 1){
          planet_enemy.setTexture('planet_enemy_stage_2')
        }
        else if (health_guest == 0){
          planet_enemy.setTexture('planet_enemy_stage_3')
          socket.emit('gameOverServer', false)
          gameOver = true;
        }
      }
      if (!gameOver && Global.isHost){
        spawnBall();
      }
    });

    socket.on('playerMovementClient', function (movedCharacterConfig) {
      enemyCharacterConfig = movedCharacterConfig;
      enemyCharacterSprite.setPosition(enemyCharacterConfig.positionX, enemyCharacterConfig.positionY);
    });

    socket.on('ballMovementGuest', function(host_ball, velocityX, velocityY){
      ballSprite.x = host_ball.x
      ballSprite.y = host_ball.y
      ballSprite.setVelocityX(velocityX);
      ballSprite.setVelocityY(velocityY);
      if (ballSprite.y < 300){
        onlyOnce = true;
      }
    });
    socket.on('thunderSphereMovement', function(thunderSphereOne, thunderSphereTwo){
      if(thunderBallOne.x == thunderSphereOne.x){
        thunderBallOne.setActive(false).setVisible(false).disableBody();
      }
      if(thunderBallTwo.y == thunderSphereTwo.y){
        thunderBallTwo.setActive(false).setVisible(false).disableBody();
      }
      thunderBallOne.x = thunderSphereOne.x
      thunderBallOne.y = thunderSphereOne.y
      thunderBallTwo.x = thunderSphereTwo.x
      thunderBallTwo.y = thunderSphereTwo.y
      
    });

    socket.on('pauseGame', function(){
      self.scene.pause("GameScene");
      setTimeout(function(){ 
        self.scene.get("GameScene").scene.setVisible(false);
        self.scene.launch("PauseScene");
        self.scene.get("PauseScene").scene.setVisible(true);
      }, 1000);
      
    });

    socket.on('startGameScene', function(){
      self.scene.launch("StartScene");
      self.scene.get("StartScene").scene.setVisible(true);
      self.scene.get("GameScene").scene.setVisible(false);
      self.scene.pause("GameScene");
    });

    socket.on('guestServe', function (bool) {
      guestServe = bool;
    });
    socket.on('tellHostServe', function (bool) {
      ballCanBeLaunched = bool;
    });

    socket.on('guestBlockDestroy', function(block){

      for (let i = 0; i < small_ship_columns; i++) {
          for(let j = 0; j < small_ship_rows; j++) {
            if (hero_small_ship_list[i][j] != undefined){
              if (hero_small_ship_list[i][j].name == block.name) {
                hero_small_ship_list[i][j].setVisible(false);
                hero_small_ship_list[i][j].setActive(false);
                hero_small_ship_list[i][j].disableBody();
              }
            }
            if (enemy_small_ship_list[i][j] != undefined){
              if (enemy_small_ship_list[i][j].name == block.name) {
                enemy_small_ship_list[i][j].setVisible(false);
                enemy_small_ship_list[i][j].setActive(false);
                enemy_small_ship_list[i][j].disableBody();

              }
            } 
        }
      } 
    });

    socket.on('spawnPowerUp', function(powerUpList, powerUpCounter){
      while (powerUpCounter > powerUpAtGuestCounter){
        var newPowerUp = powerUpList[powerUpAtGuestCounter];
        powerUpGuestList.push(self.physics.add.sprite(newPowerUp.x, newPowerUp.y, newPowerUp.textureKey).setOrigin(0,0));
        powerUpAtGuestCounter ++;
      }
      for (let i = 0; i < powerUpGuestList.length; i++){
        var newPowerUp = powerUpList[i];
        powerUpGuestList[i].setPosition(newPowerUp.x, newPowerUp.y);
      }
    });
    socket.on('deletePowerUp', function(powerUp){
      powerUpGuestList[powerUp.name].setActive(false).setVisible(false).disableBody();
      
    });

    socket.on('deleteThunderSphere', function(){
      ballSprite.setTexture("energy_sphere_basic")
    });

    socket.on('powerUpBattery', function(isHost){
      if (myCharacterConfig.isHost && isHost) {
        myCharacterSprite.setTexture("ship_large_blue_ftl_mode")
        powerUpBatteryHostActive = true;
        powerUpBatteryHostCooldown = 5;
        self.time.addEvent({ delay: 1000, callback: powerUpBatteryTimerHost, callbackScope: this, loop: powerUpBatteryHostCooldown > 0 });
      }
      if (!myCharacterConfig.isHost && isHost) {
        enemyCharacterSprite.setTexture("ship_large_blue_ftl_mode")
        powerUpBatteryHostActive = true;
        powerUpBatteryHostCooldown = 5;
        self.time.addEvent({ delay: 1000, callback: powerUpBatteryTimerHost, callbackScope: this, loop: powerUpBatteryHostCooldown > 0 });
      }
      if (myCharacterConfig.isHost  && !isHost) {
        enemyCharacterSprite.setTexture("ship_large_red_ftl_mode")
        powerUpBatteryGuestActive = true;
        powerUpBatteryGuestCooldown = 5;
        self.time.addEvent({ delay: 1000, callback: powerUpBatteryTimerGuest, callbackScope: this, loop: powerUpBatteryGuestCooldown > 0 });
      }
      if (!myCharacterConfig.isHost && !isHost) {
        myCharacterSprite.setTexture("ship_large_red_ftl_mode")
        powerUpBatteryGuestActive = true;
        powerUpBatteryGuestCooldown = 5;
        self.time.addEvent({ delay: 1000, callback: powerUpBatteryTimerGuest, callbackScope: this, loop: powerUpBatteryGuestCooldown > 0 });
      }

        
      });

      socket.on('powerUpShield', function(isHost){
          for (let i = 0; i < small_ship_columns; i++) {
            for(let j = 0; j < small_ship_rows; j++) {
              if (isHost) {
                hero_small_ship_list[i][j].setActive(true);
                hero_small_ship_list[i][j].setVisible(true);
                hero_small_ship_list[i][j].enableBody();

              }
              else{
                enemy_small_ship_list[i][j].setActive(true);
                enemy_small_ship_list[i][j].setVisible(true);
                enemy_small_ship_list[i][j].enableBody();
              }
            }
          }
      });
      socket.on('powerUpThunder', function(isHost){
        if (myCharacterConfig.isHost){
          if (isHost){
            ballVelocityY = maxVelocity;
           }
           else{
            ballVelocityY = -1 * maxVelocity;
           }
           ballSprite.setVelocityY(ballVelocityY);
        }
       
       ballSprite.setTexture("energy_sphere_thunder");

      });
  }

  update() {
    if ((powerUpBatteryHostActive && myCharacterConfig.isHost) || (powerUpBatteryGuestActive && myCharacterConfig.isGuest)) {
      playerSpeed = CONFIG.FTL_MODE_PLAYER_SPEED;
    }
    else{
      playerSpeed = CONFIG.DEFAULT_PLAYER_SPEED
    }

    // Player Movement
    if (Global.controlType == CONFIG.KEYBOARD_CONTROL_TYPE){
      if (cursors.left.isDown && !gameOver) {
        myCharacterSprite.setVelocityX(-1 * playerSpeed);
        }
      else if (cursors.right.isDown && !gameOver) {
        myCharacterSprite.setVelocityX(playerSpeed);
      } 
      else {
        myCharacterSprite.setVelocityX(0);
      }
    }
    else if (Global.controlType == CONFIG.TOUCH_CONTROL_TYPE){
      this.input.on('pointerdown', function (pointer) {
        pointerLocationX = pointer.x;
        myCharacterSpriteLocationX = myCharacterSprite.x;
        if (pointerLocationX < (myCharacterSpriteLocationX -20) && pointerLocationX != 0 )  
        { 
          myCharacterSprite.setVelocityX(-1 * playerSpeed);        
        }
        else if (pointerLocationX > (myCharacterSpriteLocationX +20) && pointerLocationX != 0)
        {
          myCharacterSprite.setVelocityX(playerSpeed);        
        }
        else
        {
          myCharacterSprite.setVelocityX(0);
          pointerLocationX = 0;
        }
      });
      this.input.on('pointerup', function (pointer) {
          myCharacterSprite.setVelocityX(0);
          pointerLocationX = 0;
      });

    }
    else if (Global.controlType == CONFIG.GYROSCOPE_CONTROL_TYPE){
      if ((gammaRot >= gammaRotNeutral- 5) && (gammaRot <= gammaRotNeutral + 5)){
        myCharacterSprite.setVelocityX(0);
      }
      else if (!Global.gameOver){
        var playerVelocity = (gammaRot - gammaRotNeutral) * 10;
        if (playerVelocity > playerSpeed){
          playerVelocity = playerSpeed;
        }
        if ((powerUpBatteryHostActive && myCharacterConfig.isHost) || (powerUpBatteryGuestActive && myCharacterConfig.isGuest)) {
          myCharacterSprite.setVelocityX(playerVelocity * 2);  
        }
        else{
          myCharacterSprite.setVelocityX(playerVelocity);  
        }
      }

    }

    
    
    if (oldPositionX != myCharacterSprite.x){
      myCharacterConfig.positionX = myCharacterSprite.x;
      myCharacterConfig.positionY = myCharacterSprite.y;
      socket.emit('playerMovementServer', myCharacterSprite, myCharacterConfig, enemyCharacterSprite, enemyCharacterConfig);
    }
    oldPositionX = myCharacterSprite.x;



    // Getting the game started
    if (myCharacterConfig.isHost){
      // BALLMOVEMENT
      for (let i = 0; i < power_up_counter; i++ ){
        socket.emit('spawnPowerUpServer', power_up_list, power_up_counter, enemyCharacterConfig);
      }
    }
    for (let i = 0; i < power_up_counter; i++){
      if (power_up_list[i].x < -50 || power_up_list[i].x > 900){
        socket.emit('deletePowerUpServer', power_up_list[i], enemyCharacterConfig);
        power_up_list[i].setActive(false);
        power_up_list[i].setVisible(false);
        power_up_list[i].disableBody();
      }
    }

    if (myCharacterConfig.isHost){

      if (!ballLaunched && hostServe && !guestServe){
        //socket.emit('ballMovementServer', ballSprite, ballSprite.body.velocity.x, ballSprite.body.velocity.y, ballConfig, enemyCharacterConfig);
        ballSprite.setPosition(myCharacterSprite.x + 35, myCharacterSprite.y + 60)
      }
      if (!ballLaunched && !hostServe && guestServe){
        //socket.emit('ballMovementServer', ballSprite, ballSprite.body.velocity.x, ballSprite.body.velocity.y, ballConfig, enemyCharacterConfig);
        ballSprite.setPosition(enemyCharacterSprite.x + 35, enemyCharacterSprite.y - 40)
      }
    }
    if (myCharacterConfig.isHost && !ballLaunched && initialCountdown <= 0){
      launchBallHost();
    }
    if (!myCharacterConfig.isHost && guestServe && initialCountdown <= 0){
      launchBallGuest();
    }
  }
}

function launchBallHost(){
  if (!hostServe && guestServe){
    socket.emit('guestServeServer', true, enemyCharacterConfig);
    if (ballCanBeLaunched){
      guestServe = false;
      hostServe = false;
      ballLaunched = true;
      ballCanBeLaunched = false;
      ballVelocityY = -1* spawnVelocity;
      ballSprite.setVelocityY(ballVelocityY);
      changeVelocityHorizontal();
      //socket.emit('ballMovementServer', ballSprite, ballSprite.body.velocity.x, ballSprite.body.velocity.y, ballConfig, enemyCharacterConfig);

    }
  } 
  else if (hostServe && !guestServe){
    self.input.on('pointerdown', function(pointer){
      if (!ballLaunched){
        ballLaunched = true;
        guestServe = false;
        hostServe = false;
        ballVelocityY = spawnVelocity;
        ballSprite.setVelocityY(ballVelocityY);
        changeVelocityHorizontal();
        //socket.emit('ballMovementServer', ballSprite, ballSprite.body.velocity.x, ballSprite.body.velocity.y, ballConfig, enemyCharacterConfig);
      }
    }, self);
  }
}

function launchBallGuest(){
  ballLaunched = false;
  self.input.on('pointerdown', function(pointer){
    guestServe = false;
    hostServe = false;
    socket.emit('tellHostServeServer', true, enemyCharacterConfig);
  }, self);
}


function change_direction_up() {
  ballVelocityY = ballVelocityY * -1
  if(ballVelocityY < 0 && Math.abs(ballVelocityY) < maxVelocity){
    ballVelocityY = ballVelocityY - 25;
  }
  ballSprite.setVelocityY(ballVelocityY);
  changeVelocityHorizontal()
  if (myCharacterConfig.isHost){
    //socket.emit('ballMovementServer', ballSprite, ballSprite.body.velocity.x, ballSprite.body.velocity.y, ballConfig, enemyCharacterConfig);
  }
}

function change_direction_down() {
  
  ballVelocityY = ballVelocityY * -1
  if(ballVelocityY > 0 && Math.abs(ballVelocityY) < maxVelocity){
    ballVelocityY = ballVelocityY + 25;
  };
  ballSprite.setVelocityY(ballVelocityY);
  changeVelocityHorizontal();
  if (myCharacterConfig.isHost){
    //socket.emit('ballMovementServer', ballSprite, ballSprite.body.velocity.x, ballSprite.body.velocity.y, ballConfig, enemyCharacterConfig);
  }

}

function changeVelocityHorizontal(){
  if (ballSprite.body.velocity.x < 50 && ballSprite.body.velocity.x > -50){
    if (getRandomInt(0,1) == 0){
      ballVelocityX = 250;
    }
    else{
      ballVelocityX = 250;
    }
  }
  else{
    ballVelocityX = ballSprite.body.velocity.x
  }
  ballSprite.setVelocityX(ballVelocityX);
}


// Random whole number between min (inclusive) and max (inclusive)
function getRandomInt(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function destroyBlock(ballSprite, block){
  if (block.name.includes("guest")){
    change_direction_up()
  }
  else{
    change_direction_down()
  }
  block.setVisible(false);
  block.setActive(false);
  block.disableBody();
  if (myCharacterConfig.isHost){
    socket.emit('blockDestroy', block, enemyCharacterConfig );
  }
  
  if (getRandomInt(0,3) == 0){
    var powerUpChoice = powerUpList[getRandomInt(0,2)];
    if (block.name.includes("guest")){
      power_up_list[power_up_counter] = power_up_hero.create(block.x, block.y, (powerUpChoice + "_blue")).setOrigin(0,0);
      power_up_list[power_up_counter].setVelocityY(-100);
      
  
    }
    else{
      power_up_list[power_up_counter] = power_up_enemy.create(block.x, block.y, (powerUpChoice + "_red")).setOrigin(0,0);
      power_up_list[power_up_counter].setVelocityY(+100);
    }
    power_up_list[power_up_counter].setName(power_up_counter);
    power_up_counter ++;
  }
 



  ballVelocityY == (-1 * ballVelocityY);
  ballSprite.setVelocityY(ballVelocityY);
  changeVelocityHorizontal();
}

function takeDamageHero(heart, c_ball){
  socket.emit('takeDamageServer', true);  
}
function takeDamageEnemy(heart, c_ball){
  socket.emit('takeDamageServer', false);  
}

function spawnBall(){
  socket.emit('powerUpShieldServer', true);  
  socket.emit('powerUpShieldServer', false);  

  if (hostServe){
    ballSprite.setPosition(myCharacterSprite.x + 60, myCharacterSprite.y + 80 ).setOrigin(0,0);
  }
  else{
    ballSprite.setPosition(enemyCharacterSprite.x + 60, enemyCharacterSprite.y - 80).setOrigin(0,0);
    hostServe = false;
  }
  ballConfig.isPresent = true;
  ballLaunched = false;
  ballCanBeLaunched = false;
  ballSprite.setTexture("energy_sphere_basic");
  socket.emit('deleteThunderSphereServer', enemyCharacterConfig);
  ballSprite.setBounce(0.5, 0.5);
  ballSprite.setCollideWorldBounds(true);
  ballSprite.setVelocityY(0);
  ballSprite.setVelocityX(0);
  for (let i = 0; i < power_up_counter; i++){
    socket.emit('deletePowerUpServer', power_up_list[i], enemyCharacterConfig);
    power_up_list[i].setActive(false);
    power_up_list[i].setVisible(false);
    power_up_list[i].disableBody();
  }
}

function onEvent ()
{
  if (initialCountdown > 0){
    initialCountdown -= 1; // One second
    if (initialCountdown == 3){
      ui_element_countdown.setTexture("ui_element_2")
    }
    if (initialCountdown == 2){
      ui_element_countdown.setTexture("ui_element_1")
    }
    if (initialCountdown == 1){
      ui_element_countdown.setTexture("ui_element_begin")
      ui_element_countdown.setPosition(140, 410)
    }
    if (initialCountdown == 0){
      ui_element_countdown.setActive(false);
      ui_element_countdown.setVisible(false);

    }
  }
}
function powerUpBatteryTimerHost(){
  if (powerUpBatteryHostCooldown > 0){
    powerUpBatteryHostCooldown --;
  }
  if (powerUpBatteryHostCooldown == 0){
    powerUpBatteryHostActive = false;
    if (myCharacterConfig.isHost){
      myCharacterSprite.setTexture("ship_large_blue")
    }
    if (!myCharacterConfig.isHost){
      enemyCharacterSprite.setTexture("ship_large_blue")
    }
  }
}

function powerUpBatteryTimerGuest(){
  if (powerUpBatteryGuestCooldown > 0){
    powerUpBatteryGuestCooldown --;
  }
 
  if (powerUpBatteryGuestCooldown == 0){
    powerUpBatteryGuestActive = false;
    if (!myCharacterConfig.isHost){
      myCharacterSprite.setTexture("ship_large_red")
    }
    if (myCharacterConfig.isHost){
      enemyCharacterSprite.setTexture("ship_large_red")
    }
  }
}

function activatePowerUp(characterSprite, powerUp){
  var activatedPowerUp = powerUp.texture.key
  switch (activatedPowerUp){

    case "power_up_battery_blue":
      socket.emit('powerUpBatteryServer', true);  
      console.log("power_up_battery_blue")

      break;

    case "power_up_battery_red":
      socket.emit('powerUpBatteryServer', false);  
      console.log("power_up_battery_red")

      break;

    case "power_up_shield_blue":
      socket.emit('powerUpShieldServer', true);  
      console.log("power_up_shield_blue")
      break;

    case "power_up_shield_red":
      socket.emit('powerUpShieldServer', false);  
      console.log("power_up_shield_red")
      break;

    case "power_up_thunder_blue":
      socket.emit('powerUpThunderServer', true);  
      console.log("power_up_thunder_blue")
      break;
      

    case "power_up_thunder_red":
      socket.emit('powerUpThunderServer', false);  
      console.log("power_up_thunder_red")
      break;
    default:
      console.log("default")

  }
  socket.emit('deletePowerUpServer', powerUp, enemyCharacterConfig);

  powerUp.setActive(false);
  powerUp.setVisible(false);
  powerUp.disableBody();

}

function guestCollision(myCharacter, ball){
if (onlyOnce){
  socket.emit('guestCollisionServer', enemyCharacterConfig, ball);
  onlyOnce= false;
}

}


function orientation(event){
  alphaRot = event.alpha;
  betaRot = event.bet;
  gammaRot = event.gamma;
}

function motion(event){
  alphaAcc = event.accelerationIncludingGravity.x;
  betaAcc = event.accelerationIncludingGravity.y;
  gammaAcc = event.accelerationIncludingGravity.z;
}

export function startGameServer(){
  socket.emit('startGameServer', myCharacterConfig)
  self.scene.setVisible(true);


}

function ballUpdate(){
  console.log('ballUpdate');
  console.log(ballSprite.body.velocity);
  if (myCharacterConfig.isHost){
    socket.emit('ballMovementServer', ballSprite, ballSprite.body.velocity.x, ballSprite.body.velocity.y, ballConfig, enemyCharacterConfig);
  }
  
}