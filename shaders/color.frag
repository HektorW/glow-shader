precision mediump float;

varying vec4 v_color;

uniform vec3 u_color;

void main(void) {
    gl_FragColor = vec4(v_color.rgb * u_color.rgb, v_color.a);
}