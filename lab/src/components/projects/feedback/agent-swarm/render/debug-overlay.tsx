import type { Anchor, DebugSnapshot } from "../types";
import { cubicToPathD } from "../engine/path";

type DebugOverlayProps = {
  anchors: Anchor[];
  snapshot: DebugSnapshot | null;
  occupancy: number[];
};

export function DebugOverlay({ anchors, snapshot, occupancy }: DebugOverlayProps) {
  const moves = snapshot?.moves ?? [];
  const paths = snapshot?.paths ?? [];
  const labelAnchor = anchors[0];
  return (
    <g data-debug="true" pointerEvents="none">
      {labelAnchor ? (
        <text
          x={labelAnchor.x - 48}
          y={labelAnchor.y - 28}
          fill="rgba(16,164,255,0.85)"
          fontSize={10}
          fontFamily="ui-monospace, monospace"
        >
          cycle {snapshot?.cycleIndex ?? 0} · {snapshot?.phase ?? "waiting"}
        </text>
      ) : null}
      {paths.map((curve, index) => (
        <path
          key={`path-${index}`}
          d={cubicToPathD(curve)}
          fill="none"
          stroke="rgba(16, 164, 255, 0.45)"
          strokeWidth={1}
        />
      ))}
      {anchors.map((anchor) => (
        <g key={anchor.id} transform={`translate(${anchor.x} ${anchor.y})`}>
          <circle r={2.2} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} />
          <text
            x={8}
            y={-8}
            fill="rgba(255,255,255,0.55)"
            fontSize={9}
            fontFamily="ui-monospace, monospace"
          >
            a{anchor.id}←n{occupancy.findIndex((anchorId) => anchorId === anchor.id)}
          </text>
        </g>
      ))}
      {moves.map((move) => (
        <text
          key={`m-${move.agentId}`}
          x={(anchors[move.toAnchor]?.x ?? 0) + 8}
          y={(anchors[move.toAnchor]?.y ?? 0) + 12}
          fill="rgba(16,164,255,0.8)"
          fontSize={8}
          fontFamily="ui-monospace, monospace"
        >
          {move.agentId}→{move.toAnchor}
        </text>
      ))}
    </g>
  );
}
