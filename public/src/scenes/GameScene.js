import Global from '../global.js';
import CONFIG from '../config.js';


var cursors;
var self;

var host_block_list = [];
var guest_block_list = [];
var block_rows = 2;
var block_columns = 6;

var gameStart = false;

var oldPositionX = 0;

var startgamebutton;

var gameWidth = 393;
var gameHeight = 851;




var readyForGame = false;
var gameOver;


var maxVelocity = 1000;
var ballVelocityY = 150;

var heart_host;
var heart_guest;
var health_host = 3;
var health_guest = 3;
var ballVelocityX = 80;


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

var initialCountdown = 5;


var ballLaunched = false;
var ballCanBeLaunched = false;



var blocks;
var gameOvertext;

var hostServe = false;
var guestServe = false;


var black_screen;
var title_gastro_cosmos;
var ui_element_waiting_for_opponent;
var button_ready;

var ui_element_countdown;


var game_over_black_screen;
var title_game_over;
var button_rematch;
var button_quit;
var button_start_chatting;
var ui_element_you_won_lost;
var hostLost = false;

var playersConnected;



export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image('playerRed', 'assets/player_red.png');
    this.load.image('playerGreen', 'assets/player_green.png');
    this.load.image('ball_basic', 'assets/ball_basic_2.png');
    this.load.image('blueBlock', 'assets/block_blue.png');
    this.load.image('orangeBlock', 'assets/block_orange.png');
    this.load.image('heart_basic', 'assets/player_heart_pink.png');
    this.load.image('heart_damaged_purple', 'assets/player_heart_purple.png');
    this.load.image('heart_damaged_grey', 'assets/player_heart_grey.png');
    this.load.image('heart_game_over', 'assets/player_heart_game_over.png');
    this.load.image('start_game_button', 'assets/start_game_button.png');


    // Start Screen UI
    
    this.load.image('black_screen', 'assets/black_screen.png');

    this.load.image('title_gastro_cosmos', 'assets/StartScene/title_gastro_cosmos.png')
    this.load.image('button_ready', 'assets/StartScene/button_ready.png')
    this.load.image('button_ready_active', 'assets/StartScene/button_ready_active.png')
    this.load.image('ui_element_waiting', 'assets/StartScene/ui_element_waiting.png')
    this.load.image('ui_element_waiting_for_opponent', 'assets/StartScene/ui_element_waiting_for_opponent.png')


    // Game Element UI

    this.load.image('ui_element_1', 'assets/GameScene/ui_element_1.png')
    this.load.image('ui_element_2', 'assets/GameScene/ui_element_2.png')
    this.load.image('ui_element_3', 'assets/GameScene/ui_element_3.png')
    this.load.image('ui_element_begin', 'assets/GameScene/ui_element_begin.png')

    // Game Assets

    this.load.image('energy_sphere_basic', 'assets/GameScene/energy_sphere_basic.png')

    this.load.image('ship_large_blue', 'assets/GameScene/ship_large_blue.png')
    this.load.image('ship_small_blue', 'assets/GameScene/ship_small_blue.png')
    this.load.image('ship_large_red', 'assets/GameScene/ship_large_red.png')
    this.load.image('ship_small_red', 'assets/GameScene/ship_small_red.png')

    this.load.image('planet_enemy_stage_0', 'assets/GameScene/planet_enemy_stage_0.png')
    this.load.image('planet_enemy_stage_1', 'assets/GameScene/planet_enemy_stage_1.png')
    this.load.image('planet_enemy_stage_2', 'assets/GameScene/planet_enemy_stage_2.png')
    this.load.image('planet_enemy_stage_3', 'assets/GameScene/planet_enemy_stage_3.png')

    this.load.image('planet_hero_stage_0', 'assets/GameScene/planet_orange_stage_0.png')
    this.load.image('planet_hero_stage_1', 'assets/GameScene/planet_orange_stage_1.png')
    this.load.image('planet_hero_stage_2', 'assets/GameScene/planet_orange_stage_2.png')
    this.load.image('planet_hero_stage_3', 'assets/GameScene/planet_orange_stage_3.png')

    // Game Over UI Elements

    this.load.image('title_game_over', 'assets/GameOverScene/title_game_over.png')
    this.load.image('ui_element_you_won', 'assets/GameOverScene/ui_element_you_won.png')
    this.load.image('ui_element_you_lost', 'assets/GameOverScene/ui_element_you_lost.png')
    this.load.image('button_quit', 'assets/GameOverScene/button_quit.png')
    this.load.image('button_rematch', 'assets/GameOverScene/button_rematch.png')
    this.load.image('button_start_chatting', 'assets/GameOverScene/button_start_chatting.png')


  }

  create() {

    // Socket Communication

    self = this;
    Global.socket = io();

    // Randomly choose player with first serve
    if (getRandomInt(0, 1) == 0){
      hostServe = true;
    }
    else{
      guestServe = true;
    }


    // Place gameobjects



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

    heart_host = self.physics.add.sprite(138, 5, 'planet_hero_stage_0').setOrigin(0,0).setScale(1.2).setImmovable(true).setName("heart_host");
    heart_host.flipY = true;
    ui_element_countdown = self.physics.add.sprite(180, 410, 'ui_element_3').setOrigin(0,0);

      
    heart_guest = self.physics.add.sprite(138, 740, 'planet_enemy_stage_0').setOrigin(0,0).setScale(1.2).setImmovable(true).setName("heart_guest");
    blocks = self.physics.add.group({
      allowGravity: false
    })

    

    
    for (let i = 0; i < block_columns; i++) {
      host_block_list[i] = [];
      guest_block_list[i] = [];
      for(let j = 0; j < block_rows; j++) {
        let xHost = (160 * Math.cos(i*((Math.PI/5))) + 172);
        let yHost = (100 * Math.sin(i*((Math.PI/5))) + 25) + (j*30); 
        host_block_list[i][j] = blocks.create(xHost, yHost, "ship_small_blue").setOrigin(0,0).setImmovable(true).setName("hostBlock" + i + j);
        guest_block_list[i][j] = blocks.create(xHost, -1 * yHost + (gameHeight -25), "ship_small_red").setOrigin(0,0).setImmovable(true).setName("guestBlock" + i + j);
      }
    }

    // Black Screen

    black_screen = self.physics.add.sprite(0, 0, 'black_screen').setOrigin(0,0);
    title_gastro_cosmos = self.physics.add.sprite(0, 50, 'title_gastro_cosmos').setOrigin(0,0);

    playersConnected = self.add.text(230, 810, 'Connected: 1/2')

    // Start Game Button

    button_ready = self.physics.add.sprite(120, 280, 'button_ready').setOrigin(0,0).setInteractive();
    button_ready.on('pointerup', function (pointer){
      if (!readyForGame) {
        button_ready.setTexture('button_ready_active');
        ui_element_waiting_for_opponent = self.physics.add.sprite(0, 420, 'ui_element_waiting_for_opponent').setOrigin(0,0);
        Global.socket.emit('startGameServer', myCharacterConfig);
        readyForGame = true;
      }
      
    }, this);

    // Controls

    cursors = self.input.keyboard.createCursorKeys();


    // Sockets 

    Global.socket.on('characterSpawn', function (myCharacter, enemyCharacter, ball) {

      myCharacterConfig = myCharacter;
      enemyCharacterConfig = enemyCharacter;
      if (myCharacterConfig.isHost){
        myCharacterConfig.positionX = CONFIG.DEFAULT_SPAWN_X_HOST;
        myCharacterConfig.positionY = CONFIG.DEFAULT_SPAWN_Y_HOST;
        enemyCharacterConfig.positionX = CONFIG.DEFAULT_SPAWN_X_GUEST;
        enemyCharacterConfig.positionY = CONFIG.DEFAULT_SPAWN_Y_GUEST;
        myCharacterSprite.setTexture("ship_large_blue");
        enemyCharacterSprite.setTexture("ship_large_red");
      }
      else{
        myCharacterConfig.positionX = CONFIG.DEFAULT_SPAWN_X_GUEST;
        myCharacterConfig.positionY = CONFIG.DEFAULT_SPAWN_Y_GUEST;
        enemyCharacterConfig.positionX = CONFIG.DEFAULT_SPAWN_X_HOST;
        enemyCharacterConfig.positionY = CONFIG.DEFAULT_SPAWN_Y_HOST;
        myCharacterSprite.setTexture("ship_large_red");
        enemyCharacterSprite.setTexture("ship_large_blue");
      }
      myCharacterSprite.setPosition(myCharacterConfig.positionX, myCharacterConfig.positionY).setOrigin(0,0);
      enemyCharacterSprite.setPosition(enemyCharacterConfig.positionX, enemyCharacterConfig.positionY).setOrigin(0,0);
      ballConfig = ball;

      Global.socket.emit('playerMovementServer', myCharacterSprite, myCharacterConfig, enemyCharacterSprite, enemyCharacterConfig);
    });

    Global.socket.on('playerConnectedCounter', function (){
      playersConnected.setText("Connected: 2/2");
    });


    Global.socket.on('startGame', function (){
      setTimeout(function(){ 
        black_screen.setActive(false);
        black_screen.setVisible(false);
        title_gastro_cosmos.setActive(false);
        title_gastro_cosmos.setVisible(false);
        ui_element_waiting_for_opponent.setActive(false);
        ui_element_waiting_for_opponent.setVisible(false);
        button_ready.setActive(false);
        button_ready.setVisible(false);
        playersConnected.setActive(false);
        playersConnected.setVisible(false);
        
        // Timer
        
        self.time.addEvent({ delay: 1000, callback: onEvent, callbackScope: this, loop: true });

      }, 1500);
      


      if (myCharacterConfig.isHost){

        // Collider
        // Colliders are only activated for host, to make sure that desync will not happen

        self.physics.add.collider(enemyCharacterSprite, ballSprite, change_direction_up);
        self.physics.add.collider(myCharacterSprite, ballSprite, change_direction_down);
        self.physics.add.collider(blocks, ballSprite, destroyBlock);
        self.physics.add.collider(heart_host, ballSprite, takeDamage);
        self.physics.add.collider(heart_guest, ballSprite, takeDamage);
      }

    
  });

    Global.socket.on('gameOver', function (isHost){
     
      gameOver = true;
      ballSprite.setVelocityX(0);
      ballSprite.setVelocityY(0);
      ballSprite.setActive(false);
      ballSprite.setVisible(false);
      setTimeout(function(){ 
       
        game_over_black_screen = self.physics.add.sprite(0, 0, "black_screen").setOrigin(0,0);
        title_game_over = self.physics.add.sprite(0, 50, "title_game_over").setOrigin(0,0);
        //button_rematch = self.physics.add.sprite(0, 650, "button_rematch").setOrigin(0,0);
        button_start_chatting = self.physics.add.sprite(100, 500, "button_start_chatting").setOrigin(0,0);
        button_quit = self.physics.add.sprite(280, 7900, "button_quit").setOrigin(0,0);
        if (!isHost){
          ui_element_you_won_lost = self.physics.add.sprite(0, 220, "ui_element_you_lost").setOrigin(0,0);
        }
        else{
          ui_element_you_won_lost = self.physics.add.sprite(0, 220, "ui_element_you_won").setOrigin(0,0);
        }
      }, 1500);


    });

    Global.socket.on('playerMovementClient', function (movedCharacterConfig) {
      enemyCharacterConfig = movedCharacterConfig;
      enemyCharacterSprite.setPosition(enemyCharacterConfig.positionX, enemyCharacterConfig.positionY);
    });

    Global.socket.on('ballMovementGuest', function(host_ball){
      ballSprite.x = host_ball.x
      ballSprite.y = host_ball.y
    });

    Global.socket.on('pauseGame', function(){
      self.scene.pause("GameScene");
      setTimeout(function(){ 
      self.scene.get("GameScene").scene.setVisible(false);
      self.scene.launch("PauseScene");
      self.scene.get("PauseScene").scene.setVisible(true);
      }, 1000);
      
    });

    Global.socket.on('startGameScene', function(){
      self.scene.launch("StartScene");
      self.scene.get("StartScene").scene.setVisible(true);
      self.scene.get("GameScene").scene.setVisible(false);
      self.scene.pause("GameScene");
    });

    Global.socket.on('remove', function (player) {
      enemyCharacterSprite.indexOf(player).destroy();
    });


    Global.socket.on('guestServe', function (bool) {
      guestServe = bool;
    });
    Global.socket.on('tellHostServe', function (bool) {
      ballCanBeLaunched = bool;
    });

    Global.socket.on('changeHeartGuest', function(changedHeart, isHostHeart){
      if (isHostHeart){
        heart_host.setTexture(changedHeart.textureKey);
      }
      else{
        heart_guest.setTexture(changedHeart.textureKey);
      }
    });

    Global.socket.on('guestBlockDestroy', function(block){
      for (let i = 0; i < block_columns; i++) {
          for(let j = 0; j < block_rows; j++) {
            if (typeof host_block_list[i][j] != undefined && host_block_list[i][j].name == block.name) {
              host_block_list[i][j].destroy();
          }
          if (typeof guest_block_list[i][j] != undefined && guest_block_list[i][j].name == block.name) {
            guest_block_list[i][j].destroy();
          }
        }
      }
    });
  }

  update() {

    // Player Movement

    if (cursors.left.isDown && !gameOver) {
      myCharacterSprite.setVelocityX(-300);
    } 
    else if (cursors.right.isDown && !gameOver) {
      myCharacterSprite.setVelocityX(300);
    } 
    else {
      myCharacterSprite.setVelocityX(0);
    }
    
    if (oldPositionX != myCharacterSprite.x){
      myCharacterConfig.positionX = myCharacterSprite.x;
      myCharacterConfig.positionY = myCharacterSprite.y;
      Global.socket.emit('playerMovementServer', myCharacterSprite, myCharacterConfig, enemyCharacterSprite, enemyCharacterConfig);
    }
    oldPositionX = myCharacterSprite.x;

    
    // Start Countdown 


    // Getting the game started
    if (myCharacterConfig.isHost){
      Global.socket.emit('ballMovementServer', ballSprite, ballConfig, enemyCharacterConfig);
    }

    if (myCharacterConfig.isHost){

      if (!ballLaunched && hostServe && !guestServe){
        ballSprite.setPosition(myCharacterSprite.x + 35, myCharacterSprite.y + 60)
      }
      if (!ballLaunched && !hostServe && guestServe){
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
    Global.socket.emit('guestServeServer', true, enemyCharacterConfig);
    if (ballCanBeLaunched){
      ballLaunched = true;
      ballCanBeLaunched = false;
      ballVelocityY = -100;
      ballSprite.setVelocityY(ballVelocityY);
      changeVelocityHorizontal();
    }
  } 
  else if (hostServe && !guestServe){
    self.input.on('pointerdown', function(pointer){
      if (!ballLaunched){
        ballLaunched = true;
        ballVelocityY = 100;
        ballSprite.setVelocityY(ballVelocityY);
        changeVelocityHorizontal();
      }
    }, self);
  }
}

function launchBallGuest(){
  ballLaunched = false;
  self.input.on('pointerdown', function(pointer){
    guestServe = false;
    Global.socket.emit('tellHostServeServer', true, enemyCharacterConfig);
  }, self);
}


function change_direction_up() {
  ballVelocityY = ballVelocityY * -1
  if(ballVelocityY < 0 && Math.abs(ballVelocityY) < maxVelocity){
    ballVelocityY = ballVelocityY - 50;
  }
  ballSprite.setVelocityY(ballVelocityY);
  changeVelocityHorizontal()
}

function change_direction_down() {
  ballVelocityY = ballVelocityY * -1
  if(ballVelocityY > 0 && Math.abs(ballVelocityY) < maxVelocity){
    ballVelocityY = ballVelocityY + 50;
  };
  ballSprite.setVelocityY(ballVelocityY);
  changeVelocityHorizontal();
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
  console.log(ballVelocityX);
  ballSprite.setVelocityX(ballVelocityX);
}


// Random whole number between min (inclusive) and max (inclusive)
function getRandomInt(min, max){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function destroyBlock(ballSprite, block){

  if (myCharacterConfig.isHost){
    Global.socket.emit('blockDestroy', block, enemyCharacterConfig );
  }
  block.destroy();

  if (ballVelocityY > 0){
    ballVelocityY == ballVelocityY + 50;
    ballSprite.setVelocityY(ballVelocityY);
  }
  else{
    ballVelocityY == ballVelocityY - 50;
    ballSprite.setVelocityY(ballVelocityY);
  }
  changeVelocityHorizontal();


}

function takeDamage(heart, c_ball){

  if(heart.name == "heart_host"){
    health_host--;
    hostServe = true;
    guestServe = false;
    if (health_host == 2){
      heart.setTexture('planet_hero_stage_1')

    }
    else if (health_host == 1){
      heart.setTexture('planet_hero_stage_2')
    }
    else if (health_host == 0){
      heart.setTexture('planet_hero_stage_3')
      Global.socket.emit('gameOverServer', enemyCharacterConfig, true)
      hostLost = true;
      gameOver = true;
    }
  }
  else if (heart.name = "heart_guest"){
    health_guest--;
    hostServe = false;
    guestServe = true;
    if (health_guest == 2){
      heart.setTexture('planet_enemy_stage_1')
    }
    else if (health_guest == 1){
      heart.setTexture('planet_enemy_stage_2')
    }
    else if (health_guest == 0){
      heart.setTexture('planet_enemy_stage_3')
      Global.socket.emit('gameOverServer', enemyCharacterConfig, false)
      gameOver = true;
    }
  }
  Global.socket.emit('changeHeart', heart, enemyCharacterConfig, hostServe);
  if (!gameOver){
    spawnBall();
  }
  else{
    ballSprite.setVelocityX(0);
    ballSprite.setVelocityY(0);
    ballSprite.setActive(false);
    ballSprite.setVisible(false);
    setTimeout(function(){ 
    
    game_over_black_screen = self.physics.add.sprite(0, 0, "black_screen").setOrigin(0,0);
    title_game_over = self.physics.add.sprite(0, 50, "title_game_over").setOrigin(0,0);
    //button_rematch = self.physics.add.sprite(0, 650, "button_rematch").setOrigin(0,0);
    button_start_chatting = self.physics.add.sprite(100, 500, "button_start_chatting").setOrigin(0,0);
    button_quit = self.physics.add.sprite(280, 7900, "button_quit").setOrigin(0,0);
    if (hostLost){
      ui_element_you_won_lost = self.physics.add.sprite(0, 220, "ui_element_you_lost").setOrigin(0,0);
    }
    else{
      ui_element_you_won_lost = self.physics.add.sprite(0, 220, "ui_element_you_won").setOrigin(0,0);
    }
  }, 1500);
  }

}

function spawnBall(){
  if (hostServe){
    ballSprite.setPosition(myCharacterSprite.x + 60, myCharacterSprite.y + 80 ).setOrigin(0,0);
  }
  else{
    ballSprite.setPosition(enemyCharacterSprite.x + 60, enemyCharacterSprite.y - 80).setOrigin(0,0);
  }
  ballConfig.isPresent = true;
  ballLaunched = false;
  ballCanBeLaunched = false;
  ballSprite.setTexture("energy_sphere_basic");
  ballSprite.setBounce(0.5, 0.5);
  ballSprite.setCollideWorldBounds(true);
  ballSprite.setVelocityY(0);
  ballSprite.setVelocityX(0);
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
