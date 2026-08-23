import { COLOR_PALETTES } from "../constants";
import type { AgentSwarmColorMode } from "../types";

type GlowDefsProps = {
  uid: string;
  colors: string[];
  colorMode: AgentSwarmColorMode;
};

export function GlowDefs({ uid, colors, colorMode }: GlowDefsProps) {
  const fallback = COLOR_PALETTES.white[0] ?? "#ffffff";
  return (
    <defs>
      {colors.map((color, index) => {
        const accent = colorMode === "white" ? "#ffffff" : color;
        return (
          <g key={`grad-${index}`}>
            <radialGradient id={`${uid}-halo-${index}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
              <stop offset="38%" stopColor={accent} stopOpacity="0.08" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${uid}-bloom-${index}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="28%" stopColor={accent} stopOpacity="0.45" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          </g>
        );
      })}
      <radialGradient id={`${uid}-core-sheen`} cx="38%" cy="34%" r="60%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="55%" stopColor={fallback} stopOpacity="0.35" />
        <stop offset="100%" stopColor={fallback} stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}
