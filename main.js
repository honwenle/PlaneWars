var game = new Phaser.Game(320, 480, Phaser.AUTO, 'game');

game.States = {};

game.States.boot = function () {
  this.preload = function () {
    if (!game.device.desktop) {
      this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
      this.scale.forcePortrait = true;
      this.scale.refresh();
    }
    game.load.image('loadding', 'images/loadding.gif');
  };
  this.create = function () {
    game.state.start('preload');
  };
}
game.States.preload = function () {
  this.preload = function () {
    var loddingSprite = game.add.sprite(50, game.height/2, 'loadding');
    game.load.setPreloadSprite(loddingSprite);
    game.load.image('background', 'images/bg.jpg');
    game.load.spritesheet('myplane', 'images/myplane.png', 50, 50, 5);
    game.load.image('myfire', 'images/myfire.png');
  };
  this.create = function () {
    game.state.start('main');
  };
};
game.States.main = function () {
  this.create = function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    var bg = game.add.tileSprite(0, 0, game.width, game.height, 'background');
    bg.autoScroll(0, 20);

    this.myplane = game.add.sprite(135, game.height - 50, 'myplane');
    this.myplane.animations.add('fly');
    this.myplane.animations.play('fly', 12, true);
    game.physics.arcade.enable(this.myplane);
    this.myplane.body.collideWorldBounds = true;

    this.myplane.inputEnabled = true;
    this.myplane.input.enableDrag(false);

    this.myfires = game.add.group();
    this.myfires.enableBody = true;
    this.myfires.createMultiple(50, 'myfire');
    this.myfires.setAll('outOfBoundsKill', true);
    this.myfires.setAll('checkWorldBounds', true);
    this.myStartFire = true;
    this.nextFireTime = 0;
  };
  this.update = function () {
    this.myFireBullet();
  };
  this.myFireBullet = function () {
    if (this.myplane.alive && game.time.now > this.nextFireTime) {
      var bullet = this.myfires.getFirstExists(false);
      if (bullet) {
        bullet.reset(this.myplane.x + 21, this.myplane.y -13);
        bullet.body.velocity.y = -400;
        this.nextFireTime = game.time.now + 200;
      }
    }
  }
};

game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('main', game.States.main);

game.state.start('boot');