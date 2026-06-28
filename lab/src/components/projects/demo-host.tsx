"use client";

import { demoRegistry } from "@/components/projects/registry";

type DemoHostProps = {
  slug: string;
};

export function DemoHost({ slug }: DemoHostProps) {
  const Demo = demoRegistry[slug];

  if (!Demo) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        Demo component not wired yet. Register it in{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          lab/src/components/projects/registry.ts
        </code>
        .
      </p>
    );
  }

  return <Demo />;
}
