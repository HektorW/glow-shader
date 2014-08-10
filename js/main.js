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

	'scenes/glowscene',
	'scenes/bloomscene',
	'scenes/downsamplescene',
	'scenes/downsamplegaussianscene',
	'scenes/animationscene'
], function(
	$,

	WebGL,
	Utils,

	GlowScene,
	BloomScene,
	DownsampleScene,
	DownsampleGaussianScene,
	AnimationScene
) {

	var Main = window.Main = {
		running: true,
		lastTime: 0
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
		// DownsampleScene.init(WebGL);
		// DownsampleGaussianScene.init(WebGL);
		AnimationScene.init(WebGL);

		$(window).on('resize', resize);
	}



	function resize() {
		// WebGL.resize(window.innerWidth, window.innerHeight);
		WebGL.resize(1024, 1024);
		Utils.resize();
		// GlowScene.resize();
		// BloomScene.resize();
		// DownsampleScene.resize();
		// DownsampleGaussianScene.resize();
		AnimationScene.resize();

		$('body').css('background', 'black');

		var canvas = WebGL.canvas;
		var canvasHeight = WebGL.screenHeight;
		var windowHeight = window.innerHeight;

		var canvasMargin = Math.max(windowHeight - canvasHeight, 0) / 2;

		$(canvas).css({
			margin: 'auto',
			display: 'block',
			marginTop: canvasMargin
		});

	}


	function draw(now) {
		var time = {
			elapsed: (now - Main.lastTime) / 1000.0,
			total: now,
			last: Main.lastTime
		};
		Main.lastTime = now;

		// GlowScene.draw(time);
		// BloomScene.draw(time);
		// DownsampleScene.draw(time);
		// DownsampleGaussianScene.draw(time);
		AnimationScene.draw(time);

		if (Main.running)
			requestAnimationFrame(draw);
	}

	Main.lastTime = performance.now();

	init();
	resize();
	requestAnimationFrame(draw);
});