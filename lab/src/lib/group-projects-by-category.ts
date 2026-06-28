import { categoryOrder } from "@/lib/categories-registry";
import type { ProjectEntry, ProjectCategoryId } from "@/types/projects-registry";

export type ProjectCategoryGroup = {
  id: ProjectCategoryId;
  label: string;
  description: string;
  projects: ProjectEntry[];
};

export function groupProjectsByCategory(
  projects: ProjectEntry[],
  categoryMeta: Record<
    ProjectCategoryId,
    { label: string; description: string }
  >,
): ProjectCategoryGroup[] {
  const grouped = new Map<ProjectCategoryId, ProjectEntry[]>();

  for (const project of projects) {
    const existing = grouped.get(project.category) ?? [];
    existing.push(project);
    grouped.set(project.category, existing);
  }

  return categoryOrder
    .filter((id) => grouped.has(id))
    .map((id) => ({
      id,
      label: categoryMeta[id]?.label ?? id,
      description: categoryMeta[id]?.description ?? "",
      projects: grouped.get(id) ?? [],
    }));
}
