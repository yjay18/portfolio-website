import ProjectPage from "@/components/ProjectPage";

export const metadata = {
  title: "Games Tracker — Backlog & Reviews",
  description:
    "PS5, Switch, and Laptop game backlog tracker with status and reviews.",
};

export default function GamesTrackerPage() {
  return (
    <ProjectPage
      title="Games Tracker"
      description="Tracking my PS5, Switch 2, and Laptop game backlog. Status, progress, and notes on each title."
    >
      <p className="text-[var(--text-muted)]">Full content coming soon.</p>
    </ProjectPage>
  );
}
