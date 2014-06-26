define([], function() {

  function rgbValues(nbr) {
    var hexstr = nbr.toString(16);
    hexstr = fixZeros(hexstr, 6);
    return {
      'r': hexstr[0] + hexstr[1],
      'g': hexstr[2] + hexstr[3],
      'b': hexstr[4] + hexstr[5],
    };
  }

  function decToHex(dec) {
    return parseInt(dec, 10).toString(16);
  }

  function fixZeros(hexstr, length) {
    while(hexstr.length < length)
      hexstr = '0'  + hexstr;
    return hexstr.substr(0, length);
  }

  function multiplyHexVal(hexstr, amount, min, max) {
    var l = hexstr.length;
    min = min || 0;
    max = max || 255;
    var i = parseInt(Number('0x'+hexstr) * amount, 10);
    i = Math.max(min, Math.min(i, max));
    return fixZeros(i.toString(16), l);
  }

  function lerpHexStr(a, b, l) {
    return fixZeros(decToHex(lerpValue(value(a), value(b), l)), Math.max(a.length, b.length));
  }

  function lerpValue(a, b, l) {
    return a * (1-l) + b * l;
  }

  function value() {
    var res = '0x';
    for(var i = 0; i < arguments.length; i++)
      res += arguments[i];
    return Number(res);
  }

  return {
    white: 0xffffff,
    navy: 0x001f3f,
    blue: 0x0074d9,
    aqua: 0x7fdbff,
    teal: 0x39cccc,
    olive: 0x3d9970,
    green: 0x2ecc40,
    lime: 0x01ff70,
    yellow: 0xffdc00,
    orange: 0xff851b,
    red: 0xff4136,
    maroon: 0x85144b,
    fuchsia: 0xf012be,
    purple: 0xb10dc9,
    silver: 0xdddddd,
    gray: 0xaaaaaa,
    black: 0x111111,

    rgbValues: rgbValues,

    getArray: function(colorname) {
      var rgb = rgbValues(this[colorname]);
      return new Float32Array([parseInt(rgb.r, 16) / 255.0, parseInt(rgb.g, 16) / 255.0, parseInt(rgb.b, 16) / 255.0]);
    },

    darken: function(color, val) {
      val = val || 0.9;
      var rgb = rgbValues(color);
      rgb.r = multiplyHexVal(rgb.r, val);
      rgb.g = multiplyHexVal(rgb.g, val);
      rgb.b = multiplyHexVal(rgb.b, val);

      return value(rgb.r, rgb.g, rgb.b);
    },

    lighten: function(color, val) {
      val = 1 + (val || 0.1);
      var rgb = rgbValues(color);
      rgb.r = multiplyHexVal(rgb.r, val);
      rgb.g = multiplyHexVal(rgb.g, val);
      rgb.b = multiplyHexVal(rgb.b, val);

      return value(rgb.r, rgb.g, rgb.b);
    },

    random: function() {

      var a = [];
      for(var c in this) {
        if(!this.hasOwnProperty(c))
          continue;

        if(typeof this[c] === 'number')
          a.push(this[c]);
      }

      return a[parseInt(Math.random() * a.length, 10)];
    },

    lerp: function(color_a, color_b, l ) {
      l = Math.max(0, Math.min(l, 1));
      var a = rgbValues(color_a);
      var b = rgbValues(color_b);
      return value(lerpHexStr(a.r, b.r, l), lerpHexStr(a.g, b.g, l), lerpHexStr(a.b, b.b, l));
    },

    toHexStr: function(dec) {
        return '0x' + decToHex(dec);
    }
  };
});