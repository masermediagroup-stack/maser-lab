import { PrismNavDemo } from "@/components/projects/navigation/prism";
import { CaptureScript } from "./capture-script";

/** Nav-only canvas for Figma capture — no lab chrome */
export default function PrismCapturePage() {
  return (
    <>
      <CaptureScript />
      <PrismNavDemo minimal />
    </>
  );
}
