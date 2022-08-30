import GameScene from './scenes/GameScene.js';
import PauseScene from './scenes/PauseScene.js';
import StartScene from './scenes/StartScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import CreditsScene from './scenes/CreditsScene.js';
import UIScene from './scenes/UIScene.js';


import CONFIG from './config.js'
import Global from './global.js';



var baseSize = calculateBestRatio();

var config = {
    type: Phaser.CANVAS,
    parent: 'phaser-example',
    width: 393,
    height: 851,
    scale:{
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: CONFIG.DEFAULT_WIDTH,
      height: CONFIG.DEFAULT_HEIGHT,
      min: {
        width: baseSize[0],
        height:  baseSize[1]
      },
      max: {
        width: 0,
        height: 0
      }
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      }
    },
    scene: [GameScene, PauseScene, GameOverScene, StartScene, UIScene, CreditsScene]
  };

var game = new Phaser.Game(config);


function calculateBestRatio(){
  var ratioWidth = window.innerWidth / CONFIG.DEFAULT_WIDTH;
  var ratioHeight = window.innerHeight / CONFIG.DEFAULT_HEIGHT;
      
  if (ratioHeight < ratioWidth) {
    var baseWidth = ratioHeight*CONFIG.DEFAULT_WIDTH;
    var baseHeight = ratioHeight*CONFIG.DEFAULT_HEIGHT;
    }
  else{
    var baseWidth = ratioWidth*CONFIG.DEFAULT_WIDTH;
    var baseHeight = ratioWidth*CONFIG.DEFAULT_HEIGHT;
    }
  console.log(baseWidth, baseHeight);
  return [baseWidth, baseHeight];
};