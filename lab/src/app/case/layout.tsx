import type { ReactNode } from "react";
import { Instrument_Serif } from "next/font/google";
import "../globals.css";
import "@/components/projects/web-apps/brand-case-studio/tokens.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export default function CaseShareLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`brand-case-studio ${instrumentSerif.variable} min-h-screen`}>
      {children}
    </div>
  );
}
