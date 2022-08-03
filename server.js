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
  isPresent: false
}


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

    // Spawn Host Character
    socket.emit('hostSpawn', host);

  }

  // Guest join
  else if (host.isPresent){
    guest.isPresent = true;
    guest.isGuest = true;
    guest.socketID = socket.id,

    console.log('User ',guest.playerID,' with the ID: ',guest.socketID,' has connected. This user will be the guest.');
    console.log("This user spawned at: X: ",guest.spawnX,', Y:',guest.spawnY);


    // Spawn Guest Character
    socket.emit('guestSpawn', guest);

    // Spawn Host Character for Guest
    socket.emit('guestHostSpawn', host);

    // Spawn Guest Character for Host
    socket.broadcast.to(host.socketID).emit('hostGuestSpawn', guest);

    // Tell both players to start the game
    io.in('game').emit('startGame');

    }


  else if (host.isPresent && guest.isPresent){
    console.log("Can not connect to the server. Only two players are allowed to connect.");
  }

  socket.on('disconnect', function () {
    if (socket.id == host.playerId){
      hostPresent = false;
      //rejoinHost = true;
      console.log("Host has disconnected.")
    }

    else{
      guestPresent = false;
      //rejoinGuest = true;
      console.log("Guest has disconnected.")
    }
    if (rejoinHost && rejoinGuest){
      // Restart scene
    }
    //socket.broadcast.emit('remove', disconnectedUser);
  });
    
  socket.on('playerMovement', function (movementData, playerInfo, otherPlayer, otherPlayerInfo) {
    socket.broadcast.to(otherPlayerInfo.socketID).emit('moveOtherPlayer', playerInfo, movementData);
  });

  socket.on('ballMovement', function (movedBall, otherPlayerInfo) {
    socket.broadcast.to(otherPlayerInfo.socketID).emit('guestBallMovement', movedBall);
  });

  socket.on('blockDestroy', function (destroyedBlock, otherPlayerInfo) {
    socket.broadcast.to(otherPlayerInfo.socketID).emit('guestBlockDestroy', destroyedBlock);
  });
  socket.on('changeHeart', function (changedHeart, otherPlayerInfo, isHostHeart) {
    socket.broadcast.to(otherPlayerInfo.socketID).emit('changeHeartGuest', changedHeart, isHostHeart);
  });
  socket.on('gameOverServer', function (isHost){
    io.in('game').emit('gameOver', isHost);
  });
  socket.on('guestServeServer', function (bool, otherPlayerInfo){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('guestServe', bool);
  });
  socket.on('tellHostServeServer', function (bool, otherPlayerInfo){
    socket.broadcast.to(otherPlayerInfo.socketID).emit('tellHostServe', bool);
  });
});


// Server listens on port 8081 for join requests

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});