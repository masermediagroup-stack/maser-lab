"use client";

import { useState } from "react";
import {
  ViewportModeToggle,
  type ViewportMode,
} from "@/components/lab/demo-chrome";

export function ShowcaseDemoChrome() {
  const [mode, setMode] = useState<ViewportMode>("responsive");
  return <ViewportModeToggle mode={mode} onChange={setMode} />;
}
