precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;



void main(void) {
  vec2 texcoord = vec2(v_texcoord.s, -v_texcoord.t);
  float alpha = texture2D(u_texture, texcoord).a;

  if (alpha < 0.1)
    discard;



  const int length = 11;
  float values[length];
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
  

  vec4 totalColor = vec4(0.0, 0.0, 0.0, 0.0);
  float totalValue = 0.0;

  vec2 onePixel = vec2(1.0, 1.0) / 512.0;

  for (int i = 0; i < length; i++) {
    totalColor += texture2D(u_texture, texcoord + (onePixel * vec2(i - 1, 0))) * values[i];
    totalValue += values[i];
  }


  vec4 color = vec4((totalColor / totalValue).rgb, 1.0);

  gl_FragColor = color;
  // gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}