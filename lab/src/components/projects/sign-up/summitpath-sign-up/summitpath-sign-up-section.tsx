"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  SummitPathSignUpDesktop,
  SummitPathSignUpMobile,
} from "./signup-form";
import { useSignupForm } from "./use-signup-form";
import "./tokens.css";

export type ViewportMode = "desktop" | "mobile" | "responsive";

type SummitPathSignUpSectionProps = {
  forceReducedMotion?: boolean;
  viewportMode?: ViewportMode;
  formDisabled?: boolean;
  className?: string;
};

export function SummitPathSignUpSection({
  forceReducedMotion = false,
  viewportMode = "responsive",
  formDisabled = false,
  className,
}: SummitPathSignUpSectionProps) {
  const osReducedMotion = useReducedMotion();
  const shouldReduceMotion = forceReducedMotion || !!osReducedMotion;
  const form = useSignupForm(shouldReduceMotion, formDisabled);

  if (viewportMode === "desktop") {
    return (
      <div
        className={cn("summitpath-signup", className)}
        data-reduced-motion={shouldReduceMotion ? "true" : undefined}
      >
        <SummitPathSignUpDesktop form={form} reduceMotion={shouldReduceMotion} />
      </div>
    );
  }

  if (viewportMode === "mobile") {
    return (
      <div
        className={cn("summitpath-signup", className)}
        data-reduced-motion={shouldReduceMotion ? "true" : undefined}
      >
        <SummitPathSignUpMobile form={form} reduceMotion={shouldReduceMotion} />
      </div>
    );
  }

  return (
    <div
      className={cn("summitpath-signup w-full", className)}
      data-reduced-motion={shouldReduceMotion ? "true" : undefined}
    >
      <div className="hidden min-[960px]:block">
        <div className="mx-auto w-full max-w-[1920px] overflow-x-auto">
          <SummitPathSignUpDesktop form={form} reduceMotion={shouldReduceMotion} />
        </div>
      </div>
      <div className="block min-[960px]:hidden">
        <div className="mx-auto w-full max-w-[452px]">
          <SummitPathSignUpMobile form={form} reduceMotion={shouldReduceMotion} />
        </div>
      </div>
    </div>
  );
}
