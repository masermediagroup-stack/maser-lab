import type { TransitionDefinition, TransitionSettings } from "./types";

export function generateSettingsSummary(settings: TransitionSettings) {
  return `duration: ${settings.duration}ms
intensity: ${settings.intensity}
stagger: ${settings.stagger}ms
radius: ${settings.radius}px`;
}

export function generateTransitionCode(
  definition: TransitionDefinition,
  settings: TransitionSettings,
) {
  return `// ${definition.title}
// Route transition starter. Replace previousPage and nextPage with route content.

const transitionSettings = {
  duration: ${settings.duration},
  intensity: ${settings.intensity},
  stagger: ${settings.stagger},
  radius: ${settings.radius},
};

export function RouteTransitionShell({
  phase,
  previousPage,
  nextPage,
}: {
  phase: "idle" | "animating";
  previousPage: React.ReactNode;
  nextPage: React.ReactNode;
}) {
  return (
    <section
      className="route-transition"
      data-transition="${definition.id}"
      data-phase={phase}
      style={
        {
          "--route-duration": \`\${transitionSettings.duration}ms\`,
          "--route-intensity": transitionSettings.intensity,
          "--route-stagger": \`\${transitionSettings.stagger}ms\`,
          "--route-radius": \`\${transitionSettings.radius}px\`,
        } as React.CSSProperties
      }
    >
      <div className="route-transition__page route-transition__page--previous">
        {previousPage}
      </div>
      <div className="route-transition__page route-transition__page--next">
        {nextPage}
      </div>
      <span className="route-transition__cover" aria-hidden="true" />
    </section>
  );
}

/* CSS: copy the ${definition.id} block from page-transitions-lab/tokens.css,
   then wire phase changes to your router lifecycle. */`;
}
