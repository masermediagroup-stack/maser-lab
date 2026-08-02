"use client";

import { useState } from "react";
import { ViewportModeToggle } from "@/components/lab/demo-chrome";
import type { ViewportMode } from "@/components/projects/sign-up/summitpath-sign-up/summitpath-sign-up-section";

export function ShowcaseDemoChrome() {
  const [mode, setMode] = useState<ViewportMode>("responsive");
  return <ViewportModeToggle mode={mode} onChange={setMode} />;
}
