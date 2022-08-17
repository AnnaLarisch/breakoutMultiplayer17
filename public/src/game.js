import GameScene from './scenes/GameScene.js';
import PauseScene from './scenes/PauseScene.js';

const config = {
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
    scene: [GameScene, PauseScene]
  };
window.game = new Phaser.Game(config);