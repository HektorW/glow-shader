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

	'color'
], function(
	$,

	WebGL,
	Utils,
	glMatrix,

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

	var program = WebGL.loadProgram('shaders/color.vert', 'shaders/color.frag', ['a_position'], ['u_resolution', 'u_position', 'u_scale', 'u_color'], draw);


	function draw() {
		WebGL.beginDraw();

		WebGL.useProgram(program);

		Utils.drawRectangle(program, vec2.fromValues(100, 100), vec2.fromValues(200, 50), Color.getArray('red'));
	}

	window.draw = draw;
});