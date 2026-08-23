import type { CSSProperties } from "react";

type AgentNodeProps = {
  id: number;
  x: number;
  y: number;
  color: string;
  coreR: number;
  bloomR: number;
  haloR: number;
  uid: string;
  blend: "normal" | "plus-lighter";
  coreBrightness: number;
};

export function AgentNode({
  id,
  x,
  y,
  color,
  coreR,
  bloomR,
  haloR,
  uid,
  blend,
  coreBrightness,
}: AgentNodeProps) {
  const glowStyle = { mixBlendMode: blend } as CSSProperties;
  return (
    <g data-agent-id={id} data-home-x={x} data-home-y={y}>
      <circle
        data-agent-halo={id}
        r={haloR}
        fill={`url(#${uid}-halo-${id})`}
        style={glowStyle}
      />
      <circle
        data-agent-bloom={id}
        r={bloomR}
        fill={`url(#${uid}-bloom-${id})`}
        style={glowStyle}
      />
      <circle data-agent-core={id} data-base-color={color} r={coreR} fill={color} />
      <circle
        data-agent-sheen={id}
        r={coreR * 0.55}
        fill={`url(#${uid}-core-sheen)`}
        opacity={0.55 + 0.45 * coreBrightness}
      />
    </g>
  );
}
