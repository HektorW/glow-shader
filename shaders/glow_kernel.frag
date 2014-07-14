precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;

uniform vec2 u_textureresolution;
uniform vec2 u_direction;
uniform float[] u_kernel;
uniform int u_kernelsize;

const int maxsize = 25;


void main(void) {
  vec2 texcoord = vec2(v_texcoord.s, -v_texcoord.t);
  float alpha = texture2D(u_texture, texcoord).a;

  float epsilon = 0.1;

  if (alpha < epsilon) {
    discard;
  }
  

  vec4 totalColor = vec4(0.0, 0.0, 0.0, 0.0);
  float totalValue = 0.0;

  vec2 onePixel = vec2(1, 1) / u_textureresolution;

  for (int i = 0; i < maxsize; i++) {
    if (i > u_kernelsize) {
      break;
    }


    float sample = float(i-((u_kernelsize-1) / 2));
    vec4 col = texture2D(u_texture, texcoord + (onePixel * u_direction * vec2(sample, sample)));

    if (col.a > epsilon) {
      float value = u_kernel[i];
      totalColor += col * value;
    }
  }

  vec4 color = vec4((totalColor).rgb, alpha);
  gl_FragColor = color;
}