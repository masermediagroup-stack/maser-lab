/** URL-safe slug for public share links. */
export function slugifyShare(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "case-study"
  );
}

export function buildShareSlug(client: string, projectTitle: string, caseId: string): string {
  const base = slugifyShare(client || projectTitle || "case-study");
  const suffix = caseId.replace(/^case-/, "").slice(-8) || caseId.slice(-8);
  return `${base}-${suffix}`;
}

export function sharePath(shareSlug: string): string {
  return `/case/${shareSlug}`;
}

export function shareUrl(shareSlug: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${sharePath(shareSlug)}`;
}
