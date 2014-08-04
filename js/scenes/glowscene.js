define([
  'webgl-util',
  'glmatrix',
  'loader',

  'color'
], function(
  Utils,
  glMatrix,
  Loader,

  Color
) {
  var vec2 = glMatrix.vec2;
  vec2.n = function(x, y) {
    return vec2.fromValues(x, y);
  };


  var GlowScene = {
    init: function(WebGL) {
      this.WebGL = WebGL;

      window.F = this;

      this.load();

    },


    load: function() {
      WebGL = this.WebGL;

      this.renderTargetScene = WebGL.createRenderTarget(1024, 1024);
      this.renderTargetGlowFirst = WebGL.createRenderTarget(1024, 1024);
      this.renderTargetGlowSecond = WebGL.createRenderTarget(1024, 1024);
      this.renderTargetResult = WebGL.createRenderTarget(1024, 1024);

      this.colorProgram = WebGL.loadProgram('shaders/color.vert', 'shaders/color.frag', ['a_position'], ['u_resolution', 'u_position', 'u_scale', 'u_color']);
      this.textureProgram = WebGL.loadProgram('shaders/texture.vert', 'shaders/texture.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture']);
      this.glowProgram = WebGL.loadProgram('shaders/texture.vert', 'shaders/glow.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture', 'u_textureresolution', 'u_direction']);
      this.blendProgram = WebGL.loadProgram('shaders/texture.vert', 'shaders/blend.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture', 'u_textureglow']);

      this.texture = Loader.loadTexture(WebGL.gl, 'res/texture.png');

      this.resize();
    },


    resize: function() {
      this.screenRect = {
        pos: vec2.fromValues(0, 0),
        scale: vec2.fromValues(window.innerWidth, window.innerHeight)
      };
    },

    draw: function() {
      this.renderScene();

      this.renderBlur();
      
      this.renderFrameTextures();
    },


    renderScene: function() {
      var WebGL = this.WebGL;

      WebGL.setRenderTarget(this.renderTargetScene);
      WebGL.beginDraw(Color.getArray('black', 1.0));

      Utils.drawCircleColor(this.colorProgram, vec2.n(500, 300), vec2.n(50, 50), Color.getArray('white', 1.0)/*, vec2.n(1024, 1024)*/);

      WebGL.getTextureFromRenderTarget(this.renderTargetScene);
    },

    renderBlur: function() {
      var WebGL = this.WebGL;

      var pos = vec2.n(0, 0);
      var scale = vec2.n(window.innerWidth, window.innerHeight);

      var target, program;

      var glowAmount = (Math.cos(performance.now() * 0.001) + 1.0) * 3.0 + 5.0;
      // var glowAmount = 10.0;


      // First pass
      target = this.renderTargetGlowFirst;
      program = this.glowProgram;
      if (!WebGL.useProgram(program))
        return;

      WebGL.setRenderTarget(target);
      WebGL.beginDraw(Color.getArray('black', 1.0));

      WebGL.bindUniform(program.uniforms.u_textureresolution, vec2.n(target.width, target.height));
      WebGL.bindUniform(program.uniforms.u_direction, vec2.n(glowAmount, 0));

      Utils.drawRectangleTexture(program, pos, scale, this.renderTargetScene.frametexture);
      WebGL.getTextureFromRenderTarget(target);


      // Second pass
      target = this.renderTargetGlowSecond;
      if (!WebGL.useProgram(program))
        return;

      WebGL.setRenderTarget(target);
      WebGL.beginDraw(Color.getArray('black', 1.0));

      WebGL.bindUniform(program.uniforms.u_textureresolution, vec2.n(target.width, target.height));
      WebGL.bindUniform(program.uniforms.u_direction, vec2.n(0, glowAmount));

      Utils.drawRectangleTexture(program, pos, scale, this.renderTargetGlowFirst.frametexture);
      WebGL.getTextureFromRenderTarget(target);


      // add
      target = this.renderTargetResult;
      program = this.blendProgram;
      // program = this.blendProgram;
      if (!WebGL.useProgram(program))
        return;

      WebGL.setRenderTarget(target);
      WebGL.beginDraw(Color.getArray('black', 1.0));

      WebGL.bindTexture(program.uniforms.u_texture, this.renderTargetScene.frametexture, 1);
      WebGL.bindTexture(program.uniforms.u_textureglow, this.renderTargetGlowSecond.frametexture, 0);

      Utils.drawRectangleTexture(program, pos, scale);
      // Utils.drawRectangleTexture(program, pos, scale, this.renderTargetScene.frametexture);
      WebGL.getTextureFromRenderTarget(target);
    },


    renderFrameTextures: function() {
      var WebGL = this.WebGL;

      WebGL.setRenderTarget(null);
      WebGL.beginDraw(Color.getArray('white', 1.0));

      var halfWidth = window.innerWidth / 2.0;
      var halfHeight = window.innerHeight / 2.0;

      var scale = vec2.n(halfWidth - 20, halfHeight - 20);

      /*Utils.drawRectangleTexture(this.textureProgram, vec2.n(10, 10), scale, this.renderTargetScene.frametexture);
      Utils.drawRectangleTexture(this.textureProgram, vec2.n(halfWidth + 10, 10), scale, this.renderTargetGlowFirst.frametexture);
      Utils.drawRectangleTexture(this.textureProgram, vec2.n(10, halfHeight + 10), scale, this.renderTargetGlowSecond.frametexture);
      Utils.drawRectangleTexture(this.textureProgram, vec2.n(halfWidth + 10, halfHeight + 10), scale, this.renderTargetResult.frametexture);*/

      Utils.drawRectangleTexture(this.textureProgram, vec2.n(0, 0), vec2.n(window.innerWidth, window.innerHeight), this.renderTargetResult.frametexture);
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


  return GlowScene;
});