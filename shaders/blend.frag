precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;


bool isBlack(vec4 color) {
  return !(((color.r + color.g + color.b) / 3.0) > 0.0);
}

void main(void) {
  vec2 coord = vec2(v_texcoord.s, -v_texcoord.t);

  vec4 color1 = texture2D(u_texture1, coord);
  vec4 color2 = texture2D(u_texture2, coord);

  // if ((color2.r + color2.g + color2.b) / 3.0 < 0.01) {
  /* if (color2.a < 0.01) {
    gl_FragColor = color1;
    return;
  } */

  /* if (color2.a > 0.0) {
    gl_FragColor = color1 * color2 * 2.0;
  } else {
    gl_FragColor = color1;
  } */

  // vec3 color = color1.rgb * color2.rgb * 2.0;
  // vec3 color = color2.rgb;
  // vec4 color = mix(color1, color2, 0.5);
  // vec4 color = color1 + color2;

  /* float alpha = color1.a;
  if (alpha < 0.01) {
    alpha = color2.a;
  } */

  // gl_FragColor = vec4(color.rgb, alpha);
  // gl_FragColor = vec4(color.rgb, color1.a);
  // gl_FragColor = vec4(color.rgb, color2.a * color2.a);
  // gl_FragColor = vec4(color.rgb, max(color1.a, color2.a));
  // gl_FragColor = color;

  if (isBlack(color2)) {
    gl_FragColor = color1;
  } else {
    gl_FragColor = vec4((color1 * color2 * 2.0).rgb, 1.0);
  }
}
