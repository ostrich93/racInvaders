//ENUMS
const ActionCategoryType = {
	WALK: 0,
	DEATH: 1
};

//CONSTANTS
const BORDER_WIDTH = 1;
const SPACE_WIDTH = 1;
const X_INTERVAL = 40;
const Y_INTERVAL = 50;
const DEFAULT_X = 120;
const DEFAULT_Y = 120;
const RESET_TIMER = 10;


let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

var game;

function spritePosToImagePos(row, col, height, width) {
	return {
		x: (BORDER_WIDTH + col *(SPACE_WIDTH + width)),
		y: (BORDER_WIDTH + row *(SPACE_WIDTH + height)),
		height: height,
		width: width
	}
}

function intersects(a, b) {
	var x1 = a.x;
	var y1 = a.y;
	var x2 = b.x;
	var y2 = b.y;
	var r1 = a.x + a.width;
	var b1 = a.y + a.height;
	var r2 = b.x + b.width;
	var b2 = b.y + b.height;
	
	return !(r1 <= x2 || x1 > r2 || b1 <= y2 || y1 > b2);
}

function TitleState() {}
TitleState.prototype.enter = function() {};
TitleState.prototype.leave = function() {};
TitleState.prototype.move = function(dt) {
	if (InputManager.isKeyPressed("Space")) {
		game.moveState(new GameplayState());
	}
};
TitleState.prototype.draw = function(ctx, dt) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font="130px sans-serif;"
	ctx.fillStyle='#ffffff';
	ctx.textAlign='center';
	ctx.fillText("Space Invaders", game.width/2, game.height/2);
	ctx.fillText("Press Space to start the game", game.width/2, game.height/2 + 50);
};

function GameplayState() {
	this.player = null;
	this.enemies = [];
	this.score = 0;
	this.lives = 3;
	this.deathCount = 0;
	this.deathPoint = null;
	this.direction = 1;
	this.dropDown = false;
	this.startX = DEFAULT_X;
	this.startY = DEFAULT_Y;
	//Object Pools for bullets
	//this.bullets
	//this.enemyBullets
}

GameplayState.prototype.reset = function(options) {
	this.startX = options != null ? options.startX : DEFAULT_X;
	this.startY = options != null ? options.startY : DEFAULT_Y;
	this.lives = 3;
	this.deathCount = 0;
	this.dropDown = false;
	this.direction = 1;
	this.score = options != null ? options.score : 0;
	this.deathPoint = null;
	if (this.player == null) {
		this.player = new GameObject('ship', 4, Math.floor(game.width/2), 550, 16, 8);
		this.player.sprite.addAnimation('ship', ActionCategoryType.WALK);
		this.player.sprite.addAnimation('ship', ActionCategoryType.DEATH);
	}
	else {
		this.player.x = Math.floor(game.width/2);
		this.player.isAlive = true;
	}
	this.player.animate(ActionCategoryType.WALK);
	for (var i = 0; i < 55; i++) {
		var isOld = this.enemies[i] != null;
		var xPos = this.startX + X_INTERVAL*(i%11);
		var yPos = this.startY + Y_INTERVAL*(Math.floor(i/11));
		if (!isOld) {
			var name = "";
			if (i < 11) {
				name = 'alien2';
			}
			else if (i >= 11 && i < 33) {
				name = 'alien1';
			}
			else {
				name = 'alien0';
			}
			this.enemies.push(new GameObject(name, 40, xPos, yPos, 16, 8));
			this.enemies[i].sprite.addAnimation(name, ActionCategoryType.WALK);
			this.enemies[i].sprite.addAnimation(name, ActionCategoryType.DEATH);
		}
		else {
			this.enemies[i].x = xPos;
			this.enemies[i].y = yPos;
			this.enemies[i].isAlive = true;
		}
		this.enemies[i].animate(ActionCategoryType.WALK);
	}
};

GameplayState.prototype.enter = function() {
	this.reset();
};

GameplayState.prototype.leave = function() {};
GameplayState.prototype.move = function(dt) {
	//the order of the inputs when bullets are added should be player bullets, then enemy bullets, then players, and then enemies. This way, the player and enemy updates can simply check on the collision data of the bullets after they move.
	
	/*
		split into the following functions:
			* updateBullets
			* updatePlayer
			* updateEnemies
			* checkCollisions
	*/
	
	//1. handle input
	this.updatePlayer();
	
	this.updateEnemies(dt);
	
	//check collisions for player and death.
	if (this.player.isAlive) {
		var dying = false;
		var eIncrementer = 0;
		while (eIncrementer < this.enemies.length && !dying) {
			enemy = this.enemies[eIncrementer];
			if (intersects(this.player, enemy) || this.player.action === ActionCategoryType.DEATH) {
				dying = true;
			}
			eIncrementer++;
		}
		
		if (dying) {
			if (this.player.sprite.activeStep === -1) {
				this.deathPoint = Date.now();
				this.player.isAlive = false;
				//this.player.animate(ActionCategoryType.WALK);
				this.lives--;
			}
			else {
				this.player.animate(ActionCategoryType.DEATH);
			}
		} else {
			this.player.animate(ActionCategoryType.WALK);
		}
	}
	else {
		if (this.deathPoint/1000.0 - dt/1000.0 >= RESET_TIMER) {
			this.player.x = Math.floor(game.width/2);
			this.player.isAlive = true;
			this.player.animate(ActionCategoryType.WALK);
		}
	}
	
	//handle enemy animations
	for (var q = 0; q < this.enemies.length; q++) {
		if (!this.enemies[q].isAlive)
			continue;
		
		if (this.enemies[q].action === ActionCategoryType.DEATH) {
			if (this.enemies[q].sprite.activeStep === -1) {
				this.enemies[q].isAlive = false;
				this.deathCount++;
			}
			else {
				this.enemies[q].animate(ActionCategoryType.DEATH);
			}
		}
		else {
			this.enemies[q].animate(ActionCategoryType.WALK);
		}
	}
	
	if (this.lives <= 0) {
		game.moveState(new GameOverState());
	}
	else if (this.deathCount >= 55) {
		this.reset({startX: (this.startX + X_INTERVAL)%game.width, startY: (this.startY + Y_INTERVAL)%game.height, score: this.score});
	}
};

GameplayState.prototype.updatePlayer = function() {
	if (this.player.isAlive && this.player.action != ActionCategoryType.DEATH) {
		var leftDown = InputManager.isKeyPressed("ArrowLeft");
		var rightDown = InputManager.isKeyPressed("ArrowRight");
		if (leftDown) {
			this.player.x -= this.player.speed;
		}
		if (rightDown) {
			this.player.x += this.player.speed;
		}
		//when shooting mechanics are added, check if spacebar is pushed
		
		
		//this.player.x += this.player.dx;
		//check boundaries
		if (this.player.x < 0)
			this.player.x = 0;
		else if (this.player.x + this.player.width >= game.width) {
			this.player.x = game.width - this.player.width;
		}
	}
};

GameplayState.prototype.updateEnemies = function(dt) {
	var enemy;
	for (var m = 0; m < this.enemies.length; m++) {
		enemy = this.enemies[m];
		if (enemy.isAlive && enemy.action != ActionCategoryType.DEATH) {
			enemy.x += this.direction*(enemy.speed * dt);
			if (enemy.x + enemy.width >= game.width) {
				enemy.x = game.width - enemy.width;
				this.dropDown = true;
			}
			else if (enemy.x <= 0) {
				enemy.x = 0;
				this.dropDown = true;
			}
		}
	}
	if (this.dropDown) {
		for (var n = 0; n < this.enemies.length; n++) {
			enemy = this.enemies[n];
			if (enemy.isAlive && enemy.action != ActionCategoryType.DEATH) {
				enemy.y += Y_INTERVAL *(enemy.speed * dt);
				if (enemy.y + enemy.height >= game.height) {
					enemy.y = game.height - enemy.height;
					this.lives = 0;
				}
			}
		}
		this.direction *= -1;
		this.dropDown = false;
	}
};

GameplayState.prototype.draw = function(ctx, dt) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (this.player.isAlive && this.player.sprite.activeStep >= 0) {
		this.player.advanceAnimation(ctx);
	}
	for (var u = 0; u < this.enemies.length; u++) {
		if (this.enemies[u].isAlive && this.enemies[u].sprite.activeStep >= 0) {
			this.enemies[u].advanceAnimation(ctx);
		}
	}
	ctx.save();
	ctx.font="30px sans-serif;"
	ctx.fillStyle='#ffffff';
	ctx.textAlign='right';
	ctx.fillText("Score   " + this.score, 7*(game.width)/8, 10);
	ctx.fillText("Lives   " + this.lives, 50, game.height + 10);
	ctx.restore();
};

function GameOverState(){}
GameOverState.prototype.enter = function() {}
GameOverState.prototype.move = function(dt) {
	if (InputManager.isKeyPressed("Space")) {
		game.moveState(new GameplayState());
	}
};
GameOverState.prototype.draw = function(ctx, dt) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font="130px sans-serif;"
	ctx.fillStyle='#ffffff';
	ctx.textAlign='center';
	ctx.fillText("Game Over", game.width/2, game.height/2);
	ctx.fillText("Press Space to play again", game.width/2, game.height/2 + 50);
};

function Game(options){
	this.width = canvas.width;
	this.height = canvas.height - 20;
	this.currentState = null;
	this.lastUpdate = null;
}

Game.prototype.moveState = function(state) {
	var now = Date.now();
	var dt = (now - this.lastUpdate) / 1000.0;
	if (this.currentState != null && this.currentState.leave)
		this.currentState.leave();
	
	var lastState = this.currentState;
	
	if (this.currentState != state) {
		this.currentState = state;
		lastState = undefined;
		this.currentState.enter();
	}
	this.currentState.move(dt);
	this.currentState.draw(ctx, dt);
}

function init() {
	game = new Game({startX: 120, startY: 120});
	game.lastUpdate = Date.now();
	main();
}

function main() {
	var now = Date.now();
	var currState = game.currentState != null ? game.currentState : new TitleState();
	game.moveState(currState);
	game.lastUpdate = now;
	requestAnimationFrame(main);
}

ResourceManager.loadResources("space_invaders.png");
ResourceManager.onReady(init);