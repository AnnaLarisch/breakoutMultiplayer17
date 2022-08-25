import Global from "../global.js";
import GameScene from "./GameScene.js"
import { startGameServer } from "./GameScene.js";

var self;

var black_screen;
var title_gastro_cosmos;
var ui_element_waiting_for_opponent;
var button_ready;
var playersConnected;




export default class StartScene extends Phaser.Scene {
    constructor() {
      super({ key: 'StartScene' });
    }
    preload() {
       // Start Screen UI
    
    this.load.image('black_screen', 'assets/black_screen.png');

    this.load.image('title_gastro_cosmos', 'assets/StartScene/title_gastro_cosmos.png')
    this.load.image('button_ready', 'assets/StartScene/button_ready.png')
    this.load.image('button_ready_active', 'assets/StartScene/button_ready_active.png')
    this.load.image('ui_element_waiting', 'assets/StartScene/ui_element_waiting.png')
    this.load.image('ui_element_waiting_for_opponent', 'assets/StartScene/ui_element_waiting_for_opponent.png')


    }
    create() {
      self = this;
      // Black Screen

      black_screen = self.physics.add.sprite(0, 0, 'black_screen').setOrigin(0,0);
      title_gastro_cosmos = self.physics.add.sprite(0, 50, 'title_gastro_cosmos').setOrigin(0,0);
      Global.connectedPlayers = Global.connectedPlayers + 1;
      playersConnected = self.add.text(230, 810, 'Connected: ' + Global.connectedPlayers + '/2');

      // Start Game Button

      button_ready = self.physics.add.sprite(120, 280, 'button_ready').setOrigin(0,0).setInteractive();
      button_ready.on('pointerup', function (pointer){
          button_ready.setTexture('button_ready_active');
          ui_element_waiting_for_opponent = self.physics.add.sprite(0, 420, 'ui_element_waiting_for_opponent').setOrigin(0,0);
          startGameServer();
        
      }, this);
    }
    update() {
      playersConnected.setText('Connected: ' + Global.connectedPlayers + '/2')
    }

}