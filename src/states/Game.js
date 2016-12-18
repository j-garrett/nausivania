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
    this.map.addTilesetImage('fleshTiles', 'gameFleshTiles');
    this.map.addTilesetImage('fleshBackground', 'gameFleshBackground');

    this.game.world.setBounds(0, 0, this.map.width * this.map.tileWidth, this.map.height * this.map.tileHeight);

    this.backgroundLayer = this.map.createLayer('background');

    this.worldLayer = this.map.createLayer('world');
    this.map.setCollisionBetween(1, 2000, true, this.worldLayer);

    this.platformsLayer = this.map.createLayer('platforms');
    this.map.setCollisionBetween(1, 2000, true, this.platformsLayer);

    this.ladders = findBoundingBoxesByType('ladder', this.map, 'ladders');

    let start = findObjectsByType('starting_position', this.map, 'player');
    this.player = new Player({
      game: this.game,
      x: start[0].x,
      y: start[0].y,
      asset: 'mummy',
    });
    // set the sprite width to 50% of the game width
    // this.player.scale.setTo(0.5);
    this.game.add.existing(this.player);
    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //move player with cursor keys
    this.keys = this.game.input.keyboard.createCursorKeys();
    this.keys.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.keys.fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SHIFT);
  }

  update () {
    //Not sure if I just want to give the player references to these objects and let it do its stuff in its own update function
    this.player.doMovement(this.keys, this.worldLayer, this.platformsLayer, this.ladders);
  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.player, 32, 32);
    }
  }
}
