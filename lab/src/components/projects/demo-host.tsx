"use client";

import Link from "next/link";
import { demoRegistry } from "@/components/projects/registry";

type DemoHostProps = {
  slug: string;
};

export function DemoHost({ slug }: DemoHostProps) {
  const Demo = demoRegistry[slug];

  if (!Demo) {
    return (
      <div className="maser-lab lab-shell flex min-h-screen items-center justify-center p-8">
        <div className="lab-card w-full max-w-lg p-6">
          <h1 className="lab-type-title text-[var(--lab-text-primary)]">
            Demo not wired
          </h1>
          <p className="lab-type-body mt-2 text-[var(--lab-text-secondary)]">
            Register this project in{" "}
            <code className="lab-type-value rounded-md border border-[var(--lab-border)] bg-[var(--lab-surface)] px-1.5 py-0.5">
              lab/src/components/projects/registry.ts
            </code>
            .
          </p>
          <p className="mt-4">
            <Link href="/" className="lab-back-link lab-type-label">
              Lab
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return <Demo />;
}
