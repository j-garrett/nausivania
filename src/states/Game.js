/* globals __DEV__ */
import Phaser from 'phaser';
import Mushroom from '../sprites/Mushroom';
import Player from '../sprites/Player';
import {setResponsiveWidth} from '../utils';

export default class extends Phaser.State {
  init () {}
  preload () {}

  //find objects in a Tiled layer that contain a property called "type" equal to a certain value
  findObjectsByType(type, map, layer) {
    let result = [];
    map.objects[layer].forEach(function(element) {
      if (element.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact position as in Tiled
        element.y -= map.tileHeight;
        result.push(element);
      }
    });
    return result;
  }

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
    let start = this.findObjectsByType('starting_position', this.map, 'player');
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
    this.game.physics.arcade.collide(this.player, this.worldLayer);
    if (this.keys.spacebar.isDown && this.player.body.blocked.down) {
      this.player.body.velocity.y = -800;
    }
    if (this.keys.down.isDown) {
      this.player.body.velocity.y += 300 * this.game.time.physicsElapsed;
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

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.player, 32, 32);
    }
  }
}
