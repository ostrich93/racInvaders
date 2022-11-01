(function() {
	function Sprite(name, speed, x, y) {
		this.name = name;
		this.animations = {};
		this.x = x;
		this.y = y;
		this.speed = typeof speed === 'number' ? speed : 0;
		this.activeAnimation = null;
		this.activeStep = 0;
		this.activeFrame = null;
		this.ticks = 0;
	}
	
	Sprite.prototype.onReady = function(handler) {
		this.onReady = handler;
	}
	
	Sprite.prototype.addAnimation = function(name, actionType) {
		this.animations[actionType] = ResourceManager.getAnimationData(name, actionType);
	}
	
	Sprite.prototype.updateCurrentFrame = function() {
		this.ticks++;
		if (this.activeStep >= this.activeAnimation.frames.length) {
			if (this.activeAnimation.repeat) {
				this.activeStep = 0;
			} else {
				this.activeStep = -1;
			}
			this.ticks = 0;
		}
		var currentFrame = this.activeAnimation.frames[this.activeStep];
		this.activeFrame = currentFrame;
	}
	window.Sprite = Sprite;
})();