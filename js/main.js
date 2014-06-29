require.config({
	paths: {
		jquery: '../libs/jquery',
		glmatrix: '../libs/glmatrix'
	}
});

require([
	'jquery',

	'webgl',
	'webgl-util',

	'glowscene'
], function(
	$,

	WebGL,
	Utils,

	GlowScene
) {

	function init() {
		var canvas = $('#canvas').get(0);

		if (!WebGL.init(canvas)) {
			$('body').html('WebGL not supported or code is badly written ( :( ), because something went terribly wrong when initializing.');
			return;
		}

		WebGL.setDepth();
		Utils.init(WebGL);
		GlowScene.init(WebGL);

		$(window).on('resize', resize);
	}



	function resize() {
		WebGL.resize(window.innerWidth, window.innerHeight);
		Utils.resize();
		GlowScene.resize();
	}


	function draw() {
		GlowScene.draw();

		requestAnimationFrame(draw);
	}



	init();
	resize();
	requestAnimationFrame(draw);
});