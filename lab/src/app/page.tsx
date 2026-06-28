import Link from "next/link";
import { categoryById } from "@/lib/categories-registry";
import { groupProjectsByCategory } from "@/lib/group-projects-by-category";
import { projectsRegistry } from "@/lib/projects-registry";

export default function Home() {
  const active = projectsRegistry.projects.filter(
    (p) => p.status !== "transferred",
  );
  const groups = groupProjectsByCategory(active, categoryById);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            Playground
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Micro-interaction lab
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Build and review UI components and motion here. When a project is
            ready, transfer it to your portfolio using the spec in{" "}
            <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
              projects/
            </code>
            .
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            Projects
          </h2>
          {active.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900">
              <p className="font-medium">No projects yet</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Copy{" "}
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                  projects/_template
                </code>{" "}
                to start. Agents should load{" "}
                <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                  micro-interaction-lab
                </code>{" "}
                skill first.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {groups.map((group) => (
                <div key={group.id} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-medium">{group.label}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {group.description}
                    </p>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {group.projects.map((project) => (
                      <li key={project.slug}>
                        <Link
                          href={`/demos/${project.slug}`}
                          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80"
                        >
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="font-medium">{project.title}</span>
                            {project.description ? (
                              <span className="truncate text-sm text-zinc-500">
                                {project.description}
                              </span>
                            ) : null}
                          </div>
                          <span className="ml-4 shrink-0 text-sm capitalize text-zinc-500">
                            {project.status}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            <strong className="text-zinc-900 dark:text-zinc-100">Dev:</strong>{" "}
            <code className="rounded bg-zinc-200/80 px-1 dark:bg-zinc-800">
              cd lab && npm run dev
            </code>
          </p>
          <p>
            <strong className="text-zinc-900 dark:text-zinc-100">
              Agent entry:
            </strong>{" "}
            <code className="rounded bg-zinc-200/80 px-1 dark:bg-zinc-800">
              AGENTS.md
            </code>{" "}
            →{" "}
            <code className="rounded bg-zinc-200/80 px-1 dark:bg-zinc-800">
              micro-interaction-lab
            </code>
          </p>
        </section>
      </div>
    </div>
  );
}
