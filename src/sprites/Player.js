import Phaser from 'phaser';

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset);
    this.game = game;
    game.physics.arcade.enable(this);
    this.anchor.setTo(0.5);
    this.body.collideWorldBounds = true;
    this.body.checkCollision.left = true;
    this.body.mass = 30;

    this.climbing = false;
  }

  update () {
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

}
