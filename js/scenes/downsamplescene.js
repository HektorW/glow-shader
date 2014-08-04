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
  var transparentColor = Color.getArray('black', 1.0);


  var DownsampleScene = {
    init: function(WebGL) {
      this.WebGL = WebGL;

      this.load();

      $(window)
        .on('mousedown', $.proxy(function() { this.mousedown = true; }, this))
        .on('mouseup', $.proxy(function() { this.mousedown = false; }, this));
    },

    load: function() {
      var WebGL = this.WebGL;

      // programs
      this.textureProgram = WebGL.loadProgram(
        'shaders/texture.vert', 'shaders/texture.frag',
        ['a_position', 'a_texcoord'],
        ['u_resolution', 'u_position', 'u_scale', 'u_texture']
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
      this.texture = Loader.loadTexture(WebGL.gl, 'res/small_texture.png');

      // render targets
      this.rt1 = WebGL.createRenderTarget(64, 64);
      this.rt2 = WebGL.createRenderTarget(32, 32);
      this.rt3 = WebGL.createRenderTarget(16, 16);
      this.rt4 = WebGL.createRenderTarget(8, 8);
      this.rt5 = WebGL.createRenderTarget(128, 128);
    },

    resize: function() {
      this.WebGL.resize(512, 512);
    },


    draw: function() {
      if (!Utils.isLoaded(this.textureProgram, this.texture, this.blendProgram)) {
        return;
      }

      var WebGL = this.WebGL;
      var resolution = vec2.fromValues(512, 512);

      // WebGL.setBlend();
      this.renderIntoTarget(this.rt5, this.texture);

      // WebGL.setDepth();

      this.renderIntoTarget(this.rt1, this.rt5.frametexture);
      this.renderIntoTarget(this.rt2, this.rt1.frametexture);
      this.renderIntoTarget(this.rt3, this.rt2.frametexture);
      this.renderIntoTarget(this.rt4, this.rt3.frametexture);







      WebGL.setRenderTarget(null);
      WebGL.beginDraw([0.0, 0.0, 0.0, 1.0]);

      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 0), vec2.fromValues(128, 128), this.rt5.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 128), vec2.fromValues(64, 64), this.rt1.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 128+64), vec2.fromValues(32, 32), this.rt2.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 128+64+32), vec2.fromValues(16, 16), this.rt3.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 128+64+32+16), vec2.fromValues(8, 8), this.rt4.frametexture, resolution);

      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(128, 0), vec2.fromValues(128, 128), this.rt1.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(256, 0), vec2.fromValues(128, 128), this.rt2.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(128+256, 0), vec2.fromValues(128, 128), this.rt3.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(128+256, 128), vec2.fromValues(128, 128), this.rt4.frametexture, resolution);



      WebGL.setBlend();
      WebGL.gl.blendFunc(WebGL.gl.SRC_ALPHA, WebGL.gl.ONE_MINUS_SRC_ALPHA);
      // WebGL.gl.blendFunc(WebGL.gl.SRC_ALPHA, WebGL.gl.ONE);
      WebGL.gl.enable(WebGL.gl.BLEND);

      WebGL.useProgram(this.blendProgram);
      WebGL.bindTexture(this.blendProgram.uniforms.u_texture2, this.rt3.frametexture, 1);
      Utils.drawRectangleTexture(this.blendProgram, vec2.fromValues(128+256, 128+256), vec2.fromValues(128, 128), this.texture, resolution);
    },


    renderIntoTarget: function(renderTarget, texture) {
      var WebGL = this.WebGL;
      var res = vec2.fromValues(renderTarget.width, renderTarget.height)
      
      WebGL.setRenderTarget(renderTarget);
      WebGL.beginDraw([0.0, 0.0, 0.0, 1.0]);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 0), res, texture, res);
      WebGL.getTextureFromRenderTarget(renderTarget);
    }

  };


  return DownsampleScene;

});