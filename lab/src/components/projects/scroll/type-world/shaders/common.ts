/**
 * Shared GLSL helpers for TYPE WORLD surface effects.
 *
 * Hash / value-noise helpers are adapted from Paper Shaders (Apache-2.0):
 * https://github.com/paper-design/shaders
 * Powered by Paper Shaders: https://shaders.paper.design
 *
 * WebGL 1 / GLSL ES 1.0 — no texture() / in-out / version 300.
 */

export const SURFACE_COMMON_GLSL = /* glsl */ `
#ifndef TW_SURFACE_COMMON
#define TW_SURFACE_COMMON

const float TW_PI = 3.141592653589793;
const float TW_TAU = 6.283185307179586;

float twHash11(float n) {
  return fract(sin(n) * 43758.5453123);
}

float twHash13(vec3 p) {
  return twHash11(dot(p, vec3(127.1, 311.7, 74.7)));
}

vec3 twHash33(vec3 p) {
  float n = twHash13(p);
  float n2 = twHash13(p + vec3(19.1, 7.3, 31.7));
  float n3 = twHash13(p + vec3(5.2, 23.9, 11.4));
  return vec3(n, n2, n3);
}

float twValueNoise(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(twHash11(i), twHash11(i + 1.0), u);
}

float twEdgeWidth(float field, float softness) {
  return max(fwidth(field), 1.0e-4) * max(softness, 0.04);
}

vec3 twHashDir(float n) {
  float a = TW_TAU * twHash11(n);
  float z = 2.0 * twHash11(n + 19.13) - 1.0;
  float r = sqrt(max(0.0, 1.0 - z * z));
  return vec3(r * cos(a), z, r * sin(a));
}

vec3 twRotateAxis(vec3 v, vec3 axis, float ang) {
  vec3 k = normalize(axis);
  float c = cos(ang);
  float s = sin(ang);
  return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
}

vec3 twFibonacciDir(float i, float n) {
  float z = 1.0 - 2.0 * (i + 0.5) / max(n, 1.0);
  float rr = sqrt(max(0.0, 1.0 - z * z));
  float phi = 2.399963229728653 * i;
  return vec3(rr * cos(phi), z, rr * sin(phi));
}

#endif
`
