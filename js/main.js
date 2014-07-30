require.config({
	paths: {
		jquery: '../libs/jquery',
		glmatrix: '../libs/glmatrix',
		'dat.gui': '../libs/dat.gui'
	},

	shim: {
		'dat.gui': {
			exports: 'dat'
		}
	}
});

require([
	'jquery',

	'webgl',
	'webgl-util',

	'glowscene',
	'bloomscene',
	'downsamplescene'
], function(
	$,

	WebGL,
	Utils,

	GlowScene,
	BloomScene,
	DownsampleScene
) {

	window.Main = {
		running: true
	};

	function init() {
		var canvas = $('#canvas').get(0);

		if (!WebGL.init(canvas)) {
			$('body').html('WebGL not supported or code is badly written ( :( ), because something went terribly wrong when initializing.');
			return;
		}

		// WebGL.setDepth();
		WebGL.setBlend();
		Utils.init(WebGL);
		// GlowScene.init(WebGL);
		// BloomScene.init(WebGL);
		DownsampleScene.init(WebGL);

		$(window).on('resize', resize);
	}



	function resize() {
		// WebGL.resize(window.innerWidth, window.innerHeight);
		WebGL.resize(1024, 1024);
		Utils.resize();
		// GlowScene.resize();
		// BloomScene.resize();
		DownsampleScene.resize();
	}


	function draw() {
		// GlowScene.draw();
		// BloomScene.draw();
		DownsampleScene.draw();

		if (Main.running)
			requestAnimationFrame(draw);
	}



	init();
	resize();
	requestAnimationFrame(draw);
});