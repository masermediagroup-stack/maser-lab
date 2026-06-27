export type ProjectStatus =
  | "draft"
  | "building"
  | "review"
  | "ready"
  | "transferred";

export type ProjectEntry = {
  slug: string;
  title: string;
  status: ProjectStatus;
  description?: string;
};

export type ProjectsRegistry = {
  version: number;
  projects: ProjectEntry[];
};

declare module "@projects/registry.json" {
  const registry: ProjectsRegistry;
  export default registry;
}
