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

      this.load();

    },


    load: function() {
      WebGL = this.WebGL;

      this.renderTargetColor = WebGL.createRenderTarget(512, 512);

      this.colorProgram = WebGL.loadProgram('shaders/color.vert', 'shaders/color.frag', ['a_position', 'a_color'], ['u_resolution', 'u_position', 'u_scale', 'u_color']);
      this.textureProgram = WebGL.loadProgram('shaders/texture.vert', 'shaders/texture.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture']);
      this.glowProgram = WebGL.loadProgram('shaders/glow.vert', 'shaders/glow.frag', ['a_position', 'a_texcoord'], []);

      this.texture = Loader.loadTexture(WebGL.gl, 'res/texture.png');

      this.colorRect = {
        pos: vec2.fromValues(100, 100),
        scale: vec2.fromValues(600, 500),
        color: Color.getArray('red')
      };
      this.texRect = {
        pos: vec2.fromValues(500, 400),
        scale: vec2.fromValues(600, 600)
      };
      this.resize();
    },


    resize: function() {
      this.screenRect = {
        pos: vec2.fromValues(0, 0),
        scale: vec2.fromValues(window.innerWidth, window.innerHeight)
      };
    },

    draw: function() {
      var WebGL = this.WebGL;

      var blackColor = Color.getArray('black', 255);
      var whiteColor = Color.getArray('white', 255);

      WebGL.setRenderTarget(this.renderTargetColor);
      WebGL.beginDraw(blackColor);

      Utils.drawRectangleColor(this.colorProgram, vec2.n(100, 100), vec2.n(100, 100), Color.getArray('red'));
      Utils.drawRectangleColor(this.colorProgram, vec2.n(100, 300), vec2.n(100, 100), Color.getArray('green'));
      Utils.drawRectangleColor(this.colorProgram, vec2.n(300, 100), vec2.n(100, 100), Color.getArray('yellow'));
      Utils.drawRectangleColor(this.colorProgram, vec2.n(300, 300), vec2.n(100, 100), Color.getArray('blue'));

      Utils.drawRectangleTexture(this.textureProgram, vec2.n(500, 100), vec2.n(100, 100), this.texture);

      WebGL.getTextureFromRenderTarget(this.renderTargetColor);

      WebGL.setRenderTarget(null);
      WebGL.beginDraw(whiteColor);

      var halfWidth = window.innerWidth / 2.0;
      var halfHeight = window.innerHeight / 2.0;

      Utils.drawRectangleTexture(this.textureProgram, vec2.n(10, 10), vec2.n(halfWidth - 20, halfHeight - 20), this.renderTargetColor.frametexture);
      Utils.drawRectangleTexture(this.textureProgram, vec2.n(halfWidth + 10, 10), vec2.n(halfWidth - 20, halfHeight - 20), this.renderTargetColor.frametexture);
      Utils.drawRectangleTexture(this.textureProgram, vec2.n(10, halfHeight + 10), vec2.n(halfWidth - 20, halfHeight - 20), this.renderTargetColor.frametexture);
      Utils.drawRectangleTexture(this.textureProgram, vec2.n(halfWidth + 10, halfHeight + 10), vec2.n(halfWidth - 20, halfHeight - 20), this.renderTargetColor.frametexture);
    }
  };


  return GlowScene;
});