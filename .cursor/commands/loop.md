# Loop Command

Run a prompt or skill on a recurring or variable interval for iterative quality improvement.

## Usage

`/loop [interval] <prompt>`

Examples:

- `/loop 5m npm run lint in lab and fix errors`
- `/loop tune shader uniforms for mobile perf`
- `/loop` (dynamic — agent chooses next delay)

## Implementation

Follow the Cursor **loop** skill behavior:

- User-level skill: `~/.cursor/skills-cursor/loop/SKILL.md`
- Fixed schedule: background shell with `AGENT_LOOP_TICK_<purpose>` sentinel
- Dynamic schedule: self-paced with `AGENT_LOOP_WAKE_<purpose>` heartbeat

## Maser-Lab discipline

Each iteration must answer:

1. What are we checking?
2. What did we find?
3. What did we fix?
4. What still needs review?
5. Did quality improve?
6. Token cost justified?
7. Reusable workflow candidate?

## When to use in Maser-Lab

- Shader tuning
- 3D scene performance passes
- UX refinement after Interaction UX agent
- Build/lint error resolution
- Figma-to-code cleanup

## Related

- `/loop-status` — inspect progress
- `/maser-threejs` — Three.js research + implement workflow

Do not create loops without a clear quality target.
