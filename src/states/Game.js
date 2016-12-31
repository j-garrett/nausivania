/* globals __DEV__ */
import Phaser from 'phaser';
import Mushroom from '../sprites/Mushroom';
import Player from '../sprites/Player';
import {setResponsiveWidth} from '../utils';
import {checkOverlap} from '../utils';
import {findObjectsByType} from '../utils';
import {findBoundingBoxesByType} from '../utils';


export default class extends Phaser.State {
    init() {
    }

    preload() {
    }

    create() {
        let banner = this.add.text(this.game.world.centerX, this.game.height - 30, 'Nausivania');
        banner.font = 'Nunito';
        banner.fontSize = 40;
        banner.fill = '#77BFA3';
        banner.anchor.setTo(0.5);

        this.map = this.game.add.tilemap('level1');
        this.defaultTileset = this.map.addTilesetImage('tiles', 'gameTiles');

        this.layers = { world: null, background: null, platforms: null, lava: null, ladders: null };

        this.game.world.setBounds(0, 0, this.map.width * this.map.tileWidth, this.map.height * this.map.tileHeight);

        this.layers.background = this.map.createLayer('background');

        this.layers.world = this.map.createLayer('world');
        this.map.setCollisionBetween(1, 2000, true, this.layers.world);

        this.layers.platforms = this.map.createLayer('platforms');
        this.map.setCollisionBetween(1, 2000, true, this.layers.platforms);

        this.layers.ladders = findBoundingBoxesByType('ladder', this.map, 'ladders');

        this.layers.lavaBase = this.map.createLayer('lavaBase');
        this.map.setCollisionBetween(1, 2000, true, this.layers.lavaBase);

        this.layers.lavaTop = this.map.createLayer('lavaTop');
        this.map.setCollisionBetween(1, 2000, true, this.layers.lavaTop);

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

        game.time.events.loop(500, function(){
            this.shuffleLava();
        }, this);

        this.createHealthText();
    }

    update() {
        //Not sure if I just want to give the player references to these objects and let it do its stuff in its own update function
        this.player.doMovement(this.keys, this.layers);


        this.updateHealthText();
    }

    createHealthText() {
        let text = this.game.add.text(10, 100, "0", { font: 'bold 45px Arial', fill: '#00ff00' });

        text.anchor.set(0, 0);

        text.fixedToCamera = true;

        this.healthText = text;
    }

    updateHealthText() {
        this.healthText.text = "Health: " + this.player.health;
    }

    shuffleLava() {
        this.shuffleTiles([222, 223, 224], this.layers.lavaTop); //, this.layers.lavaTop);
        this.shuffleTiles([298, 299, 300, 333, 334, 335, 368, 369, 370], this.layers.lavaBase);
    }

    /**
     * Definitely not the most optimal to shuffle tiles. We could be calling getTile and caching this.
     *
     * @param {number[]} tiles - Array of tile indexes to swap
     * @param {Phaser.TilemapLayer} layer
     */
    shuffleTiles(tiles, layer) {
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                let tile = this.map.getTile(x, y, layer);

                if (tile != null) {
                    let newTile = tiles[this.game.rnd.integerInRange(0, tiles.length-1)] + this.defaultTileset.firstgid;
                    this.map.putTile(newTile, x, y, layer);
                }
            }
        }
    }

    render() {
        if (__DEV__) {
            this.game.debug.spriteInfo(this.player, 32, 32);
        }
    }
}
