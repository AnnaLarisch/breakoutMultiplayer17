import Global from "../global.js";

var self;
var game_over_black_screen;
var title_game_over;
var button_start_chatting;
var button_quit;
var button_rematch;
var ui_element_you_won_lost;


export default class GameOverScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameOverScene' });
    }
    preload() {

      this.load.image('button_quit', 'assets/GameOverScene/button_quit.png')
      this.load.image('button_rematch', 'assets/GameOverScene/button_rematch.png')
      this.load.image('button_start_chatting', 'assets/GameOverScene/button_start_chatting.png')
      this.load.image('title_game_over', 'assets/GameOverScene/title_game_over.png')
      this.load.image('ui_element_you_lost', 'assets/GameOverScene/ui_element_you_lost.png')
      this.load.image('ui_element_you_won', 'assets/GameOverScene/ui_element_you_won.png')



    }
    create() {
        self = this;

        game_over_black_screen = self.physics.add.sprite(0, 0, "black_screen").setOrigin(0,0);
        title_game_over = self.physics.add.sprite(0, 50, "title_game_over").setOrigin(0,0);
        //button_rematch = self.physics.add.sprite(0, 650, "button_rematch").setOrigin(0,0);
        button_start_chatting = self.physics.add.sprite(100, 500, "button_start_chatting").setOrigin(0,0).setInteractive();
        button_quit = self.physics.add.sprite(280, 790, "button_quit").setOrigin(0,0);
        if (Global.hostLost && Global.isHost || !Global.hostLost && !Global.isHost ){
          ui_element_you_won_lost = self.physics.add.sprite(0, 220, "ui_element_you_lost").setOrigin(0,0);
        }
        else{
          ui_element_you_won_lost = self.physics.add.sprite(0, 220, "ui_element_you_won").setOrigin(0,0);
        }

    }
    update() {

    }

}