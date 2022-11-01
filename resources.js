(function() {
	var animationCache = {};
	var sprites = {};
	var sounds = {};
	var callbacks = [];
	
	function loadResources(imgSrc) {
		if (sprites[imgSrc]) {
			return sprites[imgSrc];
		}
		var img = new Image();
		img.onload = function() {
			sprites[imgSrc] = img;
			loadAnimations();
			if (isReady()) {
				callbacks.forEach(function(cb) { cb(); });
			}
		}
		sprites[imgSrc] = false;
		img.src = imgSrc;
	}
	
	function isReady() {
		var ready = true;
		for (var s in sprites) {
			if (sprites.hasOwnProperty(s) && !sprites[s]){
				ready = false;
			}
			//also include sounds later
		}
		return ready;
	}
	
	function loadAnimations() {
		animationCache['alien0'] = [
			{
				frames: [spritePosToImagePos(0, 0, 8, 16), spritePosToImagePos(1, 0, 8, 16)],
				timePerFrame: 250,
				repeat: true
			},
			{
				frames: [spritePosToImagePos(0, 3, 8, 16)],
				timePerFrame: 250,
				repeat: false
			}
		];

		animationCache['alien1'] = [
			{
				frames: [spritePosToImagePos(0, 1, 8, 16), spritePosToImagePos(1, 1, 8, 16)],
				timePerFrame: 250,
				repeat: true
			},
			{
				frames: [spritePosToImagePos(0, 3, 8, 16)],
				timePerFrame: 250,
				repeat: false
			}
		];

		animationCache['alien2'] = [
			{
				frames: [spritePosToImagePos(0, 2, 8, 16), spritePosToImagePos(1, 2, 8, 16)],
				timePerFrame: 250,
				repeat: true
			},
			{
				frames: [spritePosToImagePos(0, 3, 8, 16)],
				timePerFrame: 250,
				repeat: false
			}
		];

		animationCache['ship'] = [
			{
				frames: [spritePosToImagePos(44/9, 0, 8, 16)],
				timePerFrame: 250,
				repeat: true
			},
			{
				frames: [spritePosToImagePos(44/9, 1, 8, 16), spritePosToImagePos(44/9, 2, 8, 16)],
				timePerFrame: 200,
				repeat: false
			}
		];
	}
	
	function getAnimationData(name, actionType) {
		return animationCache[name][actionType];
	}
	
	function getSpriteSheet() {
		return sprites["space_invaders.png"];
	}
	
	function onReady(callback) {
		callbacks.push(callback);
	}
	
	window.ResourceManager = {
		loadResources: loadResources,
		loadAnimations: loadAnimations,
		getAnimationData: getAnimationData,
		getSpriteSheet: getSpriteSheet,
		isReady: isReady,
		onReady: onReady
	};

})();