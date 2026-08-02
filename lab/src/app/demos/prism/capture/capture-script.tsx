"use client";

import { useEffect } from "react";

const CAPTURE_SCRIPT_ID = "figma-html-to-design-capture";
const CAPTURE_SCRIPT_SRC = "https://mcp.figma.com/mcp/html-to-design/capture.js";

export function CaptureScript() {
  useEffect(() => {
    if (document.getElementById(CAPTURE_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = CAPTURE_SCRIPT_ID;
    script.src = CAPTURE_SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
