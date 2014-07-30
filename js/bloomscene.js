define([
  'jquery',

  'webgl-util',
  'glmatrix',
  'loader',

  'color'
], function(
  $,

  Utils,
  glMatrix,
  Loader,

  Color
) {
  var vec2 = glMatrix.vec2;
  var blackColor = Color.getArray('black', 1.0);


  var BloomScene = {
    init: function(WebGL) {
      this.WebGL = WebGL;

      this.load();
      this.setupKernels();

      $(window)
        .on('mousedown', $.proxy(function() { this.mousedown = true; }, this))
        .on('mouseup', $.proxy(function() { this.mousedown = false; }, this));
    },


    load: function() {
      var WebGL = this.WebGL;

      // Programs
      this.textureProgram = WebGL.loadProgram('shaders/texture.vert', 'shaders/texture.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture']);
      this.kernel1dProgram = WebGL.loadProgram(
        'shaders/texture.vert', 'shaders/kernel_1d.frag',
        ['a_position', 'a_texcoord'],
        ['u_resolution', 'u_position', 'u_scale', 'u_texture', 'u_textureresolution', 'u_direction', 'u_kernel', 'u_kernelsize']
      );
      this.kernelProgram = WebGL.loadProgram(
        'shaders/texture.vert', 'shaders/kernel.frag',
        ['a_position', 'a_texcoord'],
        ['u_resolution', 'u_position', 'u_scale', 'u_texture', 'u_textureresolution', 'u_kernel', 'u_kernelsize']
      );
      this.blendProgram = WebGL.loadProgram('shaders/texture.vert', 'shaders/blend.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture1', 'u_texture2']);

      // Textures
      this.diffuseTexture = Loader.loadTexture(WebGL.gl, 'res/diffuse_square.png');
      this.glowTexture = Loader.loadTexture(WebGL.gl, 'res/glow_square_blur.png');

      // Render targets
      this.rtGlowSources = WebGL.createRenderTarget(1024, 1024);
    },


    setupKernels: function() {
      this.no_kernel = [1];

      this.kernel_box = this.fillArray([], 11 * 11, 1);
      this.kernel_gaussian = this.flattenArray(this.getGaussianKernelMatrix(5, 100));
    },

    resize: function() {},


    draw: function() {
      if (!this.isLoaded(this.textureProgram, this.diffuseTexture, this.glowTexture, this.kernelProgram, this.kernel1dProgram, this.blendProgram)) {
        return;
      }
      var WebGL = this.WebGL;

      this.drawGlowParts(WebGL);
      if (window.Main.blend) {
        this.drawBlend(WebGL);
      } else {
        this.drawDiffuse(WebGL);
        // this.drawResults(WebGL);
      }

      /*WebGL.beginDraw(Color.getArray('black', 1.0));

      var program = this.kernelProgram;
      WebGL.useProgram(program);

      var rect = Utils._rectangle;
      var position = vec2.fromValues(0, 0);
      var resolution = vec2.fromValues(WebGL.screenWidth, WebGL.screenHeight);
      var scale = vec2.clone(resolution);
      var textureResolution = resolution;




      var use_kernel = this.mousedown ? this.no_kernel : this.kernel_gaussian;
      var kernelsize = Math.sqrt(use_kernel.length);
      var kernel = this.fillArray(use_kernel, 121);

      // attributes
      WebGL.bindAttribBuffer(rect.vertexPositions.buffer, program.attributes.a_position, rect.vertexPositions.size);
      WebGL.bindAttribBuffer(rect.vertexTexcoords.buffer, program.attributes.a_texcoord, rect.vertexTexcoords.size);

      // vert uniforms
      WebGL.bindUniform(program.uniforms.u_position, position);
      WebGL.bindUniform(program.uniforms.u_scale, scale);
      WebGL.bindUniform(program.uniforms.u_resolution, resolution);

      // frag uniforms
      WebGL.bindTexture(program.uniforms.u_texture, this.diffuseTexture);
      WebGL.bindUniform(program.uniforms.u_textureresolution, textureResolution);
      WebGL.bindUniform(program.uniforms.u_kernelsize, kernelsize, 'i');
      WebGL.gl.uniform1fv(program.uniforms.u_kernel, new Float32Array(kernel));

      WebGL.drawVertices(rect.vertexCount);*/
    },

    drawGlowParts: function(WebGL) {
      WebGL.setRenderTarget(this.rtGlowSources);
      WebGL.beginDraw(Color.getArray('black', 1.0));

      var res = vec2.fromValues(1, 1);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 0), res, this.glowTexture, res);

      WebGL.getTextureFromRenderTarget(this.rtGlowSources);
    },

    drawDiffuse: function(WebGL) {
      WebGL.setRenderTarget(null);
      WebGL.beginDraw(blackColor);

      var res = vec2.fromValues(1, 1);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 0), res, this.diffuseTexture, res);
    },


    drawResults: function(WebGL) {
      WebGL.setRenderTarget(null);
      WebGL.beginDraw(blackColor);

      var res = vec2.fromValues(1, 1);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 0), res, this.rtGlowSources.frametexture, res);
    },

    drawBlend: function(WebGL) {
      var gl = WebGL.gl;
      // gl.disable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      // gl.blendFunc(gl.ONE, gl.ONE);
      gl.enable(gl.BLEND);

      WebGL.setRenderTarget(null);
      WebGL.beginDraw(blackColor);      

      var program = this.blendProgram
      WebGL.useProgram(program);

      var rect = Utils._rectangle;
      var position = vec2.fromValues(0, 0);
      var res = vec2.fromValues(1, 1);

      // attributes
      WebGL.bindAttribBuffer(rect.vertexPositions.buffer, program.attributes.a_position, rect.vertexPositions.size);
      WebGL.bindAttribBuffer(rect.vertexTexcoords.buffer, program.attributes.a_texcoord, rect.vertexTexcoords.size);

      // vert uniforms
      WebGL.bindUniform(program.uniforms.u_position, position);
      WebGL.bindUniform(program.uniforms.u_scale, res);
      WebGL.bindUniform(program.uniforms.u_resolution, res);

      // frag uniforms
      WebGL.bindTexture(program.uniforms.u_texture1, this.diffuseTexture, 0);
      // WebGL.bindTexture(program.uniforms.u_texture2, this.diffuseTexture, 1);
      // WebGL.bindTexture(program.uniforms.u_texture2, this.glowTexture, 1);
      WebGL.bindTexture(program.uniforms.u_texture2, this.rtGlowSources.frametexture, 1);

      WebGL.drawVertices(rect.vertexCount)
    },






    fillArray: function(array, size, value) {
      var res = [];
      res.push.apply(res, array)
      for (var i = Math.max(size - array.length, 0); i--; ) {
        res.push(value || 0.0);
      }
      return res;
    },

    flattenArray: function(array) {
      var res = [];
      for (var i = array.length; i--; ) {
        var a = array[i];
        if (a.length) {
          for (var j = a.length; j--; ) {
            res.push(a[j]);
          }
        } else {
          res.push(a);
        }
      }

      return res;
    },

    isLoaded: function(){
      for (var i = arguments.length; i--; ) {
        if (arguments[i] && !arguments[i].loaded) {
          return false;
        }
      }
      return true;
    },


    getGaussianKernelMatrix: function(size, sigma) {
      var pow = Math.pow, PI = Math.PI, exp = Math.exp;
      var sigmasq = pow(sigma, 2);
      var mean = parseInt(size / 2, 10);
      var x, y, i, sum = 0.0;

      var kernel = Array(size);
      for (x = size; x--; ) {
        kernel[x] = Array(size);
        for (y = size; y--; ) {
          sum += kernel[x][y] = (1 / (2 * PI * sigmasq)) * exp(-(pow(x - mean, 2) + pow(y - mean, 2)) / (2 * sigmasq));
        }
      }

      // normalize
      for (x = size; x--; ) {
        for (y = size; y--; ) {
          kernel[x][y] /= sum;
          // kernel[x][y] *= 3.0;
        }
      }

      return kernel;
    },

    get1DGaussianKernel: function(size, sigma) {
      var matrix = this.getGaussianKernelMatrix(size, sigma);
      var row = Array(size);
      var mean = parseInt(size / 2, 10);

      for (var i = size; i--; ) {
        row[i] = matrix[i][mean];
      }

      return row;
    }

  };


  return BloomScene;

});