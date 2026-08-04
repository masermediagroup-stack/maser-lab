import { Callout, Grid, H1, Stack, Stat, Text } from "cursor/canvas";

/** Minimal smoke test — if this fails, the canvas host itself is broken. */
export default function CanvasSmokeTest() {
  return (
    <Stack gap={16} style={{ padding: 24 }}>
      <H1>Canvas smoke test</H1>
      <Text tone="secondary">If you can read this, canvas loading works.</Text>
      <Grid columns={3} gap={12}>
        <Stat value="OK" label="Host" tone="success" />
        <Stat value="1" label="File" />
        <Stat value="SDK" label="cursor/canvas" tone="info" />
      </Grid>
      <Callout tone="success" title="Good">
        Open maser-dither-engine.canvas.tsx for the full briefing.
      </Callout>
    </Stack>
  );
}
