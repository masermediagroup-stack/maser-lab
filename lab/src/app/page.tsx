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
      <div className="lab-index flex flex-col gap-12">
        <header className="flex flex-col gap-6">
          <Image
            src="/brand/masermedia-logo-bold-blue.png"
            alt="MaserMedia"
            width={160}
            height={36}
            priority
            className="h-9 w-auto"
          />
          <div className="flex flex-col gap-3">
            <h1 className="lab-type-display text-[var(--lab-text-primary)]">
              Lab
            </h1>
            <p className="lab-type-body max-w-2xl text-[var(--lab-text-secondary)]">
              Build, review, and harden page sections, components, forms, navigation,
              scroll reveals, and motion before transferring to portfolio or client
              deliverables. Specs live in{" "}
              <code className="lab-type-value rounded-md border border-[var(--lab-border)] bg-[var(--lab-surface)] px-2 py-1 text-[var(--lab-text-primary)]">
                projects/
              </code>
              .
            </p>
          </div>
        </header>

        <section className="flex flex-col gap-10" aria-label="Demos">
          {active.length === 0 ? (
            <div className="lab-card p-6">
              <p className="lab-type-title text-[var(--lab-text-primary)]">
                No demos yet
              </p>
              <p className="lab-type-body mt-2 text-[var(--lab-text-secondary)]">
                Copy{" "}
                <code className="lab-type-value rounded bg-[var(--lab-surface-soft)] px-1.5 py-0.5">
                  projects/_template
                </code>{" "}
                to start.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="lab-index-group">
                <h2 className="lab-index-cat lab-type-section text-[var(--lab-text-secondary)]">
                  {group.label}
                </h2>
                <ul className="flex flex-col">
                  {group.projects.map((project) => (
                    <li key={project.slug}>
                      <Link
                        href={`/demos/${project.slug}`}
                        className="lab-index-row"
                      >
                        <span className="lab-type-title text-[var(--lab-text-primary)]">
                          {project.title}
                        </span>
                        {project.description ? (
                          <span className="lab-type-body truncate text-[var(--lab-text-secondary)]">
                            {project.description}
                          </span>
                        ) : null}
                        <span className="lab-type-caption text-[var(--lab-text-muted)]">
                          {project.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
