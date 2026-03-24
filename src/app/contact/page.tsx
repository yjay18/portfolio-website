import ProjectPage from "@/components/ProjectPage";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact — Yuuv Jauhari",
  description: "Get in touch with Yuuv Jauhari.",
};

export default function ContactPage() {
  return (
    <ProjectPage
      title="Contact"
      description="Drop me a message and I'll get back to you."
    >
      <ContactForm />
    </ProjectPage>
  );
}
