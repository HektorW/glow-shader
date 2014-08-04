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
  var blackColor = [0.0, 0.0, 0.0, 1.0];


  var DownsampleScene = {
    init: function(WebGL) {
      this.WebGL = WebGL;

      this.width = 512;
      this.height = 512;

      this.load();
    },

    load: function() {
      var WebGL = this.WebGL;

      // programs
      this.textureProgram = WebGL.loadProgram(
        'shaders/texture.vert', 'shaders/texture_color.frag',
        ['a_position', 'a_texcoord'],
        ['u_resolution', 'u_position', 'u_scale', 'u_texture', 'u_color']
      );
      this.blendProgram = WebGL.loadProgram(
        'shaders/texture.vert', 'shaders/blend.frag',
        ['a_position', 'a_texcoord'],
        ['u_resolution', 'u_position', 'u_scale', 'u_texture1', 'u_texture2']
      );
      this.kernelProgram = WebGL.loadProgram(
        'shaders/texture.vert', 'shaders/kernel.frag',
        ['a_position', 'a_texcoord'],
        ['u_resolution', 'u_position', 'u_scale', 'u_texture', 'u_textureresolution', 'u_kernel', 'u_kernelsize']
      );

      // textures
      this.textureSquare = Loader.loadTexture(WebGL.gl, 'res/texture_square.png');
      this.textureCircle = Loader.loadTexture(WebGL.gl, 'res/texture_circle.png');

      // render targets
      this.rtScene = WebGL.createRenderTarget(this.width, this.height);

      this.rtBlur1 = WebGL.createRenderTarget(this.width, this.height);
      this.rtBlur2 = WebGL.createRenderTarget(this.width / 2, this.height / 2);
      this.rtBlur3 = WebGL.createRenderTarget(this.width / 4, this.height / 4);
      this.rtBlur4 = WebGL.createRenderTarget(this.width / 8, this.height / 8);

      // kernel
      this.kernel = [0.004, 0.016, 0.024, 0.016, 0.004, 0.016, 0.064, 0.096, 0.064, 0.016, 0.024, 0.096, 0.144, 0.096, 0.024, 0.016, 0.052, 0.096, 0.052, 0.016, 0.004, 0.016, 0.024, 0.016, 0.004];
    },

    resize: function() {
      this.WebGL.resize(this.width, this.height);
    },


    draw: function(time) {
      if (!Utils.isLoaded(this.textureProgram, this.texture, this.blendProgram)) {
        return;
      }

      var WebGL = this.WebGL;

      this.drawScene(time, WebGL);


      Utils.blurTextureIntoTarget(this.kernelProgram, this.rtBlur1, this.rtScene.frametexture, this.kernel);
      Utils.blurTextureIntoTarget(this.kernelProgram, this.rtBlur2, this.rtBlur1.frametexture, this.kernel);
      Utils.blurTextureIntoTarget(this.kernelProgram, this.rtBlur3, this.rtBlur2.frametexture, this.kernel);
      Utils.blurTextureIntoTarget(this.kernelProgram, this.rtBlur4, this.rtBlur3.frametexture, this.kernel);


      WebGL.setRenderTarget(null);
      WebGL.beginDraw(blackColor);


      WebGL.gl.blendFunc(WebGL.gl.SRC_ALPHA, WebGL.gl.ONE_MINUS_SRC_ALPHA);
      WebGL.gl.enable(WebGL.gl.BLEND);

      Utils.drawRectangleTexture(this.blendProgram, vec2.fromValues(0, 0), vec2.fromValues(1, 1), [this.rtScene.frametexture, this.rtBlur3.frametexture], vec2.fromValues(1, 1));
      // Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 0), vec2.fromValues(1, 1), this.rtScene.frametexture, vec2.fromValues(1, 1));
    },


    drawScene: function(time, WebGL) {
      var resolution = vec2.fromValues(this.width, this.height);

      WebGL.setRenderTarget(this.rtScene);
      WebGL.beginDraw(blackColor);


      Utils.drawTextureColor(this.textureProgram, vec2.fromValues((this.width / 2) + (Math.sin(time.total * 0.005) * this.width / 4), 10), vec2.fromValues(100, 100), this.textureSquare, Color.getArray('silver', 1.0), resolution);
      Utils.drawTextureColor(this.textureProgram, vec2.fromValues(this.width / 2, (this.width / 3) + (Math.sin(time.total * 0.003) * this.width / 4)), vec2.fromValues(100, 100), this.textureCircle, Color.getArray('purple', 1.0), resolution);

      Utils.drawTextureColor(this.textureProgram, vec2.fromValues((this.width / 3) + (Math.sin(time.total * 0.003) * this.width / 3), (this.height / 2) + (Math.sin(time.total * 0.002) * this.height / 4)), vec2.fromValues(50, 50), this.textureCircle, Color.getArray('maroon', 1.0), resolution);


      WebGL.getTextureFromRenderTarget(this.rtScene);
      
    }
  };


  return DownsampleScene;

});