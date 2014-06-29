define([], function() {

  var Loader = {
    loadImage: function(src, done, error){
      var img = new Image();
      img.loaded = false;
      img.onload = function(){
        img.loaded = true;
        if(done)
          done(img);
      };
      img.onerror = function(){
        // Something went wrong call error callback with msg and arguments
        if(error)
          error('Could not load image', arguments);
      };

      img.src = src;
      return img;
    },

    loadTexture: function(gl, src, done, error){
      // Create webgl texture
      var texture = gl.createTexture();
      texture.loaded = false;

      Loader.loadImage(src, function(image){
        Loader.bindImageToTexture(gl, texture, image);
        texture.loaded = true;

        if(done)
          done(texture);
      }, error);

      return texture;
    },

    bindImageToTexture: function(gl, texture, img){
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

  };

  return Loader;
});