function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*global Phaser*/


var game = new Phaser.Game(1200, 600, Phaser.AUTO, '');
var game_state = {}


game_state.main = function () {};
game_state.main.prototype = {


preload: function() {
    game.load.image('sky','assets/sky.png');
    game.load.image('ground','assets/ground.png');
    game.load.spritesheet('fish', 'assets/floppingfish.png', 256, 256);
    game.load.spritesheet('firehydrant','assets/firehydrant.png',132,180);
    game.load.spritesheet('effects','assets/effects.png',96,96)
    game.load.spritesheet('blood','assets/enemies/blood.png',128,128)
    game.load.image('waterdrop','assets/water.png')
    
    //enemies
    game.load.spritesheet('standardman','assets/enemies/standardman.png',192,192)
},


create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE)
    var sky = game.add.sprite(0,0,'sky')
    sky.scale.setTo(1.2,1.2)


    this.platforms = game.add.group()
    this.platforms.enableBody = true
    this.cursors = game.input.keyboard.createCursorKeys()
    
    var ground = this.platforms.create(0, game.world.height - 64, 'ground')
    ground.scale.setTo(1.58,1.58)
    ground.body.immovable = true
    
    //firehydrant
    this.firehydrant = game.add.sprite(game.world.width/2 - 64, game.world.height - 208, 'firehydrant')
    this.firehydrant.scale.setTo(.8,.8)
    this.firehydrant.animations.add('damage',[0,1,2], 50, true)
    this.firehydrant.damageCooldown = 15
    this.firehydrant.beingDamaged = false
    game.physics.arcade.enable(this.firehydrant)
    
    //water drops
    this.waterdrops = game.add.group()
    this.waterdrops.enableBody = true
    
    //enemies
    this.enemies = game.add.group()
    game.physics.arcade.enable(this.enemies)
    this.enemiesList = {}
    //standard guy
    this.enemiesList.standardman = game.add.sprite(0,0,"standardman")
    this.enemiesList.standardman.speed = 75
    this.enemiesList.standardman.visible = false;
    
    //player
    this.player = game.add.sprite(game.world.width/2, game.world.height - 200, 'fish')
    this.player.scale.setTo(0.4,0.4)
    game.physics.arcade.enable(this.player)
    
    this.player.body.bounce.y = 0
    this.player.body.gravity.y = 1000
    this.player.body.collideWorldBounds = true
    this.player.animations.add('air', [8,9,10,11,12,13,14], 14, true)
    this.player.animations.add('left', [6,7],12, true)
    this.player.animations.add('right', [4,5], 12, true)
    this.player.animations.add('twitchleft', [0,1], 4, true)
    this.player.animations.add('twitchright', [2,3], 4, true)
    this.player.animations.add('slapright', [15,16,17,18,19,20,21], 45, true)
    this.player.animations.add('slapleft', [22,23,24,25,26,27,28], 45, true)
    
    this.player.action = "grounded"
    this.player.jumpCooldown = 50
    this.player.hitCooldown = 0
    this.player.damage = 15
    this.player.dropsPerHit = 2
    this.player.maxWater = 100
    this.player.water = 100
    this.player.waterDropValue = 1
    this.player.waterLoss = 0.1
    
    //effects
    this.effects = game.add.sprite(0,0,'effects')
    this.effects.animations.add('none', [0], 1, true)
    this.effects.animations.add('flashjump', [1,2,3,4], 20,true)
    game.physics.arcade.enable(this.effects)
    this.effects.body.gravity.y = 0
    
    //blood effects
    this.blood = game.add.group()
    
    
    //game information
    this.level = 1
    
    
    //player information
    this.water = 25
    this.maxwater = 25
    
    //keyboard
    this.X = this.game.input.keyboard.addKey(Phaser.Keyboard.X);
},


update: function() {
    //collisions are important
    game.physics.arcade.collide(this.player, this.platforms)
    game.physics.arcade.collide(this.enemies, this.platforms)
    
    
    //player movement code
    
    if (this.cursors.left.isDown  && this.player.body.touching.down) {
        if (this.player.animations.currentAnim.frame === 7){
            this.player.body.velocity.y = getRandomInt(-200,-170)
        }
        this.player.body.velocity.x = -150
        this.player.animations.play('left')
        this.player.dir = "left"
        this.player.action = "walking"
    }
    else if (this.cursors.right.isDown && this.player.body.touching.down) {
        if (this.player.animations.currentAnim.frame === 5){
            this.player.body.velocity.y = getRandomInt(-200,-170)
        }
        this.player.body.velocity.x = 150
        this.player.animations.play('right')
        this.player.dir = "right"
        this.player.action = "walking"
    }
    else if (this.cursors.left.isDown){
        this.player.body.velocity.x = -150
        this.player.dir = "left"
    }
    else if (this.cursors.right.isDown){
        this.player.body.velocity.x = 150
        this.player.dir = "right"
    }
    else if (this.player.body.touching.down) {
        this.player.body.velocity.x = 0
        this.player.action = "grounded"
    }
    
    
    if (!this.player.body.touching.down && this.X.isDown && this.player.action === "jumping") {
        if(this.player.dir === "right"){
            this.player.animations.play('slapright',15,true,false)   
        }
        else {
            this.player.animations.play('slapleft',15,true,false)   
        }
        this.player.action = "slapping"
    }
    else if (!this.player.body.touching.down && this.player.action != "slapping") {
        this.player.animations.play('air')
    } 
    else if (this.cursors.left.isUp && this.cursors.right.isUp && this.player.body.touching.down) {
        if (this.player.dir === "right"){
            this.player.animations.play('twitchleft')
        }
        else {
            this.player.animations.play('twitchright')
        }
    }
    
    if (this.cursors.left.isUp && this.cursors.right.isUp) {
        this.player.body.velocity.x = 0.95 * this.player.body.velocity.x
    }
    
    if (this.player.animations.currentAnim.frame === 21 || this.player.animations.currentAnim.frame === 28){
        this.player.action = "jumping"
        this.player.animations.play('air')
    }
    
    if (this.cursors.up.isDown && this.player.body.touching.down){
        this.player.body.velocity.y = -400
        this.player.action = "jumping"
        this.player.jumpCooldown = 20
    }
    
    
    //airjumping code
    if (!this.player.body.touching.down){
        this.player.jumpCooldown -= 1
        if(this.player.jumpCooldown <= 0){
            this.player.jumpCooldown = 0
        }
    }
    
    if (this.cursors.up.isDown && this.player.jumpCooldown == 0){
        this.player.body.velocity.y = -400
        this.effects.x = this.player.x+5
        this.effects.y = this.player.y+20
        if(this.player.body.velocity.x < 40 && this.player.body.velocity.x > -40){
            this.effects.body.rotation = 0
        }
        else if(this.player.dir === "right"){
            this.effects.body.rotation = 15
        }
        else if(this.player.dir === "left"){
            this.effects.body.rotation = -15
        }
        this.effects.animations.play('flashjump')
        this.player.action = "jumping"
        this.player.jumpCooldown = 25
    }
    
    if (this.effects.animations.currentAnim.frame === 4){
        this.effects.animations.stop()
        this.effects.frame = 0
    }
    
    
    //player hitting firehydrant
    if(this.player.hitCooldown > 0){
        this.player.hitCooldown--
    }
    if ((this.player.animations.currentAnim.frame === 24 || this.player.animations.currentAnim.frame === 17) && this.player.hitCooldown === 0){
        if(game.physics.arcade.overlap(this.player, this.firehydrant)){
            this.player.hitCooldown=10
            for(var i=0;i<this.player.dropsPerHit;i++){
                this.shootwater()   
                }
            this.firehydrant.animations.play('damage')
            this.firehydrant.beingDamaged = true
        }
    }
    
    if(this.firehydrant.beingDamaged === true){
        this.firehydrant.damageCooldown--
        this.firehydrant.x = game.world.width/2 - 64 + getRandomInt(-10,10)
        if(this.firehydrant.damageCooldown === 0){
            this.firehydrant.beingDamaged = false
            this.firehydrant.damageCooldown = 15
            this.firehydrant.animations.stop()
            this.firehydrant.frame = 0
        }
    }
    
    
    game.physics.arcade.overlap(this.player, this.enemies, function(player, enemy){
        if (this.player.animations.currentAnim.frame === 24 || this.player.animations.currentAnim.frame === 17 && enemy.beingDamaged === 0){
            enemy.beingDamaged = 40
            this.bloodSplatter(this.player.x, this.player.y, this.player.dir)
        }
    }, null, this)
    
    
    //enemy updates
    this.enemies.forEach(function(enemy){
        if(enemy.beingDamaged )
        enemy.beingDamaged--
    })
    
    //blood updates
    this.blood.filter(blood => blood.animations.currentAnim.frame === 4 || blood.animations.currentAnim.frame === 9).callAll('destroy')
    
    //water drop updates
    this.waterdrops.forEach(function(drop){
        var dy = drop.lasty - drop.y
        var dx = drop.lastx - drop.x
        var theta = Math.atan2(dy,dx)
        theta = theta * (180/Math.PI)
        drop.body.rotation = Math.round((theta + 90)/45)*45
        drop.lasty = drop.y
        drop.lastx = drop.x
        drop.collectableCooldown++
    })
    this.waterdrops.filter(waterdrop => waterdrop.y >= game.world.height).callAll('destroy');
    
    //check if waterdrop touching player
        //if(game.physics.arcade.overlap){
          //  drop.kill
        //}
    
},

shootwater: function(){
    var waterdrop = this.waterdrops.create(0,0,'waterdrop')
    waterdrop.visible = false
    game.physics.arcade.enable(waterdrop)
    
    waterdrop.x = this.firehydrant.x + this.firehydrant.width/2
    waterdrop.y = this.firehydrant.y
    waterdrop.lastx = waterdrop.x
    waterdrop.lasty = waterdrop.y
    waterdrop.scale.setTo(0.18,0.18)
    waterdrop.visible = true
    waterdrop.body.gravity.y = 400
    waterdrop.body.velocity.y = getRandomInt(-450,-300)
    waterdrop.body.velocity.x = getRandomInt(-125,125)
    waterdrop.collectableCooldown = -50
    this.spawnAverageEnemy("standardman")
    
},

spawnAverageEnemy: function(name){
    var x = 0
    var direction = this.enemiesList[name].speed
    var animation = "walkright"
    if(Math.random() > .5){
        x = game.width
        direction = direction * -1
        animation = "walkleft"
    }
    var enemy = this.enemies.create(x, 0, name)
    enemy.scale.setTo(.8,.8)
    enemy.animations.add('walkright', [2,3], 10, true)
    enemy.animations.add('walkleft', [0,1], 10, true)
    enemy.animations.add('damageright', [5], 10, true)
    enemy.animations.add('damageleft', [4], 10, true)
    enemy.animations.add('death', [6], 10, true)
    enemy.animations.play(animation)
    game.physics.arcade.enable(enemy)
    enemy.body.velocity.x = direction
    enemy.body.gravity.y = 400
    enemy.beingDamaged = 0
    enemy.visible = true
},

bloodSplatter: function(x,y,direction){
    var blood = this.blood.create(x + this.player.width/2 ,y + this.player.width/2,'blood')
    blood.scale.setTo(.5,.5)
    blood.animations.add('left',[0,1,2,3,4],15,true)
    blood.animations.add('right',[5,6,7,8,9],15,true)
    blood.animations.play(direction)
},
}
game.state.add('main', game_state.main);
game.state.start('main');