precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;


void main(void) {
  vec2 coord = vec2(v_texcoord.s, -v_texcoord.t);

  vec4 color1 = texture2D(u_texture1, coord);
  vec4 color2 = texture2D(u_texture2, coord);

  float a1 = 0.5;
  float a2 = 0.75;

  gl_FragColor = vec4((color1 * a1 + color2 * a2).rgb, 1);
  // gl_FragColor = vec4(mix(color1, color2, 0.5).rgb, 1);
  // gl_FragColor = vec4(color1.rgb * color2.rgb * 2.0, 1);
}
