import ProjectPage from "@/components/ProjectPage";

export const metadata = {
  title: "COLM Paper — Multi-Agent Social Simulation",
  description:
    "Published at COLM. Multi-agent social simulation with NPC overworld, 2D/3D rendering, and dashboard.",
};

export default function ColmPaperPage() {
  return (
    <ProjectPage
      title="Multi-Agent Social Simulation"
      description="Published at COLM. A multi-agent social simulation with NPC overworld, 2D/3D rendering via Three.js, dashboard, and Python backend."
      techStack={[
        "React",
        "Three.js",
        "Python",
        "Multi-Agent Systems",
      ]}
    >
      <p className="text-[var(--text-muted)]">Full content coming soon.</p>
    </ProjectPage>
  );
}
