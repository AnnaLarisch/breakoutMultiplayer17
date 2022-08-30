var self;
var title_credits;
var button_back;
var text_credits;


export default class CreditsScene extends Phaser.Scene {
    constructor() {
      super({ key: 'CreditsScene' });
    }
    preload() {
      this.load.image('title_credits', 'assets/CreditsScene/title_credits.png')
      this.load.image('button_back', 'assets/CreditsScene/button_back.png')

    }
    create() {
        self = this;
        title_credits = self.physics.add.sprite(0, 40, 'title_credits').setOrigin(0,0);
        button_back = self.physics.add.sprite(10, 780, 'button_back').setOrigin(0,0).setInteractive();
        text_credits = self.add.text(40, 300, 'GastroCosmos Credits\nMade by Anna\nSite Point GmbH\nGastrOn\nPhaser3 by Photon Storm\nHave fun playing this game!');


        button_back.on('pointerup', function (pointer){
            self.scene.pause();
            self.scene.setVisible(false);
  
            self.scene.run('StartScene');
            self.scene.get('StartScene').scene.setVisible(true); 
        }, this);

    }
    update() {

    }
}