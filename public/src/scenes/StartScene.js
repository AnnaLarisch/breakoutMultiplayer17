var self;


export default class StartScene extends Phaser.Scene {
    constructor() {
      super({ key: 'StartScene' });
    }
    preload() {
        this.load.image('button_ready', 'assets/StartScene/button_ready.png');
        this.load.image('button_ready_active', 'assets/StartScene/button_ready_active.png');
        this.load.image('ui_element_waiting', 'assets/StartScene/ui_element_waiting.png');
        this.load.image('title_gastro_cosmos', 'assets/StartScene/title_gastro_cosmos.png');


    }
    create() {
        startgamebutton = self.physics.add.sprite(100, 400, 'start_game_button').setOrigin(0,0).setInteractive();
        startgamebutton.on('pointerup', function (pointer){
            startgamebutton.setPosition(-300, -300);
            self.socket.emit('startGameServer', myCharacterConfig);
          }, this);
        self = this;

    }
    update() {

    }

}