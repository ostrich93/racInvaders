(function() {
	function GameObject(name, speed, x, y, width, height) {
		this.name = name;
		this.id = -1;
		this.sprite = new Sprite(name, speed, x, y);
		this.speed = speed;
		this.x = x;
		this.y = y;
		this.dx = 0;
		this.width = width;
		this.height = height;
		this.action = -1;
		this.isAlive = true;
	}
	
	GameObject.prototype.animate = function(action) {
		var animation = this.sprite.animations[action];
		if (animation == null) return;
		if (this.action != action) {
			this.action = action;
			this.sprite.activeAnimation = animation;
			this.sprite.ticks = 0;
			this.sprite.activeStep = 0;
		}
		this.sprite.updateCurrentFrame();
	}
	
	GameObject.prototype.advanceAnimation = function(ctx) {
		ctx.save();
		ctx.drawImage(ResourceManager.getSpriteSheet(), this.sprite.activeFrame.x, this.sprite.activeFrame.y, this.sprite.activeFrame.width, this.sprite.activeFrame.height, this.x, this.y, this.width, this.height);
		if (this.sprite.ticks >= 32) {
			this.sprite.ticks = 0;
			this.sprite.activeStep++;
		}
		ctx.restore();
	}
	
	window.GameObject = GameObject;
})();