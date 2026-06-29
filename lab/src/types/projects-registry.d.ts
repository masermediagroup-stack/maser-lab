export type ProjectStatus =
  | "draft"
  | "building"
  | "review"
  | "ready"
  | "transferred";

export type ProjectCategoryId =
  | "navigation"
  | "inputs"
  | "sign-up"
  | "feedback"
  | "display"
  | "scroll"
  | "hero-section"
  | "marketing"
  | "layout";

export type ProjectEntry = {
  slug: string;
  title: string;
  status: ProjectStatus;
  category: ProjectCategoryId;
  description?: string;
};

export type ProjectsRegistry = {
  version: number;
  projects: ProjectEntry[];
};

export type CategoryEntry = {
  id: ProjectCategoryId;
  label: string;
  description: string;
};

export type CategoriesRegistry = {
  version: number;
  categories: CategoryEntry[];
};

declare module "@projects/registry.json" {
  const registry: ProjectsRegistry;
  export default registry;
}

declare module "@projects/categories.json" {
  const categories: CategoriesRegistry;
  export default categories;
}
