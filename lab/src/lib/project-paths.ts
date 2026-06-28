/**
 * Canonical on-disk paths for lab projects.
 * Folder layout: {category}/{slug}/
 */
export function projectComponentDir(
  category: string,
  slug: string,
): string {
  return `lab/src/components/projects/${category}/${slug}`;
}

export function projectSpecDir(category: string, slug: string): string {
  return `projects/${category}/${slug}`;
}

export function projectComponentImportPath(
  category: string,
  slug: string,
): string {
  return `@/components/projects/${category}/${slug}`;
}
