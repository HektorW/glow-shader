precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;

uniform vec2 u_textureresolution;
uniform vec2 u_direction;
uniform float u_kernel[25];
uniform int u_kernelsize;

const int maxsize = 25;


void main(void) {
  vec2 texcoord = vec2(v_texcoord.s, -v_texcoord.t);

  vec4 totalColor = vec4(0.0, 0.0, 0.0, 0.0);
  float totalValue = 0.0;

  vec2 onePixel = vec2(1, 1) / u_textureresolution;

  for (int i = 0; i < maxsize; i++) {
    if (i > u_kernelsize) {
      break;
    }

    float sample = float(i-((u_kernelsize-1) / 2));
    vec4 col = texture2D(u_texture, texcoord + (onePixel * u_direction * vec2(sample, sample)));

    float value = u_kernel[i];
    totalColor += col * value;
  }

  vec4 color = vec4((totalColor).rgb, 1.0);
  // color = texture2D(u_texture, texcoord);
  float v = (color.r + color.g + color.b) / 3.0;
  gl_FragColor = vec4(v, v, v, 1.0);


  // gl_FragColor = color;
}