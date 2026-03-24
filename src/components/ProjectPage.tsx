import BackToWorld from "./BackToWorld";

interface ProjectPageProps {
  title: string;
  description: string;
  techStack?: string[];
  children?: React.ReactNode;
}

export default function ProjectPage({
  title,
  description,
  techStack,
  children,
}: ProjectPageProps) {
  return (
    <main className="min-h-screen p-8 pt-20 animate-fade-in">
      <BackToWorld />
      <article className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-[var(--text-muted)] mb-6">{description}</p>
        {techStack && (
          <div className="flex flex-wrap gap-2 mb-8">
            {techStack.map((t) => (
              <span
                key={t}
                className="px-2 py-1 text-xs bg-white/10 rounded text-[var(--text-muted)]"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {children}
      </article>
    </main>
  );
}
