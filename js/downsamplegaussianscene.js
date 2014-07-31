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
      this.rtScene = WebGL.createRenderTarget(128, 128);
      this.rtDiffuse1 = WebGL.createRenderTarget(64, 64);
      this.rtDiffuse2 = WebGL.createRenderTarget(32, 32);
      this.rtDiffuse3 = WebGL.createRenderTarget(16, 16);

      this.rtBlur1 = WebGL.createRenderTarget(128, 128);
      this.rtBlur2 = WebGL.createRenderTarget(64, 64);
      this.rtBlur3 = WebGL.createRenderTarget(32, 32);
      this.rtBlur4 = WebGL.createRenderTarget(16, 16);

      // kernel
      this.kernel = [0.004, 0.016, 0.024, 0.016, 0.004, 0.016, 0.064, 0.096, 0.064, 0.016, 0.024, 0.096, 0.144, 0.096, 0.024, 0.016, 0.052, 0.096, 0.052, 0.016, 0.004, 0.016, 0.024, 0.016, 0.004];
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
      this.renderIntoTarget(this.rtScene, this.texture);

      // WebGL.setDepth();

      this.renderIntoTarget(this.rtDiffuse1, this.rtScene.frametexture);
      //this.renderIntoTarget(this.rtDiffuse2, this.rtDiffuse1.frametexture);
      //this.renderIntoTarget(this.rtDiffuse3, this.rtDiffuse2.frametexture);


      this.blurIntoTarget(this.rtBlur1, this.rtDiffuse1.frametexture);
      this.blurIntoTarget(this.rtBlur2, this.rtBlur1.frametexture);
      this.blurIntoTarget(this.rtBlur3, this.rtBlur2.frametexture);
      this.blurIntoTarget(this.rtBlur4, this.rtBlur3.frametexture);
      // this.blurIntoTarget(this.rtBlur2, this.rtBlur1.frametexture);
      // this.blurIntoTarget(this.rtBlur3, this.rtBlur2.frametexture);
      // this.blurIntoTarget(this.rtBlur4, this.rtBlur3.frametexture);




      WebGL.setRenderTarget(null);
      WebGL.beginDraw(blackColor);

      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 0), vec2.fromValues(128, 128), this.rtScene.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 128), vec2.fromValues(64, 64), this.rtDiffuse1.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 128+64), vec2.fromValues(32, 32), this.rtDiffuse2.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 128+64+32), vec2.fromValues(16, 16), this.rtDiffuse3.frametexture, resolution);


      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(128, 0), vec2.fromValues(128, 128), this.rtBlur1.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(128, 128), vec2.fromValues(64, 64), this.rtBlur2.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(128, 128+64), vec2.fromValues(32, 32), this.rtBlur3.frametexture, resolution);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(128, 128+64+32), vec2.fromValues(16, 16), this.rtBlur4.frametexture, resolution);



      WebGL.gl.blendFunc(WebGL.gl.SRC_ALPHA, WebGL.gl.ONE_MINUS_SRC_ALPHA);
      WebGL.gl.enable(WebGL.gl.BLEND);

      WebGL.useProgram(this.blendProgram);
      WebGL.bindTexture(this.blendProgram.uniforms.u_texture2, this.rtBlur4.frametexture, 1);
      Utils.drawRectangleTexture(this.blendProgram, vec2.fromValues(128+256, 128+256), vec2.fromValues(128, 128), this.texture, resolution);
    },


    renderIntoTarget: function(renderTarget, texture) {
      var WebGL = this.WebGL;
      var res = vec2.fromValues(renderTarget.width, renderTarget.height)
      
      WebGL.setRenderTarget(renderTarget);
      WebGL.beginDraw(blackColor);
      Utils.drawRectangleTexture(this.textureProgram, vec2.fromValues(0, 0), res, texture, res);
      WebGL.getTextureFromRenderTarget(renderTarget);
    },


    blurIntoTarget: function(renderTarget, texture) {
      var WebGL = this.WebGL;

      WebGL.setRenderTarget(renderTarget);
      WebGL.beginDraw(blackColor);


      var rect = Utils._rectangle;
      var position = vec2.fromValues(0, 0);
      var resolution = vec2.fromValues(renderTarget.width, renderTarget.height)
      var scale = vec2.clone(resolution);
      var textureResolution = resolution;

      var kernelsize = Math.sqrt(this.kernel.length);
      var kernel = Utils.fillArray(this.kernel, 121);


      var program = this.kernelProgram;
      WebGL.useProgram(program);

      // attributes
      WebGL.bindAttribBuffer(rect.vertexPositions.buffer, program.attributes.a_position, rect.vertexPositions.size);
      WebGL.bindAttribBuffer(rect.vertexTexcoords.buffer, program.attributes.a_texcoord, rect.vertexTexcoords.size);

      // vert uniforms
      WebGL.bindUniform(program.uniforms.u_position, position);
      WebGL.bindUniform(program.uniforms.u_scale, scale);
      WebGL.bindUniform(program.uniforms.u_resolution, resolution);

      // frag uniforms
      WebGL.bindTexture(program.uniforms.u_texture, texture);
      WebGL.bindUniform(program.uniforms.u_textureresolution, textureResolution);
      WebGL.bindUniform(program.uniforms.u_kernelsize, kernelsize, 'i');
      WebGL.gl.uniform1fv(program.uniforms.u_kernel, new Float32Array(kernel));

      WebGL.drawVertices(rect.vertexCount);

      WebGL.getTextureFromRenderTarget(renderTarget);
    }

  };


  return DownsampleScene;

});