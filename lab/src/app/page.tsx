import Image from "next/image";
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
    <div className="maser-lab lab-shell min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-8 py-16">
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Image
              src="/brand/masermedia-logo-bold-blue.png"
              alt="MaserMedia"
              width={160}
              height={36}
              priority
              className="h-9 w-auto"
            />
            <span className="rounded-full border border-[var(--lab-border)] px-3 py-1 font-mono text-xs text-[var(--lab-accent-primary)]">
              Maser-Lab
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-[var(--lab-text-muted)]">
              Senior design engineering
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--lab-text-primary)] md:text-5xl">
              Micro-interaction lab
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--lab-text-secondary)]">
              Build, review, and polish UI components and motion before transferring
              to portfolio or client deliverables. Specs live in{" "}
              <code className="rounded-md border border-[var(--lab-border)] bg-[var(--lab-surface)] px-2 py-1 font-mono text-sm text-[var(--lab-accent-primary)]">
                projects/
              </code>
              .
            </p>
          </div>
        </header>

        <div className="h-px w-full bg-[var(--lab-border)]" />

        <section className="flex flex-col gap-8">
          <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-[var(--lab-text-muted)]">
            Projects
          </h2>
          {active.length === 0 ? (
            <div className="lab-card p-6">
              <p className="text-lg text-[var(--lab-text-primary)]">No projects yet</p>
              <p className="mt-2 text-[var(--lab-text-secondary)]">
                Copy{" "}
                <code className="rounded bg-[var(--lab-surface-soft)] px-1.5 py-0.5 font-mono text-sm">
                  projects/_template
                </code>{" "}
                to start.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {groups.map((group) => (
                <div key={group.id} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-xl font-medium text-[var(--lab-text-primary)]">
                      {group.label}
                    </h3>
                    <p className="text-base text-[var(--lab-text-secondary)]">
                      {group.description}
                    </p>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {group.projects.map((project) => (
                      <li key={project.slug}>
                        <Link href={`/demos/${project.slug}`} className="block">
                          <div className="lab-card flex items-center justify-between gap-4 px-5 py-4">
                            <div className="flex min-w-0 flex-col gap-1">
                              <span className="text-lg font-medium text-[var(--lab-text-primary)]">
                                {project.title}
                              </span>
                              {project.description ? (
                                <span className="truncate text-base text-[var(--lab-text-muted)]">
                                  {project.description}
                                </span>
                              ) : null}
                            </div>
                            <span className="shrink-0 rounded-full border border-[var(--lab-border)] px-3 py-1 font-mono text-xs capitalize text-[var(--lab-accent-secondary)]">
                              {project.status}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="h-px w-full bg-[var(--lab-border)]" />

        <section className="flex flex-col gap-3 font-mono text-sm text-[var(--lab-text-muted)]">
          <p>
            <span className="text-[var(--lab-text-secondary)]">Dev:</span>{" "}
            <code className="rounded border border-[var(--lab-border)] bg-[var(--lab-surface)] px-2 py-1 text-[var(--lab-accent-primary)]">
              cd lab && npm run dev
            </code>
          </p>
          <p>
            <span className="text-[var(--lab-text-secondary)]">Agent entry:</span>{" "}
            <code className="rounded border border-[var(--lab-border)] bg-[var(--lab-surface)] px-2 py-1">
              AGENTS.md
            </code>{" "}
            → micro-interaction-lab
          </p>
        </section>
      </div>
    </div>
  );
}
