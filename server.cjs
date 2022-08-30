// Server Configuration

var express = require('express');
var app = express();
var server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


// Game Configuration


// Host is the first player that joins the server. Takes care of game logic.
var host = {
  playerID: 0,
  socketID: "empty",
  status: "default",
  positionX: 0,//CONFIG.DEFAULT_SPAWN_X_HOST,
  positionY: 0,//CONFIG.DEFAULT_SPAWN_Y_HOST,
  isPresent: false,
  isHost: true,
  isGuest: false
};

// Guest is the second player that joins the server. Is just here to look good.
var guest = {
  playerID: 1,
  socketID: "empty",
  status: "default",
  positionX: 0,//CONFIG.DEFAULT_SPAWN_X_GUEST,
  positionY: 0,//CONFIG.DEFAULT_SPAWN_Y_GUEST,
  isPresent: false,
  isHost: false,
  isGuest: true
};

// Ball is the most important game object.
var ball = {
  status: "default",
  velocityY: 80,//CONFIG.DEFAULT_VELOCITY_Y_BALL,
  velocityX: 0,//CONFIG.DEFAULT_VELOCITY_X_BALL,
  spawnX: 196,//CONFIG.DEFAULT_SPAWN_X_BALL,
  spawnY: 400,//CONFIG.DEFAULT_SPAWN_Y_BALL,
  positionX: 196,//CONFIG.DEFAULT_SPAWN_X_BALL,
  positionY: 400,//CONFIG.DEFAULT_SPAWN_Y_BALL,
  bounce: 50,//CONFIG.DEFAULT_BOUNCE_BALL,
  isPresent: true
}

var hostIsReady = false;
var guestIsReady = false;



io.on('connection', function (socket) {

  // Both players join the "game room"
  socket.join('game');

  // Host join
  if (!host.isPresent){
    host.isPresent = true;
    host.socketID = socket.id;

    console.log('User ',host.playerID,' with the ID: ',host.socketID,' has connected. This user will be the host.');

    // Spawn Host and Guest Character for Host

    socket.emit('characterSpawn', host, guest, ball);
  }

  // Guest join
  else if (host.isPresent && !guest.isPresent){
    guest.isPresent = true;
    guest.socketID = socket.id,

    console.log('User ',guest.playerID,' with the ID: ',guest.socketID,' has connected. This user will be the guest.');

    // Spawn Guest and Host Character for Guest

    io.in('game').emit('playerConnectedCounter');
    socket.emit('characterSpawn', guest, host, ball);

    }


  else if (host.isPresent && guest.isPresent){
    console.log("Can not connect to the server. Only two players are allowed to connect.");
  }

  socket.on('disconnect', function () {
    if (socket.id == host.socketID){
      host.isPresent = false;
      console.log("Host has disconnected.")
    }
    else if (socket.id == guest.socketID){
      guest.isPresent = false;
      //rejoinGuest = true;
      console.log("Guest has disconnected.")
    }

    if ((host.isPresent && !guest.isPresent) || (!host.isPresent && guest.isPresent)){
      console.log("pause game");
      io.in('game').emit('pauseGame');

      // Pause Game
    }

    if (!host.isPresent && !guest.isPresent){
      console.log("Shut Down Server");
      io.close()
      // End Game
    }

  });

  socket.on("startGameServer", function (myCharacterConfig){
    if (myCharacterConfig.isHost){
      hostIsReady = true;
    }
    if (myCharacterConfig.isGuest){
      guestIsReady = true;
    }
    if (hostIsReady && guestIsReady){
      io.in('game').emit('startGame');
    }
  });

  socket.on('playerMovementServer', function (myCharacterSprite, myCharacterConfig, enemyCharacterSprite, enemyCharacterConfig) {
    if (myCharacterConfig.isHost){
      host = myCharacterConfig;
      guest = enemyCharacterConfig;
    }
    else{
      guest = myCharacterConfig;
      host = enemyCharacterConfig;
    }
    socket.broadcast.to(enemyCharacterConfig.socketID).emit('playerMovementClient', myCharacterConfig);
  });

  socket.on('ballMovementServer', function (ballSprite, velocityX, velocityY, ballConfig, otherPlayerInfo) {
    ball = ballConfig;
    socket.broadcast.to(otherPlayerInfo.socketID).emit('ballMovementGuest', ballSprite, velocityX, velocityY);
  });

  socket.on('blockDestroy', function (destroyedBlock, otherPlayerInfo) {
    socket.broadcast.to(otherPlayerInfo.socketID).emit('guestBlockDestroy', destroyedBlock);
  });
  socket.on('takeDamageServer', function (isHost) {
    io.in('game').emit('takeDamage', isHost);
  });
  socket.on('gameOverServer', function (hostLost){
    io.in('game').emit('gameOver', hostLost);

  });
  socket.on('guestServeServer', function (bool, otherPlayerInfo){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('guestServe', bool);
  });
  socket.on('tellHostServeServer', function (bool, otherPlayerInfo){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('tellHostServe', bool);
  });
  socket.on('powerUpBatteryServer', function (isHost){
    io.in('game').emit('powerUpBattery', isHost);
  });
  socket.on('powerUpShieldServer', function (isHost){
    io.in('game').emit('powerUpShield', isHost);
  });
  socket.on('powerUpThunderServer', function (isHost){
    io.in('game').emit('powerUpThunder', isHost);
  });
  socket.on('spawnPowerUpServer', function (powerUpList, powerUpCounter, otherPlayerInfo){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('spawnPowerUp', powerUpList, powerUpCounter);
  });
  socket.on('deletePowerUpServer', function (powerUp, otherPlayerInfo){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('deletePowerUp', powerUp);
  });
  socket.on('guestCollisionServer', function (otherPlayerInfo, ball){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('guestCollision', ball);
  });
  socket.on('deleteThunderSphereServer', function (otherPlayerInfo){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('deleteThunderSphere');
  });
  socket.on('enableCollsionGuestServer', function (otherPlayerInfo){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('enableCollsionGuest');
  });
});


// Server listens on port 80 for join requests
// use 8081 fpr localhost testing and 80 for heroku server testing

const PORT = process.env.PORT || 80;


server.listen(PORT, function () {
  console.log(`Listening on ${server.address().port}`);
});