import ProjectPage from "@/components/ProjectPage";

export const metadata = {
  title: "Thesis — ICU Hypotension Early Warning System",
  description:
    "XGBoost/HGB models predicting MAP < 65 mmHg at hourly resolution using MIMIC-IV data.",
};

export default function ThesisPage() {
  return (
    <ProjectPage
      title="ICU Hypotension Early Warning System"
      description="XGBoost/HGB models predicting MAP < 65 mmHg at hourly resolution using MIMIC-IV data. Supervised by Prof. Lucy Hederman and Dr. Yvette Graham at Trinity College Dublin."
      techStack={[
        "Python",
        "XGBoost",
        "HistGradientBoosting",
        "MIMIC-IV",
        "scikit-learn",
        "pandas",
      ]}
    >
      <p className="text-[var(--text-muted)]">Full content coming soon.</p>
    </ProjectPage>
  );
}
