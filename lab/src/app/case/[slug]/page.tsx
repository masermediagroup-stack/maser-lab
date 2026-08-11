import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { PublicCaseStudyPage } from "@/components/projects/web-apps/brand-case-studio/public-case-page";
import { normalizeCaseStudy } from "@/components/projects/web-apps/brand-case-studio/normalize";
import type { CaseStudy } from "@/components/projects/web-apps/brand-case-studio/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function fetchPublishedCase(slug: string): Promise<CaseStudy | null> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;

  const client = new ConvexHttpClient(url);
  const record = await client.query(api.caseStudies.getPublishedByShareSlug, {
    shareSlug: slug,
  });
  if (!record) return null;

  try {
    return JSON.parse(record.data) as CaseStudy;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = await fetchPublishedCase(slug);
  if (!study) {
    return { title: "Case study not found" };
  }
  return {
    title: `${study.projectTitle || study.client} — Brand Case Study`,
    description: study.summary || study.tagline,
  };
}

export default async function CaseSharePage({ params }: PageProps) {
  const { slug } = await params;
  const raw = await fetchPublishedCase(slug);
  if (!raw) notFound();

  const study = normalizeCaseStudy(raw);
  return <PublicCaseStudyPage study={study} />;
}
