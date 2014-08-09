precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform float u_glowamount;

void main(void) {
  vec4 color = texture2D(u_texture, vec2(v_texcoord.s, -v_texcoord.t));

  gl_FragColor = vec4(color.rgb, u_glowamount);
}