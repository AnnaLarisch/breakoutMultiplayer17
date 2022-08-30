var self;
var pauseText;


export default class PauseScene extends Phaser.Scene {
    constructor() {
      super({ key: 'PauseScene' });
    }

    preload() {
        this.load.image('title_your_opponent_left', 'assets/PauseScene/title_your_opponent_left.png');
    }
    create() {
        self = this;
        self.cameras.main.fadeIn(3000, 0, 0, 0)
        pauseText = self.physics.add.sprite(0, 0, 'title_your_opponent_left').setOrigin(0,0)
       
    }
    update() {

    }
}