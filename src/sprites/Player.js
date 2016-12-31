import Phaser from 'phaser';
import {checkOverlap} from '../utils';

const State = {
    IDLE: 0,
    WALKING: 1,
    IN_AIR: 2,
    CLIMBING: 3
};

const FacingDirection = {
    LEFT: 0,
    RIGHT: 1
};

const BURN_IN_LAVA_REPEAT_DELAY = 500;

const BURN_IN_LAVA_DAMAGE_MIN = 5;
const BURN_IN_LAVA_DAMAGE_MAX = 8;

export default class extends Phaser.Sprite {

    constructor({game, x, y, asset}) {
        super(game, x, y, asset);
        this.game = game;
        game.physics.arcade.enable(this);
        this.anchor.setTo(0.5);
        this.body.collideWorldBounds = true;
        this.body.mass = 30;

        this.movementSpeed = 300;

        this.health = 100;

        this.lastLavaDamage = 0;

        this.loadTexture('mummy', 0);

        //All frames
        this.animations.add('walk', null, 30, true);
        this.animations.add('idle', [4], 30, true);

        this.climbing = false;

        this.state = State.IDLE;

        this.facingDirection = FacingDirection.RIGHT;

        this.addWeapon();
    }

    addWeapon() {
        this.weapon = this.game.add.weapon(3, 'rayblast');
        this.weapon.trackRotation = true;
        this.weapon.bulletKillDistance = 400;
        this.weapon.bulletKillType = Phaser.Weapon.KILL_DISTANCE;
        this.weapon.bulletSpeed = 600;
        this.weapon.bulletInheritSpriteSpeed = true;
        this.weapon.fireRate = 500;
        this.weapon.bulletGravity.y = -2000;
        this.weapon.trackSprite(this, 70, 0, false);
        this.weapon.fireAngle = 0;
    }

    update() {
    }

    doMovement(keys, layers) {
        const deltaTime = this.game.time.physicsElapsed;

        //Do platforms and ladders first, then we'll check against collision with objects later.
        this.body.checkCollision = {up: false, down: true, left: false, right: false};
        this.game.physics.arcade.collide(this, layers.platforms);

        //Reset back to normal tracking for everything else
        this.body.checkCollision = {up: true, down: true, left: true, right: true};

        if (keys.spacebar.isDown) {
            this.stopClimbing();
        } else if (keys.up.isDown && !this.climbing) {
            console.log("Up key pressed");
            if (checkOverlap(this, layers.ladders)) {
                this.startClimbing();
            }
        }

        // Different physics and controls when climbing a ladder
        if (this.climbing) {
            const climbSpeed = 150;

            if (keys.up.isDown) {
                this.y -= climbSpeed * deltaTime;
            } else if (keys.down.isDown) {
                this.y += climbSpeed * deltaTime;
            }
        } else {
            // Movement not on a ladder

            this.game.physics.arcade.collide(this, layers.world);
            this.game.physics.arcade.collide(this, layers.lavaBase, this.lavaCollide, null, this);

            if (keys.spacebar.isDown && this.body.blocked.down) {
                this.stopClimbing();

                this.body.velocity.y = -800;
            }

            if (keys.left.isDown) {
                this.move(FacingDirection.LEFT);
            } else if (keys.right.isDown) {
                this.move(FacingDirection.RIGHT);
            } else if (this.body.onFloor) {
                this.stopMoving();
            }
        }

        //TODO: Get this out of the movement code
        if (keys.fireButton.isDown) {
            this.weapon.fire();
        }
    }

    move(direction) {
        //TODO: Check to see if we're already in this state, and bail if so

        this.animations.play('walk');

        this.setFacingDirection(direction);

        this.body.velocity.x = this.movementSpeed * (direction == FacingDirection.RIGHT ? 1 : -1);

        this.weapon.fireAngle = this.facingDirection == FacingDirection.RIGHT ? 0 : 180;
        this.weapon.trackOffset.x = this.facingDirection == FacingDirection.RIGHT ? 70 : -70;
    }

    stopMoving() {
        this.body.velocity.x = 0;
        this.animations.play('idle');
    }

    setFacingDirection(direction) {
        if (this.facingDirection == direction) return;

        this.facingDirection = direction;

        this.scale.x = direction == FacingDirection.RIGHT ? 1 : -1;
    }

    startClimbing() {
        if (this.climbing) return;

        console.log("startClimbing", this.body.gravity);
        this.climbing = true;
        this.body.allowGravity = false;
        this.body.velocity.setTo(0);
    }

    stopClimbing() {
        if (!this.climbing) return;

        console.log("stopClimbing");
        this.climbing = false;
        this.body.allowGravity = true;
    }

    lavaCollide() {
        if (this.lastLavaDamage + BURN_IN_LAVA_REPEAT_DELAY < this.game.time.now) {
            this.dealDamage(this.game.rnd.integerInRange(BURN_IN_LAVA_DAMAGE_MIN, BURN_IN_LAVA_DAMAGE_MAX));
            this.lastLavaDamage = this.game.time.now;
        }
    }

    dealDamage(damage) {
        if (damage <= 0) {
            return;
        }
        this.health -= damage;

        let xOffset = this.width * 0.5;
        let x = this.x + this.game.rnd.integerInRange(-xOffset, xOffset);

        let yOffset = this.width * 0.7;
        let y = this.y + this.game.rnd.integerInRange(-yOffset, yOffset);

        let text = this.game.add.text(x, y, "-" + damage, { font: 'bold 25px Arial', fill: '#ff0000' });

        text.anchor.setTo(0.5, 0.5);

        game.time.events.add(Phaser.Timer.SECOND * 0.7, text.destroy, text);
    }
}
