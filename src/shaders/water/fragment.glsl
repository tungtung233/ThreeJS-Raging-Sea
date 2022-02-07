uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main() 
{
  // the reason why we have to add an offset and multiplier is because vElevation currently goes from -0.2 to 0.2, rather than 0 to 1
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;

  // mix -> first two args have to be the same type (vec2, float etc.)
  //        third arg will be the amount of mixing 
  //          (e.g. 0 = all first color, 1 = all second color, 0.5 = perfect mix of the two)
  vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

  gl_FragColor = vec4(color, 1.0);
}