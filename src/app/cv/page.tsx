import BackToWorld from "@/components/BackToWorld";

export const metadata = {
  title: "CV - Yuuv Jauhari",
  description:
    "A terminal-style resume for Yuuv Jauhari, adapted from the CV into the portfolio world interface.",
};

const workExperience = [
  {
    company: "Quantexa",
    location: "Dublin, Ireland",
    period: "01/2025 - 09/2025",
    role: "NLP Data Scientist",
    signal:
      "NLP and machine learning work across sparse ML models, LLMs, feature engineering, and the open-source News Signals Library.",
    details: [
      "Updated the News Signals Library from version 7.2 to 8.2.",
      "Awarded Q4 Innovation for a financial use case demo built with the News API.",
      "Authored a multi-agent simulation research paper recognized at COLM 2025.",
    ],
  },
  {
    company: "Oracle",
    location: "Remote / Ireland",
    period: "05/2024 - 08/2024",
    role: "Analyst",
    signal:
      "Internal applications, data analysis, Essbase multidimensional database training, and Apex/JavaScript delivery.",
    details: [
      "Built Apex application features and JavaScript-based organizational chart tooling.",
      "Produced Excel analysis for corporate initiatives and reporting workflows.",
    ],
  },
  {
    company: "Fathom",
    location: "Dublin, Ireland",
    period: "01/2024 - 04/2024",
    role: "Back End Developer",
    signal:
      "Built Cloud Builder, an open-source CLI for fast AWS infrastructure deployment and management.",
    details: [
      "Reduced cloud setup from documentation-heavy manual flows to a few-code-line deployment path.",
      "Selected for Trinity College Dublin's Software Engineering Industry Awards.",
    ],
  },
  {
    company: "BlastAsia, Inc.",
    location: "Philippines",
    period: "06/2023 - 09/2023",
    role: "Software Engineer Intern",
    signal:
      "Delivered AI prototypes and integrations for internal products and client-facing workflows.",
    details: [
      "Developed an ML model for Figma code generation using organization datasets.",
      "Integrated the ChatGPT API into an active company project.",
      "Built an internal API-connected ML model to improve accuracy.",
    ],
  },
  {
    company: "Propylon",
    location: "Dublin, Ireland",
    period: "01/2023 - 04/2023",
    role: "AI Software Developer",
    signal:
      "Created an ML legal technology system for predicting US state bill passage probability.",
    details: [
      "Trained a text classification model over more than 1,000 legal documents.",
      "Combined text classification, linear regression, ETL, XGBoost, and offline pickle loading.",
      "Improved prediction accuracy from 45% to more than 65%.",
    ],
  },
];

const projects = [
  {
    name: "Cloud Builder",
    period: "01/2024 - 04/2024",
    text:
      "CLI-based AWS infrastructure deployment and management tool, selected for Trinity's Software Engineering Industry Awards and later licensed open-source.",
  },
  {
    name: "US Bill Passing AI Prediction Tool",
    period: "01/2023 - 04/2023",
    text:
      "Legal ML website that predicts state-level bill passage probability from drafted bill text using text classification, regression, ETL, XGBoost, and offline model loading.",
  },
  {
    name: "Google / DCC Air Quality Hackathon",
    period: "02/2023",
    text:
      "Built and pitched a route-planning prototype using Dublin air quality data, targeting up to roughly 60% lower NO2 inhalation with a 4-5 minute route tradeoff.",
  },
  {
    name: "Hindi Video Transcriber",
    period: "04/2023",
    text:
      "A rapid prototype that extracts Hindi audio from video, transcribes it, and summarizes the subject matter.",
  },
  {
    name: "Modified Chess",
    period: "06/2022 - 09/2022",
    text:
      "Java research project exploring mathematical game trees on a scalable 5x5 modified chess board with blocked-square movement rules.",
  },
  {
    name: "Cocktail Website",
    period: "11/2023 - 12/2023",
    text:
      "Course project for searching cocktails, viewing ingredients and instructions, and bookmarking favorites; focused on API integration and backend tests.",
  },
];

const leadership = [
  "Chairperson, DU Netsoc",
  "Competitions Officer, Dublin University Computer Science Society",
  "Event Officer, DU Netsoc",
  "Society Head and Robotics Head, Mother's International Network",
];

const awards = [
  "Project at Google and Dublin City Council Hackathon",
  "Winner of National Designathon, India Innovation League by IncubateIndX",
  "Inspirit AI Scholars Summer Program, Stanford Alumni",
  "Innovation Workshop, Design Innovation Centre, Delhi University",
  "Young Entrepreneurs Program, TiE Global International Entrepreneurs Organization",
];

export default function CvPage() {
  return (
    <main className="min-h-screen bg-[#11080a] text-[#a08b93] font-mono selection:bg-[#44cc66]/30">
      <div className="absolute top-8 left-8 z-50">
        <BackToWorld />
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-24 pt-20">
        <section className="mb-12 border-4 border-[#2d1a22] bg-[#0a0508] p-6 shadow-[8px_8px_0px_#000000]">
          <div className="mb-6 flex flex-col gap-4 border-b-2 border-[#2d1a22] pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#44cc66]">
                RESUME_BOOT_SEQUENCE
              </p>
              <h1 className="text-3xl font-bold uppercase tracking-widest text-[#e5e5e5] drop-shadow-[2px_2px_0px_#4a1c28] md:text-5xl">
                YUUV_JAUHARI
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
              <span className="h-4 w-4 animate-pulse bg-[#44cc66]" />
              <span className="text-[#44cc66]">ONLINE</span>
            </div>
          </div>

          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-[#e5e5e5]">
            [PROFILE] Integrated Computer Science student at Trinity College
            Dublin focused on machine learning, NLP, backend systems, and
            practical software that turns data into useful products.
          </p>

          <div className="grid gap-3 text-xs font-bold uppercase tracking-widest md:grid-cols-3">
            <a
              href="mailto:jauhariyuuv@gmail.com"
              className="border border-[#44cc66] bg-[#14351f]/40 px-4 py-3 text-[#44cc66] shadow-[2px_2px_0px_#0a0508] transition-none hover:bg-[#44cc66] hover:text-[#0a0508]"
            >
              &gt; MAIL_UPLINK
            </a>
            <a
              href="https://linkedin.com/in/yuuv-jauhari-66923a168"
              target="_blank"
              rel="noreferrer"
              className="border border-[#6699cc] bg-[#1e3a5f]/40 px-4 py-3 text-[#6699cc] shadow-[2px_2px_0px_#0a0508] transition-none hover:bg-[#6699cc] hover:text-[#0a0508]"
            >
              &gt; LINKEDIN_NODE
            </a>
            <div className="border border-[#2d1a22] bg-[#180c12] px-4 py-3 text-[#a08b93] shadow-[2px_2px_0px_#0a0508]">
              &gt; DUBLIN_IE
            </div>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <section className="border-l-2 border-[#44cc66] pl-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#44cc66]">
                <span className="text-lg">[]</span> WORK_TRACE
              </h2>
              <div className="space-y-5">
                {workExperience.map((job) => (
                  <article
                    key={`${job.company}-${job.role}`}
                    className="border border-[#2d1a22] bg-[#0a0508] p-5 shadow-[4px_4px_0px_#000000]"
                  >
                    <div className="mb-4 flex flex-col gap-2 border-b border-[#2d1a22] pb-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-base font-bold uppercase tracking-widest text-[#e5e5e5]">
                          {job.role}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-widest text-[#6699cc]">
                          {job.company} / {job.location}
                        </p>
                      </div>
                      <span className="w-fit border border-[#4a1c28] bg-[#180c12] px-3 py-1 text-xs text-[#e11d48]">
                        {job.period}
                      </span>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-[#d9d1d4]">
                      {job.signal}
                    </p>
                    <ul className="space-y-2 text-xs leading-relaxed text-[#a08b93]">
                      {job.details.map((detail) => (
                        <li key={detail} className="flex gap-2">
                          <span className="text-[#44cc66]">&gt;</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="border-l-2 border-[#6699cc] pl-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#6699cc]">
                <span className="text-lg">[]</span> PROJECT_INDEX
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <article
                    key={project.name}
                    className="border-2 border-[#1e3a5f] bg-[#0a0508] p-5 shadow-[4px_4px_0px_#000000]"
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#e5e5e5]">
                        {project.name}
                      </h3>
                      <span className="shrink-0 text-xs text-[#6699cc]">
                        {project.period}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#a08b93]">
                      {project.text}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="border-l-2 border-[#e11d48] pl-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#e11d48]">
                <span className="text-lg">[]</span> PUBLICATION_NODE
              </h2>
              <div className="border-2 border-[#4a1c28] bg-[#0a0508] p-6 shadow-[4px_4px_0px_#000000]">
                <div className="mb-4 flex flex-col gap-2 border-b border-[#4a1c28] pb-4 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-base font-bold uppercase tracking-widest text-[#e5e5e5]">
                    NegotiationGym
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#e11d48]">
                    COLM 2025 / 10-2025
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#d9d1d4]">
                  Self-optimizing agents in a multi-agent social simulation
                  environment, focused on simulating and improving negotiation
                  strategies with feedback-driven learning.
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="border border-[#2d1a22] bg-[#0a0508] p-5 shadow-[4px_4px_0px_#000000]">
              <h2 className="mb-4 border-b border-[#2d1a22] pb-3 text-sm font-bold uppercase tracking-widest text-[#44cc66]">
                EDUCATION_STACK
              </h2>
              <div className="space-y-5 text-xs leading-relaxed">
                <div>
                  <h3 className="text-sm font-bold uppercase text-[#e5e5e5]">
                    Integrated Honors in Computer Science
                  </h3>
                  <p className="mt-1 text-[#6699cc]">Trinity College Dublin</p>
                  <p className="mt-1 text-[#a08b93]">01/2021 - 12/2026</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase text-[#e5e5e5]">
                    High School Diploma in Science
                  </h3>
                  <p className="mt-1 text-[#6699cc]">
                    The Mother&apos;s International School
                  </p>
                  <p className="mt-1 text-[#a08b93]">
                    Class XII: 95% overall / Class X: 93% overall
                  </p>
                </div>
              </div>
            </section>

            <section className="border border-[#1e3a5f] bg-[#0a0508] p-5 shadow-[4px_4px_0px_#000000]">
              <h2 className="mb-4 border-b border-[#1e3a5f] pb-3 text-sm font-bold uppercase tracking-widest text-[#6699cc]">
                LEADERSHIP_LOG
              </h2>
              <ul className="space-y-3 text-xs leading-relaxed text-[#a08b93]">
                {leadership.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#6699cc]">&gt;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border border-[#4a1c28] bg-[#0a0508] p-5 shadow-[4px_4px_0px_#000000]">
              <h2 className="mb-4 border-b border-[#4a1c28] pb-3 text-sm font-bold uppercase tracking-widest text-[#e11d48]">
                AWARD_SIGNALS
              </h2>
              <ul className="space-y-3 text-xs leading-relaxed text-[#a08b93]">
                {awards.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#e11d48]">&gt;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border border-[#2d1a22] bg-[#180c12] p-5 shadow-[4px_4px_0px_#000000]">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#e5e5e5]">
                CERT_CHANNELS
              </h2>
              <p className="text-xs leading-relaxed text-[#a08b93]">
                Stanford statistics and supervised machine learning, Coursera
                Scikit-Learn classification, LinkedIn C/debugging/version
                control/developer tooling coursework.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
