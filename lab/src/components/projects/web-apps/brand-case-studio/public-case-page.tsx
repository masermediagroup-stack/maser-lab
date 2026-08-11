"use client";

import { CasePresentation } from "./components/case-presentation";
import type { NormalizedCaseStudy } from "./types";

type PublicCaseStudyPageProps = {
  study: NormalizedCaseStudy;
};

export function PublicCaseStudyPage({ study }: PublicCaseStudyPageProps) {
  return (
    <CasePresentation
      study={study}
      variant="public"
      reducedMotion={false}
    />
  );
}
