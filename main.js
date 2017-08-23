var game = new Phaser.Game(320, 480, Phaser.AUTO, 'game');
var score = 0;

// 敌人类
function Enemy(_game) {
  this.init = function () {
    this.enemys = game.add.group();
    this.enemys.enableBody = true;
    this.enemys.createMultiple(10, 'enemy1');
    this.enemys.setAll('outOfBoundsKill', true);
    this.enemys.setAll('checkWorldBounds', true);
    this.enemyWidth = game.width - game.cache.getImage('enemy1').width;
    game.time.events.loop(1000, this.createEnemy, this);

    this.enemyBullets = game.add.group();
    this.enemyBullets.enableBody = true;
    this.enemyBullets.createMultiple(100, 'enemyfire');
    this.enemyBullets.setAll('outOfBoundsKill', true);
    this.enemyBullets.setAll('checkWorldBounds', true);

    this.explodes = game.add.group();
    this.explodes.createMultiple(10, 'explode1');
    this.explodes.forEach(function (ex) {
      ex.animations.add('explode1')
    }, this);
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
    var ex = this.explodes.getFirstExists(false);
    ex.reset(enemy.x, enemy.y);
    ex.play('explode1', 30, false, true);
    score += 10;
    _game.updateText();
  };
  this.fire = function () {
    this.enemys.forEachExists(function (en) {
      var bullet = this.enemyBullets.getFirstExists(false);
      if (bullet) {
        if (game.time.now > (en.nextFireTime || 0)) {
          bullet.reset(en.x + 25, en.y + 41);
          bullet.body.velocity.y = 300;
          en.nextFireTime = game.time.now + 700;
        }
      }
    }, this);
  };
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
    game.load.spritesheet('explode1', 'images/explode1.png', 57, 41, 3);
    game.load.image('myfire', 'images/myfire.png');
    game.load.image('enemyfire', 'images/enemyfire.png');
    game.load.image('enemy1', 'images/enemy1.png');
    game.load.image('love', 'images/love.png');
  };
  this.create = function () {
    game.state.start('main');
  };
};
// 游戏主画面
game.States.main = function () {
  // 初始化引擎、背景、主角、敌人、记分板
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
    this.mylv = 1;

    this.myfires = game.add.group();
    this.myfires.enableBody = true;
    this.myfires.createMultiple(50, 'myfire');
    this.myfires.setAll('outOfBoundsKill', true);
    this.myfires.setAll('checkWorldBounds', true);
    this.nextFireTime = 0;
    this.myfireWidth = game.cache.getImage('myfire').width;

    this.enemy1 = new Enemy(this);
    this.enemy1.init();

    var style = {font: "16px Arial", fill: "#0ff"};
    this.text = game.add.text(0, 0, "Score: 0", style);

    this.love = game.add.sprite(0, 0, 'love');
    game.physics.arcade.enable(this.love);
    this.love.outOfBoundsKill = true;
    this.love.checkWorldBounds = true;
    this.love.kill();
    game.time.events.loop(15000, this.createLove, this.love);
  };
  this.update = function () {
    this.myFireBullet();
    this.enemy1.fire();

    game.physics.arcade.overlap(this.enemy1.enemyBullets, this.myplane, this.hitMe, null, this);
    game.physics.arcade.overlap(this.enemy1.enemys, this.myplane, this.hitMe, null, this);
    game.physics.arcade.overlap(this.enemy1.enemys, this.myfires, this.enemy1.killEnemy, null, this.enemy1);
    game.physics.arcade.overlap(this.myplane, this.love, this.getLove, null, this);
  };
  // 自己发射子弹
  this.myFireBullet = function () {
    if (this.myplane.alive && game.time.now > this.nextFireTime) {
      var positionArr = [
        [this.myplane.x + this.myplane.width/2 - this.myfireWidth/2],
        [this.myplane.x, this.myplane.x + this.myplane.width - this.myfireWidth],
      ];
      positionArr.push(positionArr[0].concat(positionArr[1]));
      positionArr[this.mylv-1].forEach(function (pos, i) {
        var bullet = this.myfires.getFirstExists(false);
        if (bullet) {
          bullet.reset(pos, this.myplane.y - bullet.height);
          bullet.body.velocity.y = -400;
          if (this.mylv == 3) {
            bullet.body.velocity.x = [0, -30, 30][i];
          }
          this.nextFireTime = game.time.now + 200;
        }
      }, this);
    }
  };
  this.hitMe = function (myplane, bullet) {
    bullet.kill();
    this.mylv -= 1;
    console.log(this.mylv)
    if (this.mylv <= 0) {
      this.gameOver();
    }
  };
  this.gameOver = function () {
    this.myplane.kill();
    document.title = '飞机大战 我在击落了' + (score / 10) + '架飞机';
  };
  this.updateText = function() {
    this.text.setText("Score: " + score);
  };

  this.createLove = function () {
    this.reset(game.rnd.integerInRange(0, game.width - game.cache.getImage('love').width),
      -game.cache.getImage('love').height);
    this.body.velocity.y = 50;
  };
  this.getLove = function () {
    console.log(this.mylv)
    this.mylv = Math.min(this.mylv + 1, 3);
    console.log(this.mylv)
    this.love.kill();
  }
};

game.state.add('boot', game.States.boot);
game.state.add('preload', game.States.preload);
game.state.add('main', game.States.main);

game.state.start('boot');