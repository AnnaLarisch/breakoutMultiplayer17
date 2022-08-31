var self;
var button_fullscreen;


export default class UIScene extends Phaser.Scene {
    constructor() {
      super({ key: 'UIScene' });
    }
    preload() {
      this.load.image('button_fullscreen', 'assets/UIScene/button_fullscreen.png')
      this.load.image('button_windowed', 'assets/UIScene/button_windowed.png')

    }
    create() {
        self = this;
        button_fullscreen = self.physics.add.sprite(350, 10, 'button_fullscreen').setOrigin(0,0).setScale(0.6).setInteractive();
        button_fullscreen.alpha = 0.7
        button_fullscreen.on('pointerup', function (pointer){
        if (self.scale.isFullscreen) {
          button_fullscreen.setTexture("button_fullscreen")
          this.scale.stopFullscreen();
        }
        else{
          this.scale.startFullscreen();

          button_fullscreen.setTexture("button_windowed")
        }
      
    }, this);

    }
    update() {
      //self.scene.get('UIScene').scene.bringToTop();

      if (self.scale.isFullscreen){
        button_fullscreen.setTexture("button_fullscreen")
      }
      else{
        button_fullscreen.setTexture("button_windowed")
      }
    }

}