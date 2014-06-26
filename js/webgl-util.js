define(['glmatrix'], function(glMatrix) {
	var vec2 = glMatrix.vec2;


	var Utils = {
		WebGL: null,

		_rectangle: null,

		init: function(WebGL) {
			this.WebGL = WebGL;

			this.initRectangleBuffer();
		},

		initRectangleBuffer: function() {
			if (this._rectangle) {
				return;
			}

			var gl = this.WebGL.gl;

			var vertices = new Float32Array([
				0.0, 0.0,
				1.0, 0.0,
				0.0, 1.0,
				0.0, 1.0,
				1.0, 0.0,
				1.0, 1.0
			]);

			var buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

			this._rectangle = {
				buffer: buffer,
				vertices: vertices,
				vertexSize: 2,
			};

			this._rectangle.vertexCount = vertices.length / this._rectangle.vertexSize;
		},

		drawRectangle: function(program, position, scale, color) {
			var WebGL = this.WebGL;
			var _rectangle = this._rectangle;
			var attributes = program.attributes;
			var uniforms = program.uniforms;

			WebGL.bindAttribBuffer(_rectangle.buffer, attributes.a_position, _rectangle.vertexSize);

			WebGL.bindUniform(uniforms.u_position, position);
			WebGL.bindUniform(uniforms.u_scale, scale);
			WebGL.bindUniform(uniforms.u_resolution, vec2.fromValues(WebGL.screenWidth, WebGL.screenHeight));

			WebGL.bindUniform(uniforms.u_color, color);

			WebGL.drawVertices(_rectangle.vertexCount);
		}
	};

	return Utils;
});