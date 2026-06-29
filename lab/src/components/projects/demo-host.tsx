"use client";

import { demoRegistry } from "@/components/projects/registry";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

type DemoHostProps = {
  slug: string;
};

export function DemoHost({ slug }: DemoHostProps) {
  const Demo = demoRegistry[slug];

  if (!Demo) {
    return (
      <div className="lab-shell flex min-h-screen items-center justify-center p-8">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-xl">Demo not wired</CardTitle>
            <CardDescription className="text-base">
              Register this project in{" "}
              <code className="rounded-md bg-muted px-1.5 py-0.5">
                lab/src/components/projects/registry.ts
              </code>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline" size="lg">
                ← Back to lab
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Demo />;
}
