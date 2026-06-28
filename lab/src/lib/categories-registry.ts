import rawCategories from "@projects/categories.json";
import type {
  CategoriesRegistry,
  CategoryEntry,
  ProjectCategoryId,
} from "@/types/projects-registry";

export const categoriesRegistry = rawCategories as CategoriesRegistry;

export const categoryById = Object.fromEntries(
  categoriesRegistry.categories.map((category) => [category.id, category]),
) as Record<ProjectCategoryId, CategoryEntry>;

export const categoryOrder = categoriesRegistry.categories.map(
  (category) => category.id,
);

export function getCategoryLabel(id: ProjectCategoryId): string {
  return categoryById[id]?.label ?? id;
}
