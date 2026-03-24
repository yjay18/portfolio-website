import ProjectPage from "@/components/ProjectPage";

export const metadata = {
  title: "CopyBot — Polymarket Copy-Trading Bot",
  description:
    "Copy-trading bot for Polymarket with wallet tracking, risk management, and React dashboard.",
};

export default function CopybotPage() {
  return (
    <ProjectPage
      title="CopyBot"
      description="A Polymarket copy-trading bot with wallet tracker, chain monitor, discovery engine, scout engine, paper trader, risk manager, decay monitor, and trade executor. Full React/TypeScript dashboard with PnL charts and allocation tracking."
      techStack={[
        "Python",
        "React",
        "TypeScript",
        "Web3",
        "Polymarket API",
      ]}
    >
      <p className="text-[var(--text-muted)]">Full content coming soon.</p>
    </ProjectPage>
  );
}
