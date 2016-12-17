import Phaser from 'phaser';
import { centerGameObjects } from '../utils';

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg');
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar');
    centerGameObjects([this.loaderBg, this.loaderBar]);

    this.load.setPreloadSprite(this.loaderBar);
    //
    // load your assets
    //
    this.load.image('rayblast', 'assets/images/rayblast.png');
    this.load.image('player', 'assets/images/od.png');
    this.load.image('mushroom', 'assets/images/mushroom2.png');
    this.load.tilemap('level1', 'assets/tilemaps/' + __GAME_CONFIG__.autoloadLevel + '.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', '/assets/images/scifi_platformTiles_32x32.png');
    this.load.image('gameFleshTiles', '/assets/tilemaps/livingTissueTiles/tileset.png');
    this.load.image('gameFleshBackground', '/assets/tilemaps/livingTissueTiles/background.png');
  }

  create () {
    this.state.start('Game');
  }

}
