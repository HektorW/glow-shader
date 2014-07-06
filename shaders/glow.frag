precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform vec2 u_textureresolution;
uniform vec2 u_direction;


void main(void) {
  vec2 texcoord = vec2(v_texcoord.s, -v_texcoord.t);
  float alpha = texture2D(u_texture, texcoord).a;

  float epsilon = 0.1;

  if (alpha < epsilon) {
    discard;
  }



  /* const int length = 11;
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
  values[10] = 1.0; */

  /* const int length = 5;
  float values[length];
  values[0] = 1.0;
  values[1] = 1.0;
  values[2] = 1.0;
  values[3] = 1.0;
  values[4] = 1.0; */

  /* const int length = 5;
  float values[length];
  values[0] = 0.0219;
  values[1] = 0.0983;
  values[2] = 0.1621;
  values[3] = 0.0983;
  values[4] = 0.0219; */

  const int length = 7;
  float values[length];
  values[0] = 0.00038771;
  values[1] = 0.01330373;
  values[2] = 0.11098164;
  values[3] = 0.22508352;
  values[4] = 0.11098164;
  values[5] = 0.01330373;
  values[6] = 0.00038771;
  

  vec4 totalColor = vec4(0.0, 0.0, 0.0, 0.0);
  float totalValue = 0.0;

  vec2 onePixel = vec2(1, 1) / u_textureresolution;

  for (int i = 0; i < length; i++) {
    float sample = float(i-((length-1) / 2));
    vec4 col = texture2D(u_texture, texcoord + (onePixel * u_direction * vec2(sample, sample)));

    if (col.a > epsilon) {
      totalColor += col * values[i];
      totalValue += values[i];
    }
  }


  vec4 color = vec4((totalColor / totalValue).rgb, alpha);

  gl_FragColor = color;
}