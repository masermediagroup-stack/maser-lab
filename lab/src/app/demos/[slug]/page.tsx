import Link from "next/link";
import { notFound } from "next/navigation";
import { projectsRegistry } from "@/lib/projects-registry";
import { DemoHost } from "@/components/projects/demo-host";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return projectsRegistry.projects.map((project) => ({ slug: project.slug }));
}

export default async function DemoPage({ params }: PageProps) {
  const { slug } = await params;
  const project = projectsRegistry.projects.find(
    (entry) => entry.slug === slug,
  );

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            ← Lab
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.title}
          </h1>
          <p className="text-sm capitalize text-zinc-500">{project.status}</p>
        </header>

        <section
          aria-label={`${project.title} demo`}
          className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <DemoHost slug={slug} />
        </section>
      </div>
    </div>
  );
}
