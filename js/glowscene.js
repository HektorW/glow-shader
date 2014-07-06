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

      this.renderTargetScene = WebGL.createRenderTarget(1024, 1024);
      this.renderTargetGlowFirst = WebGL.createRenderTarget(1024, 1024);
      this.renderTargetGlowSecond = WebGL.createRenderTarget(1024, 1024);
      this.renderTargetResult = WebGL.createRenderTarget(1024, 1024);

      this.colorProgram = WebGL.loadProgram('shaders/color.vert', 'shaders/color.frag', ['a_position'], ['u_resolution', 'u_position', 'u_scale', 'u_color']);
      this.textureProgram = WebGL.loadProgram('shaders/texture.vert', 'shaders/texture.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture']);
      this.glowProgram = WebGL.loadProgram('shaders/glow.vert', 'shaders/glow.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture', 'u_textureresolution', 'u_direction']);
      // this.glowSecondProgram = WebGL.loadProgram('shaders/glowsecond.vert', 'shaders/glowsecond.frag', ['a_position', 'a_texcoord'], ['u_resolution', 'u_position', 'u_scale', 'u_texture']);

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

      Utils.drawRectangleColor(this.colorProgram, vec2.n(100, 100), vec2.n(100, 100), Color.getArray('red', 1.0));
      Utils.drawRectangleColor(this.colorProgram, vec2.n(100, 300), vec2.n(100, 100), Color.getArray('green', 1.0));
      Utils.drawRectangleColor(this.colorProgram, vec2.n(300, 100), vec2.n(100, 100), Color.getArray('yellow', 0.4));
      Utils.drawRectangleColor(this.colorProgram, vec2.n(300, 300), vec2.n(100, 100), Color.getArray('blue', 1.0));

      Utils.drawCircleColor(this.colorProgram, vec2.n(500, 300), vec2.n(50, 50), Color.getArray('blue', 0.2));

      // Utils.drawRectangleTexture(this.textureProgram, vec2.n(500, 100), vec2.n(100, 100), this.texture);

      WebGL.getTextureFromRenderTarget(this.renderTargetScene);
    },

    renderBlur: function() {
      var WebGL = this.WebGL;

      var pos = vec2.n(0, 0);
      var scale = vec2.n(window.innerWidth, window.innerHeight);

      var target, program;


      // First pass
      target = this.renderTargetGlowFirst;
      program = this.glowProgram;
      if (!WebGL.useProgram(program))
        return;

      WebGL.setRenderTarget(target);
      WebGL.beginDraw(Color.getArray('black', 1.0));

      WebGL.bindUniform(program.uniforms.u_textureresolution, vec2.n(target.width, target.height));
      WebGL.bindUniform(program.uniforms.u_direction, vec2.n(Math.cos(performance.now() * 0.001 + 2.5), 0));

      Utils.drawRectangleTexture(program, pos, scale, this.renderTargetScene.frametexture);
      WebGL.getTextureFromRenderTarget(target);


      // Second pass
      // First pass
      target = this.renderTargetGlowSecond;
      if (!WebGL.useProgram(program))
        return;

      WebGL.setRenderTarget(target);
      WebGL.beginDraw(Color.getArray('black', 1.0));

      WebGL.bindUniform(program.uniforms.u_textureresolution, vec2.n(target.width, target.height));
      WebGL.bindUniform(program.uniforms.u_direction, vec2.n(0, 1));

      Utils.drawRectangleTexture(program, pos, scale, this.renderTargetGlowFirst.frametexture);
      WebGL.getTextureFromRenderTarget(target);


      /*// add
      WebGL.setRenderTarget(this.renderTargetResult);
      WebGL.beginDraw(Color.getArray('black', 1.0));
      Utils.drawRectangleTexture(this.textureProgram, pos, scale, this.renderTargetGlowSecond.frametexture);
      WebGL.getTextureFromRenderTarget(this.renderTargetResult);*/
    },


    renderFrameTextures: function() {
      var WebGL = this.WebGL;

      WebGL.setRenderTarget(null);
      WebGL.beginDraw(Color.getArray('white', 1.0));

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