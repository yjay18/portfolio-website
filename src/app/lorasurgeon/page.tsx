import ProjectPage from "@/components/ProjectPage";

export const metadata = {
  title: "LoRASurgeon — SAE + LoRA Adapter Analysis",
  description:
    "Using sparse autoencoders to reverse-engineer what LoRA adapters learn across 5 domains.",
};

export default function LoraSurgeonPage() {
  return (
    <ProjectPage
      title="LoRASurgeon"
      description="Using sparse autoencoders to reverse-engineer what LoRA adapters actually learn. Compares 5 domain-specific LoRAs (code, medical, math, safety, creative writing) through SAE feature-level differential analysis on Gemma-2-2B."
      techStack={[
        "Python",
        "PyTorch",
        "Gemma-2-2B",
        "Gemma Scope SAEs",
        "LoRA",
        "NF4 Quantization",
      ]}
    >
      <p className="text-[var(--text-muted)]">Full content coming soon.</p>
    </ProjectPage>
  );
}
