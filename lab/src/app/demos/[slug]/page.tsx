import { notFound } from "next/navigation";
import { DemoHost } from "@/components/projects/demo-host";
import { projectsRegistry } from "@/lib/projects-registry";

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
    <div className="maser-lab relative min-h-screen">
      <DemoHost slug={slug} />
    </div>
  );
}
