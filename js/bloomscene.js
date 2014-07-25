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
      this.colorProgram = WebGL.loadProgram('shaders/color.vert', 'shaders/color.frag', ['a_position'], ['u_resolution', 'u_position', 'u_scale', 'u_color']);
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

      // Textures
      this.texture = Loader.loadTexture(WebGL.gl, 'res/whitecircle.png');
      // this.texture = Loader.loadTexture(WebGL.gl, 'res/tegel2.png');

      // Render targets
      this.renderTarget = WebGL.createRenderTarget(1024, 1024);
    },


    setupKernels: function() {
      this.no_kernel = [1];

      this.kernel_box = this.fillArray([], 11 * 11, 1);
      this.kernel_edge = [
        -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1
      ];
      this.kernel_sharpen = [
        0, -1,  0,
        -1,  5, -1,
         0, -1,  0 
      ];
      this.kernel_edge2 = [
        1,  1,  0,
        1,  0, -1,
        0, -1, -1
      ];
      this.kernel_gaussian = this.flattenArray(this.getGaussianKernelMatrix(5, 100));
    },

    resize: function() {},


    draw: function() {
      if (!this.isLoaded(this.textureProgram, this.texture)) {
        return;
      }
      var WebGL = this.WebGL;
      WebGL.beginDraw(Color.getArray('black', 1.0));

      // var program = this.kernel1dProgram;
      var program = this.kernelProgram;
      WebGL.useProgram(program);

      var rect = Utils._rectangle;
      var position = vec2.fromValues(0, 0);
      var resolution = vec2.fromValues(WebGL.screenWidth, WebGL.screenHeight);
      var scale = vec2.clone(resolution);
      // var textureResolution = vec2.fromValues(this.renderTarget.width, this.renderTarget.height);
      var textureResolution = resolution;
      // var kernelDirection = vec2.fromValues(1, 0);
      // var kernelsize = 11;
      // var sigma = 0.3;
      // var kernel = this.fillArray(this.get1DGaussianKernel(kernelsize, sigma), 25);






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
      WebGL.bindTexture(program.uniforms.u_texture, this.texture);
      WebGL.bindUniform(program.uniforms.u_textureresolution, textureResolution);
      // WebGL.bindUniform(program.uniforms.u_direction, kernelDirection);
      WebGL.bindUniform(program.uniforms.u_kernelsize, kernelsize, 'i');
      WebGL.gl.uniform1fv(program.uniforms.u_kernel, new Float32Array(kernel));

      WebGL.drawVertices(rect.vertexCount);
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