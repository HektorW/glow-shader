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
	'glmatrix',
	'loader',

	'color'
], function(
	$,

	WebGL,
	Utils,
	glMatrix,
	Loader,

	Color
) {
	var vec2 = glMatrix.vec2;

	var canvas = $('#canvas').get(0);

	if (!WebGL.init(canvas)) {
		$('body').html('WebGL not supported or code is badly written ( :( ), because something went terribly wrong when initializing.');
		return;
	}
	Utils.init(WebGL);

	WebGL.resize(window.innerWidth, window.innerHeight);
	WebGL.setDepth();

	var colorProgram = WebGL.loadProgram('shaders/color.vert', 'shaders/color.frag', ['a_position', 'a_color'], ['u_resolution', 'u_position', 'u_scale', 'u_color'], draw);
	var textureProgram = WebGL.loadProgram('shaders/texture.vert', 'shaders/texture.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture'], draw);
	var glowProgram = WebGL.loadProgram('shaders/glow.vert', 'shaders/glow.frag', ['a_position', 'a_texcoord'], [], draw);

	var texture = Loader.loadTexture(WebGL.gl, 'res/texture.png', draw);


	function draw() {
		WebGL.beginDraw();

		Utils.drawRectangleColor(colorProgram, vec2.fromValues(100, 100), vec2.fromValues(200, 50), Color.getArray('red'));

		Utils.drawRectangleTexture(textureProgram, vec2.fromValues(500, 400), vec2.fromValues(100, 200), texture);
	}

	$(window).on('resize', function() {
		WebGL.resize(window.innerWidth, window.innerHeight);
		draw();
	});
	window.draw = draw;
});