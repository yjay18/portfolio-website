import ProjectPage from "@/components/ProjectPage";

export const metadata = {
  title: "Neural Dungeon — Roguelike Where the Dungeon IS a Neural Network",
  description:
    "A roguelike where rooms are neurons, corridors are weighted connections, and the map reshapes via gradient updates.",
};

export default function NeuralDungeonPage() {
  return (
    <ProjectPage
      title="Neural Dungeon"
      description="A roguelike where the dungeon IS a neural network. Rooms are neurons, corridors are weighted connections, and the map reshapes via gradient updates based on your playstyle. Part of The Fun Game — a multi-genre experience with stat carryover."
      techStack={[
        "Python",
        "Pygame",
        "PyInstaller",
        "Neural Networks",
      ]}
    >
      <p className="text-[var(--text-muted)]">Full content coming soon.</p>
    </ProjectPage>
  );
}
