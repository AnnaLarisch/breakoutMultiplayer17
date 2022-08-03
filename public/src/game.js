
var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 393,
    height: 851,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      }
    },
    scene: [{
      preload: preload,
      create: create,
      update: update
    } ]
  };
 
var game = new Phaser.Game(config);

var cursors;
var self;

var host_block_list = [];
var guest_block_list = [];
var block_rows = 3;
var block_columns = 8;

var gameStart = false;

var oldPositionX = 0;
var ballInfo = {
  ball_velocity_y: 150,
  ball_velocity_x: 0,
  ball_position_x: 196,
  ball_position_y: 401,
  ball_bounce: 50,
  ball_status: "default"
}

var ball;

var countdownText;
var timedEvent;


var isHost = false;

var ballExists = true;

var maxVelocity = 1500;
var ballVelocity = 150;

var heart_host;
var heart_guest;
var health_host = 3;
var health_guest = 3;
var ballVelocityX = 80;

var waitingText;

var myCharacterSprite;
var myCharacterConfig = {
  playerID: -1,
  socketID: "empty",
  status: "default",
  spawnX: 0,
  spawnY: 0,
  positionX: 0,
  positionY: 0,
  isPresent: false,
  isHost: false
};

var enemyCharacterSprite;
var enemyCharacterConfig = {
  playerID: -1,
  socketID: "empty",
  status: "default",
  spawnX: 0,
  spawnY: 0,
  positionX: 0,
  positionY: 0,
  isPresent: false,
  isHost: false
};

var timedEvent;
var initialCountdown = 10;
var countingDown = true;

var countDownFinsihed = false;
var gameIsRunning = false;

var ballSpawnedAtHost = true;
var ballLaunched = false;

var ballCanBeLaunched = false;

var guestServe = false;


function preload() {
    this.load.image('playerRed', 'assets/player_red.png');
    this.load.image('playerGreen', 'assets/player_green.png');
    this.load.image('ball_basic', 'assets/ball_basic.png');
    this.load.image('blueBlock', 'assets/block_blue.png');
    this.load.image('orangeBlock', 'assets/block_orange.png');
    this.load.image('heart_basic', 'assets/player_heart_pink.png');
    this.load.image('heart_damaged_purple', 'assets/player_heart_purple.png');
    this.load.image('heart_damaged_grey', 'assets/player_heart_grey.png');
    this.load.image('heart_game_over', 'assets/player_heart_game_over.png');


}

function create() {

    // Socket Communication

    self = this;
    this.socket = io();


    // Place gameobjects

    myCharacterSprite = self.physics.add.sprite(196, 200, 'playerRed').setOrigin(0,0);
    myCharacterSprite.setCollideWorldBounds(true);
    myCharacterSprite.setImmovable(true);
    enemyCharacterSprite = self.physics.add.sprite(196, 600, 'playerGreen').setOrigin(0,0);
    enemyCharacterSprite.setCollideWorldBounds(true);
    enemyCharacterSprite.setImmovable(true);

    ball = self.physics.add.sprite(myCharacterSprite.x, myCharacterSprite.y + 50, 'ball_basic').setOrigin(0,0).setScale(0.5);
  
    heart_host = self.physics.add.sprite(150, -10, 'heart_basic').setOrigin(0,0).setScale(0.4).setImmovable(true).setName("heart_host");
    heart_host.flipY = true;
      
    heart_guest = self.physics.add.sprite(150, 770, 'heart_basic').setOrigin(0,0).setScale(0.4).setImmovable(true).setName("heart_guest");

    blocks = self.physics.add.group({
      allowGravity: false
    })
    
    for (let i = 0; i < block_columns; i++) {
      host_block_list[i] = [];
      guest_block_list[i] = [];
      for(let j = 0; j < block_rows; j++) {
        host_block_list[i][j] = blocks.create(i*50, 100 + j*20, "blueBlock").setOrigin(0,0).setImmovable(true).setName("hostBlock" + i + j);
        guest_block_list[i][j] = blocks.create(i*50, 740 - j*20, "orangeBlock").setOrigin(0,0).setImmovable(true).setName("guestBlock" + i + j);
      }
    }

    

    // Controls

    cursors = self.input.keyboard.createCursorKeys();

    


    // Sockets 

    self.socket.on('changeHeartGuest', function(changedHeart, isHostHeart){
      if (isHostHeart){
        heart_host.setTexture(changedHeart.textureKey);
      }
      else{
        heart_guest.setTexture(changedHeart.textureKey);
      }
    });


    self.socket.on('guestBallMovement', function(host_ball){
      if (!ballExists){
        ball = self.physics.add.sprite(150, 400, 'ball_basic').setOrigin(0,0).setScale(0.5);
        ballExists = true;
      }
      ball.x = host_ball.x
      ball.y = host_ball.y
    });

    self.socket.on('guestBlockDestroy', function(block){
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
    

    self.socket.on('hostSpawn', function (host) {
      myCharacterConfig = host;
      myCharacterSprite.setPosition(myCharacterConfig.spawnX, myCharacterConfig.spawnY).setOrigin(0,0);
      myCharacterSprite.setTexture("playerRed");
      waitingText = self.add.text(100, 400, "Waiting for other player!");
    });

    self.socket.on('guestSpawn', function (guest) {
      myCharacterConfig = guest;
      myCharacterSprite.setPosition(myCharacterConfig.spawnX, myCharacterConfig.spawnY).setOrigin(0,0);
      myCharacterSprite.setTexture("playerGreen");
    });

    self.socket.on('guestHostSpawn', function (host) {
      enemyCharacterConfig = host;
      enemyCharacterSprite.setPosition(enemyCharacterConfig.spawnX, enemyCharacterConfig.spawnY).setOrigin(0,0);
      enemyCharacterSprite.setTexture("playerRed");
    });

    self.socket.on('hostGuestSpawn', function (guest) {
      enemyCharacterConfig = guest;
      enemyCharacterSprite.setPosition(enemyCharacterConfig.spawnX, enemyCharacterConfig.spawnY).setOrigin(0,0);
      enemyCharacterSprite.setTexture("playerGreen");
    });

    self.socket.on('gameOver', function (isHost){
      var gameOvertext;
      if (isHost){
        gameOvertext = self.add.text(100, 400, "GAME OVER!\n YOU WON THIS ROUND!\nCONGRATULATIONS!");
      }
      else{
        gameOvertext = self.add.text(100, 400, "GAME OVER!\n YOU LOST THIS ROUND!\GOOD GAME!");
      }
      gameIsRunning = false;
    });



    self.socket.on('startGame', function (){
      if (myCharacterConfig.isHost){
        waitingText.setText("");

        // Collider
        // Colliders are only activated for host, to make sure that desync will not happen
        self.physics.add.collider(enemyCharacterSprite, ball, change_direction_up);
        self.physics.add.collider(myCharacterSprite, ball, change_direction_down);
        self.physics.add.collider(blocks, ball, destroyBlock);
        self.physics.add.collider(heart_host, ball, takeDamage);
        self.physics.add.collider(heart_guest, ball, takeDamage);
      }

      countdownText = self.add.text(200, 200, 'Game starts in:\n' + initialCountdown);
      timedEvent = self.time.addEvent({ delay: 1000, callback: onEvent, callbackScope: this, loop: true });
   

    });

    self.socket.on('moveOtherPlayer', function (play_inf, mov_data) {
      enemyCharacterSprite.setPosition(mov_data.x, mov_data.y);
    });


    this.socket.on('remove', function (player) {
      enemyCharacterSprite.indexOf(player).destroy();
    });

    this.socket.on('guestServe', function (bool) {
      guestServe = bool;
    });
    this.socket.on('tellHostServe', function (bool) {
      ballCanBeLaunched = bool;
    });


  }


  function update() {

    // Player Movement

    if (cursors.left.isDown) {
      myCharacterSprite.setVelocityX(-150);
    } 
    else if (cursors.right.isDown) {
      myCharacterSprite.setVelocityX(150);
    } 
    else {
      myCharacterSprite.setVelocityX(0);
    }
    
    if ( oldPositionX != myCharacterSprite.x){
      self.socket.emit('playerMovement', myCharacterSprite, myCharacterConfig, enemyCharacterSprite, enemyCharacterConfig);
    }
    oldPositionX = myCharacterSprite.x;

    if(initialCountdown == 0 && !gameIsRunning ){
      countdownText.setText("");
      countingDown = false;
    }


    if (myCharacterConfig.isHost){
       // Getting the game started
      self.socket.emit('ballMovement', ball, enemyCharacterConfig);
    }

    if (myCharacterConfig.isHost){

      if(!gameIsRunning &&  !ballLaunched){
        if (ballSpawnedAtHost){
          ball.setPosition(myCharacterSprite.x, myCharacterSprite.y + 50);
        }
        else{
          guestServe = true;
          ball.setPosition(enemyCharacterSprite.x, enemyCharacterSprite.y - 50);
          self.socket.emit('guestServeServer', true, enemyCharacterConfig);

        }
        if (!guestServe){
          self.input.on('pointerdown', function(pointer){
            if (initialCountdown <= 0 && !gameIsRunning && !ballLaunched && ballSpawnedAtHost){
              ballCanBeLaunched = true;
            }
          }, self);

        }
       
      }
    }
    if (!myCharacterConfig.isHost){
      if (guestServe){
        self.input.on('pointerdown', function(pointer){
          console.log("Shoot BALL");
          guestServe = false;
          self.socket.emit('tellHostServeServer', true, enemyCharacterConfig);
        }, self);
      }

      }

      if(ballCanBeLaunched){
        launchBall();
        ballCanBeLaunched = false;
      }
    }



function change_direction_up() {
  ballVelocity = ballVelocity * -1
  if(ballVelocity < 0 && Math.abs(ballVelocity) < maxVelocity){
    ballVelocity = ballVelocity - 50;
  }
  ball.setVelocityY(ballVelocity);
  if (ball.body.velocity.x < 300){
    ball.setVelocityX(ball.body.velocity.x * 2); 
  };     
}

function change_direction_down() {
  ballVelocity = ballVelocity * -1
  if(ballVelocity > 0 && Math.abs(ballVelocity) < maxVelocity){
    ballVelocity = ballVelocity + 50;
  };
  ball.setVelocityY(ballVelocity);
  if (ball.body.velocity.x < 300){
    ball.setVelocityX(ball.body.velocity.x * 2); 
  };
}

function getRandom(min, max){
  return Math.random() * (max - min) + min;
}

function destroyBlock(ball, block){

  ball.setVelocityY(ball.body.velocity.y * -1.3);
  ball.setVelocityX(ball.body.velocity.x * 1.1);

  if (myCharacterConfig.isHost){
    self.socket.emit('blockDestroy', block, enemyCharacterConfig );
  }
  block.destroy();

}

function takeDamage(heart, c_ball){

  if(heart.name == "heart_host"){
    health_host --;
    if (health_host == 2){
      heart.setTexture('heart_damaged_purple')
      self.socket.emit('changeHeart', heart, enemyCharacterConfig, true);

    }
    else if (health_host == 1){
      heart.setTexture('heart_damaged_grey')
      self.socket.emit('changeHeart', heart, enemyCharacterConfig, true);
    }
    else if (health_host == 0){
      heart.setTexture('heart_game_over')
      self.socket.emit('changeHeart', heart, enemyCharacterConfig, true);
      self.socket.emit('gameOverServer', enemyCharacterConfig, true )
      gameOvertext = self.add.text(100, 400, "GAME OVER!\n YOU LOST THIS ROUND!\GOOD GAME!");
      gameOver = true;
    }
    spawnBall(myCharacterSprite, ball);

  }
  else if (heart.name = "heart_guest"){
    health_guest --;
    if (health_guest == 2){
      heart.setTexture('heart_damaged_purple')
      self.socket.emit('changeHeart', heart, enemyCharacterConfig, false);
    }
    else if (health_guest == 1){
      heart.setTexture('heart_damaged_grey')
      self.socket.emit('changeHeart', heart, enemyCharacterConfig, false);
    }
    else if (health_guest == 0){
      heart.setTexture('heart_game_over')
      self.socket.emit('changeHeart', heart, enemyCharacterConfig, false);
      self.socket.emit('gameOver', enemyCharacterConfig, false )
      gameOvertext = self.add.text(100, 400, "GAME OVER!\n YOU WON THIS ROUND!\nCONGRATULATIONS!");
      gameOver = true;
    }
    spawnBall(enemyCharacterSprite, ball);
  }

}

function spawnBall(characterSprite, ball){
  if (characterSprite.texture.key == "playerRed"){
    ball.setPosition(characterSprite.x, characterSprite.y + 50 ).setOrigin(0,0);
    ballSpawnedAtHost = true;
    ballLaunched = false;
    gameIsRunning = false;
    ball.setVelocityY(0);
    ball.setVelocityX(0);
  }
  if (characterSprite.texture.key == "playerGreen"){
    ball.setPosition(characterSprite.x, characterSprite.y - 50).setOrigin(0,0);
    ballSpawnedAtHost = false;
    ballLaunched = false;
    gameIsRunning = false;

    ball.setVelocityY(0);
    ball.setVelocityX(0);
  }
/*
  ball.setTexture("ball_basic");
  ball.setBounce(0.5, 0.5);
  ball.setCollideWorldBounds(true);
  ball.setVelocityY(80); */
}

function onEvent ()
{
  if (initialCountdown > 0){
    initialCountdown -= 1; // One second
    countdownText.setText('Countdown: ' + initialCountdown);
  }
}

function launchBall () {
  gameIsRunning = true;
  ballLaunched = true;
  console.log(myCharacterSprite.texture.key);
  ball.setTexture("ball_basic");
  ball.setBounce(0.5, 0.5);
  ball.setCollideWorldBounds(true);
  if (ballSpawnedAtHost){
    ball.setVelocityY(80); 
  }
  else{
    ball.setVelocityY(-80); 
  }
}