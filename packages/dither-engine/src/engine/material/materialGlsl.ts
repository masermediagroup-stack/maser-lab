/**
 * Procedural material structure + finish GLSL.
 * Each material ID uses distinct math — not palette swaps.
 *
 * sampleMaterialField — modulates luminance before dither
 * applyMaterialUv — optional UV warp (glass / smoke / crt)
 * applyMaterialFinish — post-color finish (scanlines, chrome bands, edges)
 */
export const MATERIAL_GLSL = `
uniform float uMatId;
uniform float uMatStructAmt;
uniform float uMatIxResp;
uniform float uMatLowQ;
uniform vec4 uMatP0;
uniform vec4 uMatP1;
uniform vec4 uMatP2;
uniform vec4 uMatP3;
uniform float uMatLayerBits;

float matHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float matNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = matHash(i);
  float b = matHash(i + vec2(1.0, 0.0));
  float c = matHash(i + vec2(0.0, 1.0));
  float d = matHash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float matFbm(vec2 p, float oct) {
  float v = 0.0;
  float a = 0.5;
  float lim = mix(2.0, oct, 1.0 - uMatLowQ);
  for (int i = 0; i < 5; i++) {
    if (float(i) >= lim) break;
    v += a * matNoise(p);
    p *= 2.05;
    a *= 0.5;
  }
  return v;
}

bool matLayerOn(int bit) {
  return mod(floor(uMatLayerBits / pow(2.0, float(bit))), 2.0) > 0.5;
}

vec2 applyMaterialUv(vec2 uv, float t) {
  if (uMatId < 0.5 || uMatStructAmt < 0.001) return uv;
  vec2 outUv = uv;
  float ix = uMatIxResp * length(uIxPointer - 0.5) * 2.0;

  // Smoke — curl warp
  if (uMatId > 4.5 && uMatId < 5.5) {
    float curl = uMatP0.x;
    float turb = uMatP0.z;
    float drift = uMatP0.w;
    vec2 q = uv * mix(2.0, 5.0, turb) + vec2(t * drift * 0.15, t * drift * 0.08);
    float n = matFbm(q, 3.0);
    outUv += (vec2(n, matNoise(q + 3.1)) - 0.5) * curl * 0.04 * uMatStructAmt;
    outUv += (uIxPointer - uv) * ix * 0.03;
  }

  // Glass — refraction abstraction
  if (uMatId > 7.5 && uMatId < 8.5) {
    float refr = uMatP0.x;
    float frost = uMatP0.y;
    vec2 n = vec2(matNoise(uv * 8.0 + t * 0.05), matNoise(uv * 8.0 + 4.2)) - 0.5;
    outUv += n * refr * 0.035 * uMatStructAmt;
    outUv += n * frost * 0.02;
    outUv += (uIxPointer - 0.5) * ix * refr * 0.04;
  }

  // CRT — barrel curvature
  if (uMatId > 9.5) {
    float curv = uMatP0.w;
    vec2 c = uv - 0.5;
    float r2 = dot(c, c);
    outUv = 0.5 + c * (1.0 + r2 * curv * 0.55 * uMatStructAmt);
  }

  return outUv;
}

/**
 * Returns luminance multiplier / additive structure in .x
 * and sheen / specular additive in .y (0–1)
 */
vec2 sampleMaterialField(vec2 uv, float illum, float t) {
  if (uMatId < 0.5 || uMatStructAmt < 0.001) return vec2(1.0, 0.0);
  if (!matLayerOn(2)) return vec2(1.0, 0.0);

  float amt = uMatStructAmt;
  float ix = uMatIxResp * (0.35 + length(uIxVelocity) * 0.02);
  vec2 lightDir = normalize(vec2(uLsCenterX, uLsCenterY) - uv + 1e-4);

  // Paper — fiber
  if (uMatId < 1.5) {
    float dens = uMatP0.x;
    float dir = uMatP0.y * 6.28318;
    float grain = uMatP0.z;
    float absorb = uMatP0.w;
    float bleed = uMatP1.x;
    vec2 fd = vec2(cos(dir), sin(dir));
    float fiber = matNoise(uv * mix(12.0, 40.0, dens) * mat2(fd.x, -fd.y, fd.y, fd.x));
    float g = matNoise(uv * mix(30.0, 80.0, grain));
    float field = mix(1.0, 0.72 + fiber * 0.35 + g * 0.12, amt);
    field *= mix(1.0, mix(0.85, 1.05, illum), absorb);
    field -= (1.0 - illum) * bleed * 0.08 * amt;
    field -= ix * 0.04 * dens;
    return vec2(clamp(field, 0.45, 1.2), 0.0);
  }

  // Ink — spread / pool
  if (uMatId < 2.5) {
    float spread = uMatP0.x;
    float wet = uMatP0.y;
    float bleed = uMatP0.z;
    float pool = uMatP0.w;
    float smear = uMatP1.x;
    float dens = uMatP1.y;
    float edge = abs(illum - 0.45);
    float poolMask = smoothstep(0.35, 0.0, edge) * pool;
    float n = matFbm(uv * 6.0 + vec2(t * smear * 0.2, 0.0), 3.0);
    float field = 1.0 - dens * 0.25 * amt;
    field -= spread * n * 0.12 * amt;
    field -= bleed * (1.0 - illum) * 0.15 * amt;
    field -= poolMask * wet * 0.18;
    field -= ix * wet * 0.08;
    return vec2(clamp(field, 0.35, 1.1), poolMask * wet * 0.2);
  }

  // Velvet — directional sheen
  if (uMatId < 3.5) {
    float nap = uMatP0.x * 6.28318;
    float width = max(uMatP0.y, 0.05);
    float inten = uMatP0.z;
    float soft = uMatP0.w;
    float shadow = uMatP1.x;
    vec2 napDir = vec2(cos(nap), sin(nap));
    napDir = normalize(mix(napDir, lightDir, ix * 0.5));
    float lobe = pow(max(0.0, dot(normalize(lightDir + napDir), napDir)), mix(4.0, 24.0, 1.0 - width));
    float sheen = lobe * inten * amt;
    float field = mix(1.0 - shadow * 0.35, 1.05, soft);
    field = mix(field, field * 0.75, (1.0 - lobe) * shadow * amt);
    return vec2(clamp(field, 0.4, 1.25), sheen);
  }

  // Metal — brushed anisotropy
  if (uMatId < 4.5) {
    float rough = uMatP0.x;
    float refl = uMatP0.y;
    float brush = uMatP0.z * 6.28318;
    float aniso = uMatP0.w;
    float ox = uMatP1.x;
    float scratch = uMatP1.y;
    vec2 bd = vec2(cos(brush), sin(brush));
    float along = dot(uv * 40.0, bd);
    float brushN = matNoise(vec2(along, dot(uv, vec2(-bd.y, bd.x)) * 4.0));
    float spec = pow(max(illum, 0.0), mix(2.0, 12.0, 1.0 - rough));
    spec *= mix(1.0, brushN * 2.0, aniso);
    float scratches = step(0.92, matNoise(uv * vec2(80.0, 6.0) + bd)) * scratch;
    float field = mix(0.85, 1.1, refl * spec * amt);
    field -= ox * 0.12 * (1.0 - illum);
    field -= scratches * 0.15;
    float sheen = spec * refl * amt + length(uIxPointer - uv) * ix * refl * 0.15;
    return vec2(clamp(field, 0.4, 1.35), clamp(sheen, 0.0, 1.0));
  }

  // Smoke
  if (uMatId < 5.5) {
    float curl = uMatP0.x;
    float dissip = uMatP0.y;
    float turb = uMatP0.z;
    float drift = uMatP0.w;
    float expand = uMatP1.x;
    float dens = uMatP1.y;
    float soft = uMatP1.z;
    vec2 q = uv * mix(1.5, 4.0, turb) + vec2(t * drift * 0.12, -t * drift * 0.07);
    q += vec2(matFbm(q + t * 0.05, 2.0), matFbm(q + 5.2, 2.0)) * curl * 0.35;
    float vol = matFbm(q * mix(1.0, 1.6, expand), mix(2.0, 4.0, 1.0 - uMatLowQ));
    vol = smoothstep(0.25 + dissip * 0.3, 0.75, vol);
    float field = mix(1.0, mix(1.15, 0.65, dens * vol), amt * soft);
    field = mix(field, 1.0, length(uv - uIxPointer) < 0.12 ? ix * 0.35 : 0.0);
    return vec2(clamp(field, 0.5, 1.2), vol * dens * 0.15 * amt);
  }

  // Fog
  if (uMatId < 6.5) {
    float diff = uMatP0.x;
    float dens = uMatP0.y;
    float soft = uMatP0.z;
    float drift = uMatP0.w;
    float vis = uMatP1.x;
    float n = matFbm(uv * mix(1.2, 3.0, dens) + t * drift * 0.05, 3.0);
    float fog = smoothstep(vis, vis + mix(0.2, 0.55, soft), n + illum * 0.25);
    float field = mix(1.0, mix(1.1, 0.7, fog), amt * diff);
    float clear = smoothstep(0.2, 0.05, length(uv - uIxPointer));
    field = mix(field, 1.05, clear * ix * 0.5);
    return vec2(clamp(field, 0.55, 1.15), fog * 0.12 * amt);
  }

  // Cloud
  if (uMatId < 7.5) {
    float scale = uMatP0.x;
    float dens = uMatP0.y;
    float billow = uMatP0.z;
    float breakup = uMatP0.w;
    float layers = mix(1.0, 3.0, uMatP1.x * (1.0 - uMatLowQ * 0.5));
    float soft = uMatP1.y;
    float acc = 0.0;
    for (int i = 0; i < 3; i++) {
      if (float(i) >= layers) break;
      float s = mix(2.0, 7.0, scale) * pow(2.0, float(i));
      acc += matFbm(uv * s + float(i) * 1.7 + t * 0.03, 3.0) / (float(i) + 1.0);
    }
    acc /= max(layers, 1.0);
    float cloud = smoothstep(0.35 - billow * 0.15, 0.7, acc);
    cloud *= 1.0 - breakup * matNoise(uv * 18.0) * 0.45;
    float field = mix(1.0, mix(1.2, 0.55, dens * cloud), amt * soft);
    float selfShadow = cloud * (1.0 - illum) * 0.2 * amt;
    field -= selfShadow;
    return vec2(clamp(field, 0.45, 1.2), cloud * dens * 0.18 * amt);
  }

  // Glass
  if (uMatId < 8.5) {
    float frost = uMatP0.y;
    float clarity = uMatP0.z;
    float edgeT = uMatP0.w;
    float soft = uMatP1.y;
    float edge = max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0;
    float edgeCatch = pow(edge, mix(1.5, 4.0, edgeT)) * edgeT;
    float frostN = matNoise(uv * mix(10.0, 40.0, frost));
    float field = mix(1.0, mix(0.9, 1.05, clarity), amt);
    field = mix(field, field * (0.85 + frostN * 0.2), frost * amt);
    field = mix(field, field * mix(1.0, 0.92, soft), frost);
    return vec2(clamp(field, 0.5, 1.2), edgeCatch * amt);
  }

  // Chrome
  if (uMatId < 9.5) {
    float bands = uMatP0.x;
    float hWidth = max(uMatP0.y, 0.05);
    float curv = uMatP0.z;
    float edgeB = uMatP0.w;
    float refl = uMatP1.x;
    vec2 c = uv - 0.5;
    float env = sin((c.x * 8.0 + c.y * 3.0) * mix(1.0, 3.0, bands) + curv * length(c) * 6.0 + uLsCenterX * 4.0);
    env = env * 0.5 + 0.5;
    float highlight = smoothstep(1.0 - hWidth, 1.0, illum * env);
    float edge = pow(max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0, 2.0) * edgeB;
    float field = mix(0.75, 1.2, env * refl * amt);
    float sheen = (highlight * refl + edge) * amt;
    sheen += (1.0 - length(uv - uIxPointer)) * ix * refl * 0.2;
    return vec2(clamp(field, 0.4, 1.4), clamp(sheen, 0.0, 1.0));
  }

  // CRT
  float scan = uMatP0.x;
  float mask = uMatP0.y;
  float flick = uMatP0.z;
  float chroma = uMatP1.x;
  float noise = uMatP1.y;
  float y = uv.y * mix(120.0, 400.0, scan);
  float scanline = 0.88 + 0.12 * sin(y * 3.14159);
  float ph = mod(floor(uv.x * mix(80.0, 220.0, mask)), 3.0);
  float phosphor = 0.92 + 0.08 * step(1.5, ph);
  float flickerAmt = mix(0.0, flick, step(0.001, flick)) * (0.5 + 0.5 * sin(t * 45.0));
  // reduced motion path handled by capping flick from CPU
  float sig = matNoise(uv * 50.0 + floor(t * 8.0)) * noise;
  float field = mix(1.0, scanline * phosphor, amt);
  field -= sig * 0.12 * amt;
  field *= 1.0 - flickerAmt * 0.08;
  float sheen = chroma * 0.05 * amt;
  return vec2(clamp(field, 0.5, 1.15), sheen);
}

vec3 applyMaterialFinish(vec3 rgb, vec2 uv, float illum, float sheen, float t) {
  if (uMatId < 0.5 || uMatStructAmt < 0.001) return rgb;
  if (!matLayerOn(9) && !matLayerOn(7)) return rgb + sheen * 0.25;

  // Edge treatment
  if (matLayerOn(7)) {
    float edge = max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * 2.0;
    if (uMatId > 0.5 && uMatId < 1.5) {
      // paper warmth on edge
      rgb = mix(rgb, rgb * vec3(1.05, 1.0, 0.92), uMatP1.y * edge * 0.35 * uMatStructAmt);
    }
    if (uMatId > 7.5 && uMatId < 9.5) {
      rgb += sheen * vec3(0.9, 0.95, 1.0) * 0.45;
    } else {
      rgb += sheen * 0.3;
    }
  } else {
    rgb += sheen * 0.25;
  }

  // CRT finish — chromatic + scan already in field; add RGB fringe
  if (uMatId > 9.5 && matLayerOn(9)) {
    float chroma = uMatP1.x * uMatStructAmt;
    float ox = chroma * 0.004;
    rgb.r = mix(rgb.r, rgb.r * 1.05, chroma);
    rgb.b = mix(rgb.b, rgb.b * 0.95, chroma);
    rgb.r += ox * illum;
    rgb.b -= ox * illum * 0.5;
  }

  // Glass tint
  if (uMatId > 7.5 && uMatId < 8.5) {
    float tint = uMatP1.x * uMatStructAmt;
    rgb = mix(rgb, rgb * vec3(0.85, 0.95, 1.05), tint * 0.35);
  }

  return clamp(rgb, 0.0, 1.0);
}
`;
