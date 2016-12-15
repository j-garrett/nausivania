/* globals __DEV__ */
import Phaser from 'phaser';
import Mushroom from '../sprites/Mushroom';
import Player from '../sprites/Player';
import {setResponsiveWidth} from '../utils';
import {checkOverlap} from '../utils';
import {findObjectsByType} from '../utils';
import {findBoundingBoxesByType} from '../utils';


export default class extends Phaser.State {
  init () {}
  preload () {}

  create () {
    let banner = this.add.text(this.game.world.centerX, this.game.height - 30, 'Nausivania');
    banner.font = 'Nunito';
    banner.fontSize = 40;
    banner.fill = '#77BFA3';
    banner.anchor.setTo(0.5);

    this.map = this.game.add.tilemap('level1');
    this.map.addTilesetImage('tiles', 'gameTiles');
    this.backgroundLayer = this.map.createLayer('background');
    this.worldLayer = this.map.createLayer('world');
    this.map.setCollisionBetween(1, 2000, true, 'world');

    this.ladders = findBoundingBoxesByType('ladder', this.map, 'ladders');

    let start = findObjectsByType('starting_position', this.map, 'player');
    this.player = new Player({
      game: this.game,
      x: start[0].x,
      y: start[0].y,
      asset: 'player',
    });
    // set the sprite width to 30% of the game width
    setResponsiveWidth(this.player, 5, this.game.world);
    this.game.add.existing(this.player);
    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //move player with cursor keys
    this.keys = this.game.input.keyboard.createCursorKeys();

    this.keys.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  }


  update () {
    const deltaTime = this.game.time.physicsElapsed;

    if (this.keys.spacebar.isDown) {
        this.player.stopClimbing();
    } else if (this.keys.up.isDown && !this.player.climbing) {
      console.log("Up key pressed");
        if (checkOverlap(this.player, this.ladders)) {
          this.player.startClimbing();
        }
    }

    // Different physics and controls when climbing a ladder
    if (this.player.climbing) {
      const climbSpeed = 150;

      if (this.keys.up.isDown) {
        this.player.y -= climbSpeed * deltaTime;
      } else if (this.keys.down.isDown) {
        this.player.y += climbSpeed * deltaTime;
      }
    } else {
      // Movement not on a ladder

        this.game.physics.arcade.collide(this.player, this.worldLayer);

        if (this.keys.spacebar.isDown && this.player.body.blocked.down) {
            this.player.stopClimbing();

            this.player.body.velocity.y = -800;
        }

        if (this.keys.left.isDown) {
            this.player.body.velocity.x = -400;
            // if (this.player.body.velocity.x < -500) {
            //   this.player.body.velocity.x = -500;
            // }
        } else if (this.keys.right.isDown) {
            this.player.body.velocity.x = 400;
            // if (this.player.body.velocity.x > 500) {
            //   this.player.body.velocity.x = 500;
            // }
        } else if (this.player.body.velocity.x > 0) {
            this.player.body.velocity.x = 0;
        } else if (this.player.body.velocity.x < 0) {
            this.player.body.velocity.x = 0;
        }
    }
  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.player, 32, 32);
    }
  }
}
