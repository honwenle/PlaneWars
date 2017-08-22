var game = new Phaser.Game(320, 480, Phaser.AUTO, 'game');

// 敌人类
function Enemy() {
  this.init = function () {
    this.enemys = game.add.group();
    this.enemys.enableBody = true;
    this.enemys.createMultiple(10, 'enemy1');
    this.enemys.setAll('outOfBoundsKill', true);
    this.enemys.setAll('checkWorldBounds', true);
    this.enemyWidth = game.width - game.cache.getImage('enemy1').width;
    game.time.events.loop(1000, this.createEnemy, this);
  };
  this.createEnemy = function () {
    var en = this.enemys.getFirstExists(false);
    if (en) {
      en.reset(game.rnd.integerInRange(0, this.enemyWidth),
        -game.cache.getImage('enemy1').height);
        en.body.velocity.y = 100;
    }
  };
  this.killEnemy = function (myBullet, enemy) {
    myBullet.kill();
    enemy.kill();
  }
}

game.States = {};

// 启动前、加载“加载中图片”、调整舞台缩放
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
// 载入中画面
game.States.preload = function () {
  this.preload = function () {
    var loddingSprite = game.add.sprite(50, game.height/2, 'loadding');
    game.load.setPreloadSprite(loddingSprite);
    game.load.image('background', 'images/bg.jpg');
    game.load.spritesheet('myplane', 'images/myplane.png', 50, 50, 5);
    game.load.image('myfire', 'images/myfire.png');
    game.load.image('enemy1', 'images/enemy1.png');
  };
  this.create = function () {
    game.state.start('main');
  };
};
// 游戏主画面
game.States.main = function () {
  // 初始化引擎、背景、主角、敌人
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
    this.nextFireTime = 0;

    this.enemy1 = new Enemy();
    this.enemy1.init();
  };
  this.update = function () {
    this.myFireBullet();

    game.physics.arcade.overlap(this.enemy1.enemys, this.myplane, this.gameOver, null, this);
    game.physics.arcade.overlap(this.enemy1.enemys, this.myfires, this.enemy1.killEnemy, null, this);
  };
  // 自己发射子弹
  this.myFireBullet = function () {
    if (this.myplane.alive && game.time.now > this.nextFireTime) {
      var bullet = this.myfires.getFirstExists(false);
      if (bullet) {
        bullet.reset(this.myplane.x + 21, this.myplane.y -13);
        bullet.body.velocity.y = -400;
        this.nextFireTime = game.time.now + 200;
      }
    }
  };
  this.gameOver = function () {
    this.myplane.kill();
  }
};

game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('main', game.States.main);

game.state.start('boot');