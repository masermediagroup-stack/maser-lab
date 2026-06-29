import { PrismNavDemo } from "@/components/projects/navigation/prism";
import Script from "next/script";

/** Nav-only canvas for Figma capture — no lab chrome */
export default function PrismCapturePage() {
  return (
    <>
      <Script
        src="https://mcp.figma.com/mcp/html-to-design/capture.js"
        strategy="afterInteractive"
      />
      <PrismNavDemo minimal />
    </>
  );
}
