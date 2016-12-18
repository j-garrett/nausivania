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
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.keys.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SHIFT);
    this.weapon = this.game.add.weapon(3, 'rayblast');
    this.weapon.trackRotation = true;
    this.weapon.bulletKillDistance = 400;
    this.weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
    this.weapon.bulletSpeed = 600;
    this.weapon.bulletInheritSpriteSpeed = true;
    this.weapon.fireRate = 500;
    this.weapon.bulletGravity.y = -2000;
    this.weapon.trackSprite(this.player, 70, 0, false);
    this.weapon.fireAngle = 0;
    // // this.sprite = this.add.sprite(40, 100, 'mummy');
    // this.mummyWalkLeft = this.add.sprite(40, 100, 'mummyReverse');
    // this.mummyWalkLeft.animations.add('walkLeft');
    this.player.animations.add('walk');
    this.player.animations.add('walkLeft');

    this.keys.left.onDown.add(this.walkLeftAnimation, this);
    this.keys.right.onDown.add(this.walkRightAnimation, this);
    this.keys.left.onUp.add(this.backToIdleLeft, this);
    this.keys.right.onUp.add(this.backToIdleRight, this);
  }

  walkLeftAnimation () {
    this.weapon.fireAngle = 180;
    this.weapon.trackSprite(this.player, -70, 0, false);

    this.player.loadTexture('mummyReverse', 0);
    this.player.animations.play('walkLeft', 20, true);
  }

  walkRightAnimation () {
    this.weapon.fireAngle = 0;
    this.weapon.trackSprite(this.player, 70, 0, false);

    this.player.loadTexture('mummy', 0);
    this.player.animations.play('walk', 20, true);
  }

  backToIdleLeft () {
    this.player.animations.play('walk', 0, true);
  }

  backToIdleRight () {
    this.player.animations.play('walkLeft', 0, true);
  }

  update () {
    const deltaTime = this.game.time.physicsElapsed;

    //Do platforms and ladders first, then we'll check against collision with objects later.
    this.player.body.checkCollision = { up: false, down: true, left: false, right: false };
    this.game.physics.arcade.collide(this.player, this.platformsLayer);

    //Reset back to normal tracking for everything else
    this.player.body.checkCollision = { up: true, down: true, left: true, right: true };

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
            this.player.body.velocity.x = -300;
            // if (this.player.body.velocity.x < -500) {
            //   this.player.body.velocity.x = -500;
            // }
        } else if (this.keys.right.isDown) {
            this.player.body.velocity.x = 300;


            // if (this.player.body.velocity.x > 500) {
            //   this.player.body.velocity.x = 500;
            // }
        } else if (this.player.body.velocity.x > 0) {
            this.player.body.velocity.x = 0;
        } else if (this.player.body.velocity.x < 0) {
            this.player.body.velocity.x = 0;
        }
    }
    if (this.fireButton.isDown) {
      this.weapon.fire();
    }
  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.player, 32, 32);
    }
  }
}
