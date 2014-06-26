attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_position;
uniform vec2 u_scale;

void main(void){
	vec2 scaled = a_position * u_scale;

	vec2 translated = scaled + u_position;

	vec2 zeroToOne = translated / u_resolution;

	vec2 zeroToTwo = zeroToOne * 2.0;

	vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(vec2(clipSpace.x, -clipSpace.y), 0, 1);
}