import ProjectPage from "@/components/ProjectPage";

export const metadata = {
  title: "About — Yuuv Jauhari",
  description:
    "5th year Integrated Computer Science Master's student at Trinity College Dublin.",
};

export default function AboutPage() {
  return (
    <ProjectPage
      title="About Me"
      description="5th year Integrated Computer Science Master's student at Trinity College Dublin. Focused on ML/AI research, game development, and building systems that solve real problems."
      techStack={[
        "Python",
        "TypeScript",
        "React",
        "PyTorch",
        "Next.js",
        "PostgreSQL",
      ]}
    >
      <p className="text-[var(--text-muted)]">Full content coming soon.</p>
    </ProjectPage>
  );
}
