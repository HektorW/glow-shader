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

	var renderTarget = Utils.createRenderTarget(2048, 2048);

	var colorProgram = WebGL.loadProgram('shaders/color.vert', 'shaders/color.frag', ['a_position', 'a_color'], ['u_resolution', 'u_position', 'u_scale', 'u_color']);
	var textureProgram = WebGL.loadProgram('shaders/texture.vert', 'shaders/texture.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture']);
	var glowProgram = WebGL.loadProgram('shaders/glow.vert', 'shaders/glow.frag', ['a_position', 'a_texcoord'], []);

	var texture = Loader.loadTexture(WebGL.gl, 'res/texture.png');

	var colorRect = {
		pos: vec2.fromValues(100, 100),
		scale: vec2.fromValues(600, 500),
		color: Color.getArray('red')
	};
	var texRect = {
		pos: vec2.fromValues(500, 400),
		scale: vec2.fromValues(600, 600)
	};

	function draw() {
		var gl = WebGL.gl;
		// WebGL.beginDraw();

		WebGL.bindFramebuffer(renderTarget.framebuffer);
		WebGL.gl.viewport(0, 0, renderTarget.width, renderTarget.height);
		WebGL.beginDraw();

		Utils.drawRectangleColor(colorProgram, colorRect.pos, colorRect.scale, colorRect.color);
		Utils.drawRectangleTexture(textureProgram, texRect.pos, texRect.scale, texture);

		gl.bindTexture(gl.TEXTURE_2D, renderTarget.frametexture);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

		WebGL.bindFramebuffer(null);
		WebGL.gl.viewport(0, 0, WebGL.screenWidth, WebGL.screenHeight);
		WebGL.beginDraw();

		// Utils.drawRectangleTexture(textureProgram, texRect.pos, texRect.scale, texture);
		Utils.drawRectangleTexture(textureProgram, texRect.pos, texRect.scale, renderTarget.frametexture);

		requestAnimationFrame(draw);
	}

	$(window).on('resize', function() {
		WebGL.resize(window.innerWidth, window.innerHeight);
		Utils.resize();
	});
	requestAnimationFrame(draw);
});