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

      this.renderTargetScene = WebGL.createRenderTarget(512, 512);
      this.renderTargetGlowFirst = WebGL.createRenderTarget(512, 512);
      this.renderTargetGlowSecond = WebGL.createRenderTarget(512, 512);
      this.renderTargetResult = WebGL.createRenderTarget(512, 512);

      this.colorProgram = WebGL.loadProgram('shaders/color.vert', 'shaders/color.frag', ['a_position', 'a_color'], ['u_resolution', 'u_position', 'u_scale', 'u_color']);
      this.textureProgram = WebGL.loadProgram('shaders/texture.vert', 'shaders/texture.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture']);
      this.glowFirstProgram = WebGL.loadProgram('shaders/glowfirst.vert', 'shaders/glowfirst.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture']);
      this.glowSecondProgram = WebGL.loadProgram('shaders/glowsecond.vert', 'shaders/glowsecond.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture']);

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
      this.renderScene();

      this.renderBlur();
      
      this.renderFrameTextures();
    },


    renderScene: function() {
      var WebGL = this.WebGL;

      WebGL.setRenderTarget(this.renderTargetScene);
      WebGL.beginDraw(Color.getArray('black', 255));

      Utils.drawRectangleColor(this.colorProgram, vec2.n(100, 100), vec2.n(100, 100), Color.getArray('red'));
      Utils.drawRectangleColor(this.colorProgram, vec2.n(100, 300), vec2.n(100, 100), Color.getArray('green'));
      Utils.drawRectangleColor(this.colorProgram, vec2.n(300, 100), vec2.n(100, 100), Color.getArray('yellow'));
      Utils.drawRectangleColor(this.colorProgram, vec2.n(300, 300), vec2.n(100, 100), Color.getArray('blue'));

      // Utils.drawRectangleTexture(this.textureProgram, vec2.n(500, 100), vec2.n(100, 100), this.texture);

      WebGL.getTextureFromRenderTarget(this.renderTargetScene);
    },

    renderBlur: function() {
      var WebGL = this.WebGL;

      var pos = vec2.n(0, 0);
      var scale = vec2.n(window.innerWidth, window.innerHeight);


      // First pass
      WebGL.setRenderTarget(this.renderTargetGlowFirst);
      WebGL.beginDraw(Color.getArray('black', 255));
      Utils.drawRectangleTexture(this.glowFirstProgram, pos, scale, this.renderTargetScene.frametexture);
      WebGL.getTextureFromRenderTarget(this.renderTargetGlowFirst);


      // Second pass
      WebGL.setRenderTarget(this.renderTargetGlowSecond);
      WebGL.beginDraw(Color.getArray('black', 255));
      Utils.drawRectangleTexture(this.glowSecondProgram, pos, scale, this.renderTargetGlowFirst.frametexture);
      WebGL.getTextureFromRenderTarget(this.renderTargetGlowSecond);


      // add
      WebGL.setRenderTarget(this.renderTargetResult);
      WebGL.beginDraw(Color.getArray('black', 255));
      Utils.drawRectangleTexture(this.textureProgram, pos, scale, this.renderTargetGlowSecond.frametexture);
      WebGL.getTextureFromRenderTarget(this.renderTargetResult);
    },


    renderFrameTextures: function() {
      var WebGL = this.WebGL;

      WebGL.setRenderTarget(null);
      WebGL.beginDraw(Color.getArray('white', 255));

      var halfWidth = window.innerWidth / 2.0;
      var halfHeight = window.innerHeight / 2.0;

      var scale = vec2.n(halfWidth - 20, halfHeight - 20);

      Utils.drawRectangleTexture(this.textureProgram, vec2.n(10, 10), scale, this.renderTargetScene.frametexture);
      Utils.drawRectangleTexture(this.textureProgram, vec2.n(halfWidth + 10, 10), scale, this.renderTargetGlowFirst.frametexture);
      Utils.drawRectangleTexture(this.textureProgram, vec2.n(10, halfHeight + 10), scale, this.renderTargetGlowSecond.frametexture);
      Utils.drawRectangleTexture(this.textureProgram, vec2.n(halfWidth + 10, halfHeight + 10), scale, this.renderTargetResult.frametexture);
    }

  };


  return GlowScene;
});