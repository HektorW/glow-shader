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

      this.width = 1024;
      this.height = 1024;

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
        ['u_resolution', 'u_position', 'u_scale', 'u_texture1', 'u_texture2', 'u_a1', 'u_a2']
      );
      this.kernelProgram = WebGL.loadProgram(
        'shaders/texture.vert', 'shaders/kernel.frag',
        ['a_position', 'a_texcoord'],
        ['u_resolution', 'u_position', 'u_scale', 'u_texture', 'u_textureresolution', 'u_kernel', 'u_kernelsize']
      );
      this.blurProgram = WebGL.loadProgram(
        'shaders/texture.vert', 'shaders/blur.frag',
        ['a_position', 'a_texcoord'],
        ['u_resolution', 'u_position', 'u_scale', 'u_texture', 'u_textureresolution', 'u_direction']
      );
      this.preglowProgram = WebGL.loadProgram(
        'shaders/texture.vert', 'shaders/preglow.frag',
        ['a_position', 'a_texcoord'],
        ['u_resolution', 'u_position', 'u_scale', 'u_texture']
      );

      // textures
      this.textureSquare = Loader.loadTexture(WebGL.gl, 'res/texture_square.png');
      this.textureCircle = Loader.loadTexture(WebGL.gl, 'res/texture_circle.png');
      this.textureCircleFilled = Loader.loadTexture(WebGL.gl, 'res/texture_circle_filled.png');

      // render targets
      this.rtScene = WebGL.createRenderTarget(this.width, this.height);

      this.rtGlowSource = WebGL.createRenderTarget(this.width, this.height);

      this.rtBlur1 = WebGL.createRenderTarget(this.width / 4, this.height / 4);
      this.rtBlur2 = WebGL.createRenderTarget(this.width / 4, this.height / 4);
    },

    resize: function() {
      this.WebGL.resize(this.width, this.height);
    },


    draw: function(time) {
      if (!Utils.isLoaded(this.textureProgram, this.blendProgram, this.blurProgram, this.preglowProgram, this.textureCircle, this.textureSquare, this.textureCircleFilled)) {
        return;
      }

      var WebGL = this.WebGL;
      WebGL.setBlend();

      // render diffuse scene
      this.drawScene(time, WebGL);


      // render glow map
      Utils.renderTextureIntoTarget(this.preglowProgram, this.rtGlowSource, this.rtScene.frametexture);


      // blur using the glow map
      Utils.blurTextureIntoTarget(this.blurProgram, this.rtBlur1, this.rtGlowSource.frametexture, vec2.fromValues(1.0, 0.0));
      Utils.blurTextureIntoTarget(this.blurProgram, this.rtBlur2, this.rtBlur1.frametexture, vec2.fromValues(0.0, 1.0));



      // Blend scene and blur
      WebGL.setRenderTarget(null);
      WebGL.beginDraw(blackColor);

      WebGL.useProgram(this.blendProgram);

      WebGL.bindUniform(this.blendProgram.uniforms.u_a1, 1.0);
      WebGL.bindUniform(this.blendProgram.uniforms.u_a2, 2.5);

      Utils.drawRectangleTexture(this.blendProgram, vec2.fromValues(0, 0), vec2.fromValues(1, 1), [this.rtScene.frametexture, this.rtBlur2.frametexture], vec2.fromValues(1, 1));
    },


    drawScene: function(time, WebGL) {
      var resolution = vec2.fromValues(this.width, this.height);

      WebGL.setRenderTarget(this.rtScene);
      WebGL.beginDraw(blackColor);

      var width = this.width;
      var height = this.height;
      var halfwidth = width / 2.0;
      var halfheight = height / 2.0;

      Utils.drawTextureColor(this.textureProgram, vec2.fromValues((halfwidth) + (Math.sin(time.total * 0.002) * width / 4), 10), vec2.fromValues(width / 8, height / 8), this.textureCircle, Color.getArray('silver', 1.0), resolution);
      Utils.drawTextureColor(this.textureProgram, vec2.fromValues(halfwidth - (width / 16), (width / 3) + (Math.sin(time.total * 0.003) * width / 4)), vec2.fromValues(width / 8, height / 8), this.textureCircle, Color.getArray('purple', 1.0), resolution);
      Utils.drawTextureColor(this.textureProgram, vec2.fromValues((width / 2.5) + (Math.sin(time.total * 0.001) * width / 3), (height / 2.5) + (Math.sin(time.total * 0.002) * height / 3)), vec2.fromValues(width / 12, height / 12), this.textureCircle, Color.getArray('maroon', 1.0), resolution);


      WebGL.getTextureFromRenderTarget(this.rtScene);
    }
  };


  return DownsampleScene;

});