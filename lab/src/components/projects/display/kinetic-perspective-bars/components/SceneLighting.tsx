"use client";

export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.35} color="#c8c8d0" />
      <directionalLight
        position={[3.5, 6, 4]}
        intensity={0.55}
        color="#e8e8f0"
      />
      <directionalLight
        position={[-4, 2, -2]}
        intensity={0.18}
        color="#8890a0"
      />
      <hemisphereLight
        args={["#1a1a22", "#050506", 0.4]}
      />
    </>
  );
}
