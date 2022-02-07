uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;

varying float vElevation;

void main() 
{
  // mix -> first two args have to be the same type (vec2, float etc.)
  //        third arg will be the amount of mixing 
  //          (e.g. 0 = all first color, 1 = all second color, 0.5 = perfect mix of the two)
  //        '* 5.0 + 0.5' because currently the vElevation goes from -0.2 to 0.2, rather than 0 to 1
  vec3 color = mix(uDepthColor, uSurfaceColor, vElevation * 5.0 + 0.5);

  gl_FragColor = vec4(color, 1.0);
}