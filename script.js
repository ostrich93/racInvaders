/*
	script load order:
		inputManager.js
		resources.js
		sprite.js
		script.js
		
*/

const BORDER_WIDTH = 1;
const SPACE_WIDTH = 1;
const ProgramState = {
	TITLE: 0,
	SETUP: 1,
	GAME: 2,
	GAMEOVER: 3
};
const ActionCategoryType = {
	WALK: 0,
	DEATH: 1
};

let programState = ProgramState.TITLE;
//let canvas = document.createElement('canvas');
//canvas.width = 

let gameOver = false;

let direction = 1;
let moveDown = true;
let leftDown = false;
let rightDown = false;

var respawnTimer = 2;
var deathPoint; //(now - deathPoint)/1000 >= respawnTimer
var lastUpdate;

function spritePosToImagePos(row, col, height, width) {
	return {
		x: (BORDER_WIDTH + col *(SPACE_WIDTH + width)),
		y: (BORDER_WIDTH + row *(SPACE_WIDTH + height)),
		height: height,
		width: width
	}
}

/* let GameState = {
	lives: 3,
	enemies: [],
	moveSpeed: 4,
	direction: 1,
	bullets: [],
	ship: null
}; */


function GameState(options) {}
GameState.prototype.enterState = function(dt) {}
GameState.prototype.update = function(dt) {}
GameState.prototype.draw = function(dt, ctx) {}

//GameObject
(function() {
	function GameObject(name, speed, x, y, width, height) {
		this.name = this.name;
		this.id = -1;
		this.sprite = new Sprite(name, speed);
		this.speed = speed;
		this.x = x;
		this.y = y;
		this.dx = 0;
		this.width = width;
		this.height = height;
		this.action = 0;
		this.isAlive = true;
	}
	
	GameObject.prototype.animate = function(action) {
		var animation = this.sprite.animations[action];
		if (animation == null) return;
		if (this.action != action) {
			this.action = action;
			this.sprite.activeAnimation = animation;
			this.sprite.activeStep = 0;
		}
		this.sprite.updateCurrentFrame();
	}
	
	GameObject.prototype.advanceAnimation = function(ctx) {
		ctx.save();
		ctx.drawImage(resources.getSpriteSheet(), this.sprite.activeFrame.x, this.sprite.activeFrame.y, this.sprite.activeFrame.width, this.sprite.activeFrame.height, this.x, this.y, this.width, this.height);
		this.sprite.activeStep++;
		ctx.restore();
	}
	
	window.GameObject = GameObject;
})();

let player = new GameObject('ship', 4, Math.floor(canvas.width/2), 550, 16, 8);
player.sprite.addAnimation('ship', ActionCategoryType.WALK);
player.sprite.addAnimation('ship', ActionCategoryType.DEATH);

let enemies = [];

function main() {

}

function update() {
	
}

function render() {
	
}

function updateAliens() {
	for (var x = 0; x < enemies.length; x++) {
		var enemy = enemies[x];
		if (!enemy.isAlive)
			continue;
		else {
			if (enemy.action === ActionCategoryType.WALK) {
				enemy.x += direction * enemy.speed;
				if (enemy.x + enemy.width > canvas.width) {
					moveDown = true;
					enemy.x = canvas.width - enemy.width;
				}
				else if (enemy.x < 0) {
					moveDown = true;
					enemy.x = 0;
				}
				if (moveDown)
					enemy.y += enemy.height;
				enemy.animate(ActionCategoryType.WALK);
			}
			if (enemy.action === ActionCategoryType.DEATH) {
				//if enemy action is death and animation is finished isAlive = false;
				if (enemy.sprite.activeStep === -1)
					enemy.isAlive = false;
			}
			else {
				//if enemy action is not death and does not repeat, reset it to walk
				enemy.animate(enemy.action);
			}
		}
	}
	if (moveDown){
		direction *= -1;
		moveDown = false;
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
	
	return !(r1 <= x2 || x1 > r2 || b1 <= y2 || b1 > y2);
}

function checkCollisions() {
	for (var i = 0; i < enemies.length; i++) {
		var enemy = enemies[i];
		if (!enemy.isAlive || enemy.action = ActionCategoryType.DEATH)
			continue;
		if (enemy.y >= canvas.height) {
			gameOver = true;
			break;
		}
		if (player.isAlive) {
			if (intersects(enemy, player) && player.action != ActionCategoryType.DEATH) {
				player.animate(ActionCategoryType.DEATH);
				break;
			}
		}
	}
}

function onKeyDown(e) {
	if (e.code === "Space" && (programState == ProgramState.TITLE || programState == ProgramState.GAMEOVER)) {
		setupGame(4, 100);
		return;
	}
	
	switch(e.code) {
		case "ArrowLeft":
			leftDown = true;
			player.dx = -player.speed;
			break;
		case "ArrowRight":
			rightDown = true;
			player.dx = player.speed;
			break;
		default:
			break;
	}
}

function onKeyUp(e) {
	if (programState != ProgramState.GAME)
		return;
	switch(e.code) {
		case "ArrowLeft":
			leftDown = false;
			player.dx = 0;
			break;
		case "ArrowRight":
			rightDown = false;
			player.dx = 0;
			break;
		default:
			break;
	}
}

function reset() {
	
}



function Game(options) {
	this.lives = 3;
	this.width = options.canvas.width || 800;
	this.height = options.canvas.height || 600;
	this.fps = 50;
	this.intervalValue = 0;
	this.score = 0;
	this.startX = options.startX || 100;
	this.startY = options.startY || 200;
	this.scaleX = 1;
	this.scaleY = 1;
	this.lastUpdate = null;
	this.canvas = null;
	this.ctx = null;
	this.resetTimer = 2;
	this.enemies = [];
	this.gameOver = false;
	this.currentState = null;
};

Game.prototype.initialize = function(canvas) {
	ResourceManager.initialize();
	this.width = canvas.width;
	this.height = canvas.height;
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
};

Game.prototype.start = function() {
	this.moveState(new TitleState());
	var self = this;
	mainLoop(self);
};

Game.prototype.moveState = function(state) {
	state.enter(this);
	this.currentState = state;
};

function TitleState() {}
TitleState.prototype.enter = function() {
	ResourceManager.initialize("space_invaders.png");
}

TitleState.prototype.update = function(game, dt) {
	if (InputManager.isKeyPressed("Space")){
		game.moveState(new GameplayState(game));
	}
};

function GameplayState(game) {
	this.enemies = null;
	this.player = null;
	this.deathPoint = null;
};

GameplayState.prototype.enter = function(game) {
	this.enemies = [];
	this.player = new GameObject('ship', 4, Math.floor(game.canvas.width/2), 550, 16, 8);
	this.player.sprite.addAnimation('ship', ActionCategoryType.WALK);
	this.player.sprite.addAnimation('ship', ActionCategoryType.DEATH);
	this.deathPoint = null;
	for (var i = 0; i < 55; i++) {
		var name = "";
		var xPos = startX + 20(i%11);
		var yPos = startY + 20(i%5);
		if (i < 11) {
			name = 'alien0';
		}
		if (i >= 11 && i < 33) {
			name = 'alien1';
		}
		else {
			name = 'alien2';
		}
		this.enemies.add(new GameObject(name, 4, xPos, yPos, 16, 8));
		this.enemies[i].sprite.addAnimation(name, ActionCategoryType.WALK);
		this.enemies[i].sprite.addAnimation(name, ActionCategoryType.DEATH);
	}
}

GameplayState.prototype.updatePlayer() {
	if (this.player.isAlive && this.player.action = ActionCategoryType.WALK) {
		this.player.x += this.player.dx;
		if (this.player.x < 0)
			this.player.x = 0;
		else if (this.player.x + this.player.width >= this.width)
			this.player.x = this.width - this.player.width;
		this.player.animate(ActionCategoryType.WALK);
	}
	if (this.player.action == ActionCategoryType.DEATH && this.player.isAlive && this.player.sprite.activeStep = -1) {
		this.player.isAlive = false;
		this.lives--;
	}
	//if player finishes death animation, set isAlive to false and reduce lives.
	//if (player.isAlive && player.
}

GameplayState.prototype.update = function(game, dt) {
	if (this.player.isAlive) { 
		if (InputManager.isKeyPressed("ArrowLeft")) {
			this.player.dx = this.player.speed * dt
		} if (InputManager.isKeyPressed("ArrowRight")) {
			this.player.dx = -(this.player.speed * dt);
		}
	}
	
	if (this.player.action === ActionCategoryType.WALK) {
		this.player.x += this.player.dx;
		if (this.player.x < 0) {
			this.player.x = 0;
		} else if (this.player.x > this.player.width >= game.width) {
			this.player.x = game.width - this.player.width;
		}
		this.player.animate(ActionCategoryType.WALK);
	}
	
	if (this.player.action == ActionCategoryType.DEATH && this.player.isAlive && this.player.sprite.activeStep = -1) {
		this.player.isAlive = false;
		game.lives--;
		this.player.animate(ActionCategoryType.DEATH);
	}
}

function mainLoop(game) {
	
	var currentState = game.currentState;
	if (currentState) {
		var dt = 1/game.fps;
		var ctx = game.ctx;
		
		if (typeof currentState.update === "function")
			currentState.update(game, dt);
		
		if (typeof currentState.draw === "function")
			currentState.draw(game, dt, ctx);
	}
	requestAnimationFrame(mainLoop);
}