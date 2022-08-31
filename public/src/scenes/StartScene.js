import Global from "../global.js";
import CONFIG from '../config.js';
import GameScene from "./GameScene.js"
import { startGameServer } from "./GameScene.js";

var self;

var black_screen;
var title_gastro_cosmos;
var ui_element_waiting_for_opponent;
var button_ready;
var playersConnected;

var button_motion;
var button_touch;
var button_info;





export default class StartScene extends Phaser.Scene {
    constructor() {
      super({ key: 'StartScene' });
    }
    preload() {
       // Start Screen UI
    
    this.load.image('black_screen', 'assets/black_screen.png');

    this.load.image('title_gastro_cosmos', 'assets/StartScene/title_gastro_cosmos_V2.png')
    this.load.image('button_ready', 'assets/StartScene/button_ready.png')
    this.load.image('button_ready_active', 'assets/StartScene/button_ready_active.png')
    this.load.image('ui_element_waiting', 'assets/StartScene/ui_element_waiting.png')
    this.load.image('ui_element_waiting_for_opponent', 'assets/StartScene/ui_element_waiting_for_opponent.png')
    
    this.load.image('button_motion', 'assets/StartScene/button_motion.png')
    this.load.image('button_motion_active', 'assets/StartScene/button_motion_active.png')
    this.load.image('button_touch', 'assets/StartScene/button_touch.png')
    this.load.image('button_touch_active', 'assets/StartScene/button_touch_active.png')

    this.load.image('button_info', 'assets/StartScene/button_info.png')


    }
    create() {
      self = this;
      self.cameras.main.fadeIn(1000, 0, 0, 0)

      // Black Screen

      black_screen = self.physics.add.sprite(0, 0, 'black_screen').setOrigin(0,0);
      title_gastro_cosmos = self.physics.add.sprite(10, 40, 'title_gastro_cosmos').setOrigin(0,0).setScale(1.1);
      Global.connectedPlayers = Global.connectedPlayers + 1;
      playersConnected = self.add.text(15, 815, 'Connected: ' + Global.connectedPlayers + '/2');


      // Start Game Button

      button_ready = self.physics.add.sprite(120, 280, 'button_ready').setOrigin(0,0).setInteractive();
      button_ready.on('pointerup', function (pointer){
          self.scale.startFullscreen();
          screen.orientation.lock("portrait-primary");
          button_ready.setTexture('button_ready_active');
          ui_element_waiting_for_opponent = self.physics.add.sprite(0, 420, 'ui_element_waiting_for_opponent').setOrigin(0,0);
          startGameServer();
        
      }, this);


      // Controll Buttons
      if (Global.controlType == CONFIG.GYROSCOPE_CONTROL_TYPE){
        button_motion = self.physics.add.sprite(0, 660, 'button_motion_active').setOrigin(0,0).setInteractive();
        button_touch = self.physics.add.sprite(195, 660, 'button_touch').setOrigin(0,0).setInteractive();
      }
      else if (Global.controlType == CONFIG.TOUCH_CONTROL_TYPE){
        button_motion = self.physics.add.sprite(0, 660, 'button_motion').setOrigin(0,0).setInteractive();
        button_touch = self.physics.add.sprite(195, 660, 'button_touch_active').setOrigin(0,0).setInteractive();
      }
      else{
        button_motion = self.physics.add.sprite(0, 660, 'button_motion').setOrigin(0,0).setInteractive();
        button_touch = self.physics.add.sprite(195, 660, 'button_touch').setOrigin(0,0).setInteractive();
      }
      button_motion.on('pointerup', function (pointer){
        button_motion.setTexture('button_motion_active');        
        button_touch.setTexture('button_touch');  
        Global.controlType = CONFIG.GYROSCOPE_CONTROL_TYPE;
      }, this);
      button_touch.on('pointerup', function (pointer){
        button_touch.setTexture('button_touch_active');        
        button_motion.setTexture('button_motion'); 
        Global.controlType = CONFIG.TOUCH_CONTROL_TYPE; 
      }, this);


      button_info = self.physics.add.sprite(330, 790, 'button_info').setOrigin(0,0).setInteractive();;
      button_info.on('pointerup', function (pointer){
        self.scene.pause();
        self.scene.setVisible(false);

        self.scene.run('CreditsScene');
        self.scene.get('CreditsScene').scene.setVisible(true);
      }, this);


      checkOriention(self.scale.orientation);

      self.scale.on('orientationchange', checkOriention, this);
      self.scale.lockOrientation("portrait");
      screen.orientation.lock("portrait-primary");


}


    update() {
      playersConnected.setText('Connected: ' + Global.connectedPlayers + '/2')
    }

}

function checkOriention (orientation)
{
    if (orientation === Phaser.Scale.PORTRAIT)
    {
        console.log("Orientation: Portrait Mode");
    }
    else if (orientation === Phaser.Scale.LANDSCAPE)
    {
      console.log("Orientation: Landscape Mode");
    }
    }