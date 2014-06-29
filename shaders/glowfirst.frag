precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;



void main(void) {
  float values[11];
  values[0] = 1.0;
  values[1] = 2.0;
  values[2] = 4.0;
  values[3] = 8.0;
  values[4] = 16.0;
  values[5] = 32.0;
  values[6] = 16.0;
  values[7] = 8.0;
  values[8] = 4.0;
  values[9] = 2.0;
  values[10] = 1.0;

  const int length = 11;

  vec4 totalColor = vec4(0.0, 0.0, 0.0, 0.0);
  float totalValue = 0.0;
  for (int i = 0; i < length; i++) {
    totalColor += texture2D(u_texture, vec2(v_texcoord.s - float(i - 5), -v_texcoord.t)) * values[i];
    totalValue += values[i];
  }


  vec4 color = totalColor / totalValue;

  gl_FragColor = color;
}