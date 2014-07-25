precision mediump float;

const int maxsize = 441;

varying vec2 v_texcoord;

uniform sampler2D u_texture;

uniform vec2 u_textureresolution;
uniform float u_kernel[maxsize];
uniform int u_kernelsize;



void main(void) {
  vec2 texcoord = vec2(v_texcoord.s, -v_texcoord.t);

  /* vec4 v = texture2D(u_texture, texcoord);
  if ((v.r + v.g + v.b / 3.0) < 0.5) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    return;
  } */

  vec4 totalColor = vec4(0.0, 0.0, 0.0, 0.0);
  float totalValue = 0.0;

  vec2 onePixel = vec2(5, 5) / u_textureresolution;
  int mean = (u_kernelsize-1) / 2;

  int size = u_kernelsize * u_kernelsize;

  float sample_i = 0.0;
  float sample_j = 0.0;
  for (int i = 0; i < maxsize; i++) {
    if (i > size) {
      break;
    }

    if (int(mod(float(i), float(u_kernelsize))) == 0) {
      sample_i = float((i / u_kernelsize) - mean);
    }

    sample_j = float(mod(float(i), float(u_kernelsize)) - float(mean));
    
    vec4 col = texture2D(u_texture, texcoord + (onePixel * vec2(sample_i, sample_j)));
    float value = u_kernel[i];
    totalColor += col * value;

    totalValue += value;
  }

  totalColor /= totalValue;

  vec4 color = vec4((totalColor).rgb, 1.0);
  gl_FragColor = color;

  if (u_kernelsize == 1) {
    gl_FragColor = texture2D(u_texture, texcoord);
  }
}