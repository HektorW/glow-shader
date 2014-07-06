precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform sampler2D u_textureglow;

void main(void) {
  vec2 coord = vec2(v_texcoord.s, -v_texcoord.t);

  vec4 diffuse = texture2D(u_texture, coord);
  vec4 glow = texture2D(u_textureglow, coord);

  vec4 color = (diffuse + (glow * diffuse.a))  / (1.0 + diffuse.a);

  gl_FragColor = vec4(color.rgb, 1.0);
}