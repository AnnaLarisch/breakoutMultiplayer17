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

//import CONFIG from './public/src/config';

// Host is the first player that joins the server. Takes care of game logic.
var host = {
  playerID: 0,
  socketID: "empty",
  status: "default",
  spawnX: 196,//CONFIG.DEFAULT_SPAWN_X_HOST,
  spawnY: 200,//CONFIG.DEFAULT_SPAWN_X_HOST,
  positionX: 196,//CONFIG.DEFAULT_SPAWN_X_HOST,
  positionY: 200,//CONFIG.DEFAULT_SPAWN_Y_HOST,
  isPresent: false,
  isHost: false,
  isGuest: false
};

// Guest is the second player that joins the server. Is just here to look good.
var guest = {
  playerID: 1,
  socketID: "empty",
  status: "default",
  spawnX: 196,//CONFIG.DEFAULT_SPAWN_X_GUEST,
  spawnY: 600,//CONFIG.DEFAULT_SPAWN_X_GUEST,
  positionX: 196,//CONFIG.DEFAULT_SPAWN_X_GUEST,
  positionY: 600,//CONFIG.DEFAULT_SPAWN_Y_GUEST,
  isPresent: false,
  isHost: false,
  isGuest: false
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

var waitingForReconnect = false;


io.on('connection', function (socket) {

  // Both players join the "game room"
  socket.join('game');


  // Host join
  if (!host.isPresent){
    host.isPresent = true;
    host.isHost = true;
    host.socketID = socket.id;

    console.log('User ',host.playerID,' with the ID: ',host.socketID,' has connected. This user will be the host.');
    console.log("This user spawned at: X: ",host.spawnX,', Y: ',host.spawnY);

    // Spawn Host and Guest Character for Host

    socket.emit('characterSpawn', host, guest, ball);
  }

  // Guest join
  else if (host.isPresent && !guest.isPresent){
    guest.isPresent = true;
    guest.isGuest = true;
    guest.socketID = socket.id,

    console.log('User ',guest.playerID,' with the ID: ',guest.socketID,' has connected. This user will be the guest.');
    console.log("This user spawned at: X: ",guest.spawnX,', Y:',guest.spawnY);
    io.in('game').emit('secondConnection');

    // Spawn Guest and Host Character for Guest

   
    socket.emit('characterSpawn', guest, host, ball);
    //io.in('game').emit('startGame');

    // Tell both players to start the game
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

  socket.on('ballMovementServer', function (ballSprite, ballConfig, otherPlayerInfo) {
    ball = ballConfig;
    socket.broadcast.to(otherPlayerInfo.socketID).emit('ballMovementGuest', ballSprite);
  });

  socket.on('blockDestroy', function (destroyedBlock, otherPlayerInfo) {
    socket.broadcast.to(otherPlayerInfo.socketID).emit('guestBlockDestroy', destroyedBlock);
  });
  socket.on('changeHeart', function (changedHeart, otherPlayerInfo, isHostHeart) {
    socket.broadcast.to(otherPlayerInfo.socketID).emit('changeHeartGuest', changedHeart, isHostHeart);
  });
  socket.on('gameOverServer', function (otherPlayerInfo, isHost){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('gameOver', isHost);
  });
  socket.on('guestServeServer', function (bool, otherPlayerInfo){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('guestServe', bool);
  });
  socket.on('tellHostServeServer', function (bool, otherPlayerInfo){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('tellHostServe', bool);
  });
});


// Server listens on port 80 for join requests

server.listen(80, function () {
  console.log(`Listening on ${server.address().port}`);
});