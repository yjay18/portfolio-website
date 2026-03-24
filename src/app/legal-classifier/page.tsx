import ProjectPage from "@/components/ProjectPage";

export const metadata = {
  title: "Legal Classifier — US State Law Passage Predictor",
  description:
    "Predicting the probability of a law passing in a US state using machine learning.",
};

export default function LegalClassifierPage() {
  return (
    <ProjectPage
      title="Legal Classifier"
      description="A machine learning system that predicts the probability of a law passing in a US state. Trained on historical legislative data with feature engineering on bill text, sponsor metadata, and committee outcomes."
      techStack={["Python", "scikit-learn", "NLP", "Legislative Data"]}
    >
      <p className="text-[var(--text-muted)]">Full content coming soon.</p>
    </ProjectPage>
  );
}
