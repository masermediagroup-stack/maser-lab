/** Effect = none. The assembler omits twEffect; this stub is unused. */

export const EFFECT_NONE_GLSL = /* glsl */ `
EffectResult twEffect(vec3 sphereDir, float time) {
  EffectResult r;
  r.mask = 0.0;
  r.color = vec3(0.0);
  return r;
}
`
