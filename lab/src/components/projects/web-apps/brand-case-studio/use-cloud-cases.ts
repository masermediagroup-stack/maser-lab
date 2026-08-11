"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback } from "react";
import { api } from "../../../../../convex/_generated/api";
import { isConvexConfigured } from "./convex-provider";
import type { CaseStudy } from "./types";

export function useCloudCaseStudiesEnabled(): boolean {
  return isConvexConfigured();
}

export function useCloudCaseRecords() {
  const enabled = useCloudCaseStudiesEnabled();
  const records = useQuery(api.caseStudies.list, enabled ? {} : "skip");
  return { enabled, records, loading: enabled && records === undefined };
}

export function useCloudCaseSync() {
  const enabled = useCloudCaseStudiesEnabled();
  const upsert = useMutation(api.caseStudies.upsert);
  const remove = useMutation(api.caseStudies.remove);
  const setPublished = useMutation(api.caseStudies.setPublished);

  const syncCase = useCallback(
    async (study: CaseStudy) => {
      if (!enabled) {
        throw new Error("Cloud storage is not configured.");
      }
      await upsert({
        caseId: study.id,
        shareSlug: study.shareSlug ?? study.id,
        published: study.published ?? false,
        data: JSON.stringify(study),
        updatedAt: study.updatedAt,
      });
    },
    [enabled, upsert],
  );

  const deleteCase = useCallback(
    async (caseId: string) => {
      if (!enabled) return;
      await remove({ caseId });
    },
    [enabled, remove],
  );

  const publishCase = useCallback(
    async (study: CaseStudy, shareSlug: string, published: boolean) => {
      if (!enabled) {
        throw new Error("Cloud storage is not configured.");
      }
      await syncCase({ ...study, shareSlug, published });
      await setPublished({ caseId: study.id, shareSlug, published });
    },
    [enabled, setPublished, syncCase],
  );

  return { enabled, syncCase, deleteCase, publishCase };
}

export function parseCloudCaseData(data: string): CaseStudy | null {
  try {
    return JSON.parse(data) as CaseStudy;
  } catch {
    return null;
  }
}
