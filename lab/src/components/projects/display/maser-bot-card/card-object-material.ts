/**
 * Card body material — Three.js ShaderMaterial on the extruded card.
 *
 * Visual: solid black card face; view-dependent fresnel on the physical
 * rim; quiet pointer sheen on the front, gated by uShineOn.
 * Not a vgpu pass (stage field stays vgpu). Not dither.
 *
 * Uniforms:
 * - uSheenUv (vec2) — pointer on the card face, 0–1, origin bottom-left in local XY
 * - uShineOn (float) — 0 or 1, snapped; never an idle center
 * - uShineA (float) — quiet intensity 0–1
 * - uHalfSize (vec3) — box half extents for local-space face mapping
 *
 * Reduced motion / leave: caller sets uShineOn to 0. No rest fill.
 */
import { ShaderMaterial, Vector2, Vector3 } from "three";

const VERTEX = /* glsl */ `
varying vec3 vViewDir;
varying vec3 vWorldNormal;
varying vec3 vLocal;

void main() {
  vLocal = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vViewDir = cameraPosition - world.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
uniform vec2 uSheenUv;
uniform float uShineOn;
uniform float uShineA;
uniform vec3 uHalfSize;

varying vec3 vViewDir;
varying vec3 vWorldNormal;
varying vec3 vLocal;

void main() {
  vec3 n = normalize(vWorldNormal);
  vec3 v = normalize(vViewDir);
  float ndv = clamp(dot(n, v), 0.0, 1.0);
  float fresnel = pow(1.0 - ndv, 2.6);
  vec3 rim = vec3(0.90, 0.92, 0.96) * fresnel * 0.42;

  vec2 faceUv = vLocal.xy / max(uHalfSize.xy, vec2(0.0001)) * 0.5 + 0.5;
  float onFace = smoothstep(-uHalfSize.z * 0.15, uHalfSize.z * 0.55, vLocal.z);
  float d = length(faceUv - uSheenUv);
  float blob = exp(-d * d * 16.0) * uShineA * 0.14 * uShineOn * onFace;

  vec2 fromSheen = faceUv - uSheenUv;
  float rimSide = clamp(1.0 - length(fromSheen), 0.0, 1.0);
  rim += vec3(0.90, 0.92, 0.96) * fresnel * uShineOn * rimSide * 0.18;

  vec3 col = vec3(0.0) + rim + vec3(blob);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function createCardBodyMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uSheenUv: { value: new Vector2(0.5, 0.5) },
      uShineOn: { value: 0 },
      uShineA: { value: 0 },
      uHalfSize: { value: new Vector3(1, 1, 0.05) },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    toneMapped: false,
  });
}
