import type { ReactElement } from "react";
import { MAX_TRAIL } from "../constants";

type TrailLayerProps = {
  agentCount: number;
  colors: string[];
  coreR: number;
};

export function TrailLayer({ agentCount, colors, coreR }: TrailLayerProps) {
  const nodes: ReactElement[] = [];
  for (let agentId = 0; agentId < agentCount; agentId++) {
    for (let step = 0; step < MAX_TRAIL; step++) {
      nodes.push(
        <circle
          key={`${agentId}-${step}`}
          data-trail={`${agentId}-${step}`}
          r={coreR * 0.72}
          fill={colors[agentId] ?? "#ffffff"}
          opacity={0}
          cx={0}
          cy={0}
        />,
      );
    }
  }
  return <g data-trails="true">{nodes}</g>;
}
