define(['glmatrix'], function(glMatrix) {
	var vec2 = glMatrix.vec2;


	var Utils = {
		WebGL: null,

		_rectangle: null,

		init: function(WebGL) {
			this.WebGL = WebGL;

			this.initRectangleBuffer();
			this.initCircleBuffer();
		},

		resize: function() {
			this.resolution = vec2.fromValues(this.WebGL.screenWidth, this.WebGL.screenHeight);
			// this.resolution = vec2.fromValues(512, 512);
		},

		initRectangleBuffer: function() {
			if (this._rectangle) {
				return;
			}

			var gl = this.WebGL.gl;

			var vertexPositions = new Float32Array([
				0.0, 0.0,
				1.0, 0.0,
				0.0, 1.0,
				0.0, 1.0,
				1.0, 0.0,
				1.0, 1.0
			]);

			var vertexColors = new Float32Array([
				1.0, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0,
				1.0, 1.0, 1.0, 1.0
			]);

			var vertexTexcoords = new Float32Array([
				0.0, 0.0,
				1.0, 0.0,
				0.0, 1.0,
				0.0, 1.0,
				1.0, 0.0,
				1.0, 1.0
			]);

			var vertexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);

			var colorBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);

			var texcoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, vertexTexcoords, gl.STATIC_DRAW);

			var rect = this._rectangle = {
				vertexPositions: {
					buffer: vertexBuffer,
					size: 2
				},
				vertexColors: {
					buffer: colorBuffer,
					size: 4
				},
				vertexTexcoords: {
					buffer: texcoordBuffer,
					size: 2
				}
			};

			rect.vertexCount = vertexPositions.length / rect.vertexPositions.size;
		},


		initCircleBuffer: function() {
			if (this._circle) {
				return;
			}
			var gl = this.WebGL.gl;

			var angleCount = 64;
			var delta = (Math.PI * 2) / angleCount;

			var angle = 0.0;
			var vertices = [];
			for (var i = 0; i < angleCount; i++) {
				vertices.push(0.0, 0.0); // center
				vertices.push(Math.cos(angle), Math.sin(angle));
				angle += delta;
				vertices.push(Math.cos(angle), Math.sin(angle));
			}


			var vertexPositions = new Float32Array(vertices);

			var vertexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);

			var circle = this._circle = {
				vertexPositions: {
					buffer: vertexBuffer,
					size: 2
				}
			};

			circle.vertexCount = vertexPositions.length / circle.vertexPositions.size;
		},


		//////////
		// Draw //
		//////////
		drawRectangleColor: function(program, position, scale, color, resolution) {
			var WebGL = this.WebGL;

			if (!WebGL.useProgram(program)) {
				return;
			}

			var rect = this._rectangle;
			var attributes = program.attributes;
			var uniforms = program.uniforms;

			WebGL.bindAttribBuffer(rect.vertexPositions.buffer, attributes.a_position, rect.vertexPositions.size);
			// WebGL.bindAttribBuffer(rect.vertexColors.buffer, attributes.a_color, rect.vertexColors.size);

			WebGL.bindUniform(uniforms.u_position, position);
			WebGL.bindUniform(uniforms.u_scale, scale);
			WebGL.bindUniform(uniforms.u_resolution, resolution || this.resolution);

			WebGL.bindUniform(uniforms.u_color, color);

			WebGL.drawVertices(rect.vertexCount);
		},

		drawRectangleTexture: function(program, position, scale, texture, resolution) {
			var WebGL = this.WebGL;

			if (!WebGL.useProgram(program) || (texture && texture.loaded === false)) {
				return;
			}

			var rect = this._rectangle;
			var attributes = program.attributes;
			var uniforms = program.uniforms;

			WebGL.bindAttribBuffer(rect.vertexPositions.buffer, attributes.a_position, rect.vertexPositions.size);
			WebGL.bindAttribBuffer(rect.vertexTexcoords.buffer, attributes.a_texcoord, rect.vertexTexcoords.size);

			WebGL.bindUniform(uniforms.u_position, position);
			WebGL.bindUniform(uniforms.u_scale, scale);
			WebGL.bindUniform(uniforms.u_resolution, resolution || this.resolution);

			if (texture)
				WebGL.bindTexture(uniforms.u_texture, texture);

			WebGL.drawVertices(rect.vertexCount);
		},

		drawCircleColor: function(program, position, scale, color, resolution) {
			var WebGL = this.WebGL;

			if (!WebGL.useProgram(program)) {
				return;
			}

			var circle = this._circle;
			var attributes = program.attributes;
			var uniforms = program.uniforms;

			WebGL.bindAttribBuffer(circle.vertexPositions.buffer, attributes.a_position, circle.vertexPositions.size);

			WebGL.bindUniform(uniforms.u_position, position);
			WebGL.bindUniform(uniforms.u_scale, scale);
			WebGL.bindUniform(uniforms.u_resolution, resolution || this.resolution);

			WebGL.bindUniform(uniforms.u_color, color);

			WebGL.drawVertices(circle.vertexCount);
		},




		isLoaded: function(){
      for (var i = arguments.length; i--; ) {
        if (arguments[i] && !arguments[i].loaded) {
          return false;
        }
      }
      return true;
    }
	};

	return Utils;
});