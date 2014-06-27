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
	Utils.resize();
	WebGL.setDepth();

	var renderTarget = Utils.createRenderTarget(512, 512);

	var colorProgram = WebGL.loadProgram('shaders/color.vert', 'shaders/color.frag', ['a_position', 'a_color'], ['u_resolution', 'u_position', 'u_scale', 'u_color']);
	var textureProgram = WebGL.loadProgram('shaders/texture.vert', 'shaders/texture.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture']);
	var glowProgram = WebGL.loadProgram('shaders/glow.vert', 'shaders/glow.frag', ['a_position', 'a_texcoord'], []);

	var texture = Loader.loadTexture(WebGL.gl, 'res/texture.png');

	var colorRect = {
		pos: vec2.fromValues(100, 100),
		scale: vec2.fromValues(200, 50),
		color: Color.getArray('red')
	};
	var texRect = {
		pos: vec2.fromValues(500, 400),
		scale: vec2.fromValues(100, 200)
	};

	function draw() {
		// WebGL.beginDraw();

		WebGL.bindFramebuffer(renderTarget.framebuffer);
		WebGL.gl.viewport(0, 0, )

		Utils.drawRectangleColor(colorProgram, colorRect.pos, colorRect.scale, colorRect.color);

		Utils.drawRectangleTexture(textureProgram, texRect.pos, texRect.scale, texture);

		requestAnimationFrame(draw);
	}

	$(window).on('resize', function() {
		WebGL.resize(window.innerWidth, window.innerHeight);
		Utils.resize();
	});
	requestAnimationFrame(draw);
});