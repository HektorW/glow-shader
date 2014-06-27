define(['glmatrix'], function(glMatrix) {
	var vec2 = glMatrix.vec2;


	var Utils = {
		WebGL: null,

		_rectangle: null,

		init: function(WebGL) {
			this.WebGL = WebGL;

			this.initRectangleBuffer();
		},

		resize: function() {
			this.resolution = vec2.fromValues(this.WebGL.screenWidth, this.WebGL.screenHeight);
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
				1.0, 1.0, 1.0, 0.0,
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



		//
		createRenderTarget: function(width, height) {
			var gl = this.WebGL.gl;

			var framebuffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

			var frametexture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, frametexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

			var depthbuffer = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, depthbuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, frametexture, 0);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthbuffer);

			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);

			return {
				framebuffer: framebuffer,
				frametexture: frametexture,
				depthbuffer: depthbuffer,
				width: width,
				height: height
			};
		},


		//////////
		// Draw //
		//////////
		drawRectangleColor: function(program, position, scale, color) {
			var WebGL = this.WebGL;

			if (!WebGL.useProgram(program)) {
				return;
			}

			var rect = this._rectangle;
			var attributes = program.attributes;
			var uniforms = program.uniforms;

			WebGL.bindAttribBuffer(rect.vertexPositions.buffer, attributes.a_position, rect.vertexPositions.size);
			WebGL.bindAttribBuffer(rect.vertexColors.buffer, attributes.a_color, rect.vertexColors.size);

			WebGL.bindUniform(uniforms.u_position, position);
			WebGL.bindUniform(uniforms.u_scale, scale);
			WebGL.bindUniform(uniforms.u_resolution, this.resolution);

			WebGL.bindUniform(uniforms.u_color, color);

			WebGL.drawVertices(rect.vertexCount);
		},

		drawRectangleTexture: function(program, position, scale, texture) {
			var WebGL = this.WebGL;

			if (!WebGL.useProgram(program) || !texture.loaded) {
				return;
			}

			var rect = this._rectangle;
			var attributes = program.attributes;
			var uniforms = program.uniforms;

			WebGL.bindAttribBuffer(rect.vertexPositions.buffer, attributes.a_position, rect.vertexPositions.size);
			WebGL.bindAttribBuffer(rect.vertexTexcoords.buffer, attributes.a_texcoord, rect.vertexTexcoords.size);

			WebGL.bindUniform(uniforms.u_position, position);
			WebGL.bindUniform(uniforms.u_scale, scale);
			WebGL.bindUniform(uniforms.u_resolution, this.resolution);

			WebGL.bindTexture(uniforms.u_texture, texture);

			WebGL.drawVertices(rect.vertexCount);
		}
	};

	return Utils;
});