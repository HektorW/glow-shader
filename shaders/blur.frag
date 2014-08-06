precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform vec2 u_textureresolution;

uniform vec2 u_direction;

const int kernelsize = 5;
const float kernel[5] = [0.024, 0.096, 0.144, 0.096, 0.024];
const float 


void main(void) {
  vec2 texcoord = vec2(v_texcoord.s, -v_texcoord.t);

  vec4 totalColor = vec4(0.0, 0.0, 0.0, 0.0);
  float totalValue = 0.0;

  vec2 onePixel = vec2(1, 1) / u_textureresolution;
  float mean = (kernelsize-1) / 2;

  for (int i = 0; i < kernelsize; i++) {
    float sample = float(i-mean);
    vec4 col = texture2D(u_texture, texcoord + (onePixel * u_direction * vec2(sample, sample)));

    float value = kernel[i];
    totalColor += col * value;
    totalValue += value;
  }

  totalColor /= totalValue;

  vec4 color = vec4((totalColor).rgb, 1.0);
  gl_FragColor = color;
}