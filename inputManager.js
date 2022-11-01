(function() {
	var keyMap = {
		ArrowLeft	: false,
		ArrowRight	: false,
		Space		: false
	};

	function isKeyPressed(keyCode) {
		return keyMap[keyCode] === true;
	}

	function setKeyDown(keyEvt) {
		if (keyMap.hasOwnProperty(keyEvt.code))
			keyMap[keyEvt.code] = true;
	}

	function setKeyUp(keyEvt) {
		if (keyMap.hasOwnProperty(keyEvt.code))
			keyMap[keyEvt.code] = false;
	}
	
	window.addEventListener("keydown", function keyDown(e) {
		if (isKeyPressed(e))
			e.preventDefault();
		
		setKeyDown(e);
	});
	
	window.addEventListener("keyup", function keyUp(e) {
		if (isKeyPressed(e))
			e.preventDefault();
		
		setKeyUp(e);
	});
	
	window.InputManager = {
		isKeyPressed: isKeyPressed,
		setKeyDown	: setKeyDown,
		setKeyUp	: setKeyUp
	};
})();