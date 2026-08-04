import {
  BarChart,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  Pill,
  Row,
  Spacer,
  Stack,
  Stat,
  Table,
  Text,
} from "cursor/canvas";

/**
 * Maser Dither Engine — co-founder briefing canvas.
 * Uses only exported cursor/canvas primitives (Stack + Row, not HStack/VStack).
 */
export default function MaserDitherEngineCanvas() {
  return (
    <Stack gap={28} style={{ padding: 28 }}>
      <Stack gap={8}>
        <H1>Maser Dither Engine</H1>
        <Text tone="secondary">
          GPU dither material system for Maser-Lab — how the pipeline works,
          where it ships today, and where it can go next.
        </Text>
        <Row gap={8} wrap>
          <Pill active>v0.7.10</Pill>
          <Pill>WebGL 1</Pill>
          <Pill>Card mobile preview</Pill>
          <Pill>Stable progress clip</Pill>
        </Row>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value="7" label="Animation modes" tone="info" />
        <Stat value="8" label="Live adapters" tone="success" />
        <Stat value="1" label="Shared GLSL core" />
        <Stat value="N" label="Brand skins via tokens" tone="warning" />
      </Grid>

      <Callout tone="info" title="One sentence">
        One WebGL shader pipeline feeds every surface — progress, loader, hero,
        button, badge, text, icon, card — so motion and brand stay coherent
        without duplicating GPU code.
      </Callout>

      <Callout tone="success" title="Start here — component background">
        Every playground opens with a Black or White base plate. Pick that first;
        palettes and finer color slots build on top and keep your plate choice.
      </Callout>

      <Divider />

      <Stack gap={12}>
        <H2>Control layers</H2>
        <Grid columns={4} gap={12}>
          <Card>
            <CardHeader>Base plate</CardHeader>
            <CardBody>
              <Stack gap={6}>
                <Text>Black or White only</Text>
                <Text tone="secondary" size="small">
                  First control in the playground. Sets the GPU plate + preview stage.
                </Text>
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Content</CardHeader>
            <CardBody>
              <Stack gap={6}>
                <Text>Copy, CTA, speed, labels</Text>
                <Text tone="secondary" size="small">
                  Editor-facing. Safe for clients to tune.
                </Text>
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Style</CardHeader>
            <CardBody>
              <Stack gap={6}>
                <Text>Palette, pattern, intensity</Text>
                <Text tone="secondary" size="small">
                  Brand skin without touching GLSL.
                </Text>
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Motion</CardHeader>
            <CardBody>
              <Stack gap={6}>
                <Text>Mode, direction, scale</Text>
                <Text tone="secondary" size="small">
                  Animation catalog + spiral UV zoom.
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
      </Stack>

      <Divider />

      <Stack gap={12}>
        <H2>Pipeline — GPU stage order</H2>
        <Text tone="secondary">
          Fragment work runs left → right every frame. Interaction and
          animation bend UVs early; dither + color decide the final look.
        </Text>
        <Table
          headers={["#", "Stage", "Job", "Owner"]}
          rows={[
            ["1", "UV + cover", "Fit texture to surface", "pipeline"],
            ["2", "Pointer warp", "Soft hover / press field", "PointerPhysics"],
            ["3", "Animation UV", "Mode motion (scan, spiral…)", "animGlsl"],
            ["4", "Dither pattern", "Bayer / noise / hatch…", "ditherGlsl"],
            ["5", "Color map", "Palette / heat / mono", "colorGlsl"],
            ["6", "Composite", "Opacity + blend out", "fragment out"],
          ]}
          rowTone={[undefined, "info", "info", undefined, "success", undefined]}
        />
      </Stack>

      <Divider />

      <Stack gap={12}>
        <H2>Where it shows up</H2>
        <Text tone="secondary">
          Same engine, eight adapters. Softness and intensity differ by surface
          — not by forked shaders.
        </Text>
        <BarChart
          categories={[
            "Progress",
            "Loader",
            "Hero",
            "Button",
            "Badge",
            "Text",
            "Icon",
            "Card",
          ]}
          series={[
            {
              name: "Fill / presence",
              data: [92, 88, 95, 70, 55, 48, 42, 78],
              tone: "info",
            },
          ]}
          height={200}
        />
        <Grid columns={3} gap={12}>
          <Card>
            <CardHeader>Chrome</CardHeader>
            <CardBody>
              <Text>
                Progress + loader: continuous phase, speed without reset,
                feathered caps.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Marketing</CardHeader>
            <CardBody>
              <Text>
                Hero + featured card: tall framed media, bottom scrim copy, dithered cream CTA.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>UI atoms</CardHeader>
            <CardBody>
              <Text>
                Button, badge, text, icon: lighter touch so type stays legible.
              </Text>
            </CardBody>
          </Card>
        </Grid>
      </Stack>

      <Divider />

      <Stack gap={12}>
        <H2>Shipped through v0.7.10</H2>
        <Table
          headers={["Sprint", "Outcome", "Status"]}
          rows={[
            ["7.0", "Workspace shell + live adapters", "done"],
            ["7.1", "Stable playground + material dock", "done"],
            ["7.2–7.3", "Presets, projects, transfer path", "done"],
            ["7.4", "Pointer field + interaction UX", "done"],
            [
              "7.5",
              "Progress continuity · palette depth · loader · spiral scale · damp",
              "done",
            ],
            [
              "7.6",
              "Black / White component base plate (first control + preview stage)",
              "done",
            ],
            [
              "7.7",
              "Fullscreen size · Corner control · solid labels · mobile touch",
              "done",
            ],
            [
              "7.8",
              "Featured card · inset frame · scrim copy · dithered pill CTA",
              "done",
            ],
            [
              "7.9",
              "Mobile FS shell · avatar size · progress clip-path (no GL flash)",
              "done",
            ],
            [
              "7.10",
              "Card visible in mobile Preview (vw size · FitStage measure)",
              "done",
            ],
          ]}
          rowTone={[
            "success",
            "success",
            "success",
            "success",
            "success",
            "success",
            "success",
            "success",
            "success",
            "success",
          ]}
          columnAlign={["left", "left", "center"]}
        />
      </Stack>

      <Divider />

      <Stack gap={12}>
        <H2>Future directions</H2>
        <Text tone="secondary">
          Ranked for portfolio impact vs. engine risk. Prefer extending
          uniforms and adapters — keep the shared sample pipeline intact.
        </Text>
        <Table
          headers={["Idea", "Why it matters", "Effort", "Risk"]}
          rows={[
            [
              "Preset marketplace cards",
              "Clients pick a look in one click",
              "M",
              "Low",
            ],
            [
              "Scroll-linked intensity",
              "Sections breathe on enter",
              "M",
              "Low",
            ],
            [
              "Audio-reactive uniforms",
              "Show / launch moments",
              "L",
              "Med",
            ],
            [
              "Multi-stop designer palettes",
              "Deeper brand matching",
              "M",
              "Low",
            ],
            [
              "Export kit (codesandbox)",
              "Faster client handoff",
              "L",
              "Low",
            ],
            [
              "WebGPU path (opt-in)",
              "Future-proof GPU headroom",
              "XL",
              "High",
            ],
          ]}
          rowTone={[
            "success",
            "success",
            "warning",
            "success",
            "info",
            "danger",
          ]}
        />
      </Stack>

      <Stack gap={12}>
        <H2>Effect ideas worth prototyping</H2>
        <Grid columns={2} gap={12}>
          <Card>
            <CardHeader>Ordered dither films</CardHeader>
            <CardBody>
              <Text>
                Print-style Bayer grades as named film stocks — swap stocks,
                keep layout.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Heat + data ink</CardHeader>
            <CardBody>
              <Text>
                Heat-map ramp on charts and status strips — data that feels
                physical.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Spiral reveal</CardHeader>
            <CardBody>
              <Text>
                Scale + twist for modal/route entrances — one mode, many
                surfaces.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Pointer spotlight</CardHeader>
            <CardBody>
              <Text>
                Already damped: market as “live material” for heroes and feature
                grids.
              </Text>
            </CardBody>
          </Card>
        </Grid>
      </Stack>

      <Divider />

      <Grid columns={3} gap={12}>
        <Stack gap={4}>
          <Text weight="semibold">Demo</Text>
          <Text tone="secondary" size="small">
            /demos/maser-dither-engine
          </Text>
        </Stack>
        <Stack gap={4}>
          <Text weight="semibold">Constraint</Text>
          <Text tone="secondary" size="small">
            Extend shell/adapters — don’t fork shared GLSL
          </Text>
        </Stack>
        <Stack gap={4}>
          <Text weight="semibold">Transfer</Text>
          <Text tone="secondary" size="small">
            Product barrel + tokens · lab chrome stays behind
          </Text>
        </Stack>
      </Grid>

      <Spacer />
      <Text tone="tertiary" size="small">
        Maser-Lab · display/maser-dither-engine · canvas briefing
      </Text>
    </Stack>
  );
}
