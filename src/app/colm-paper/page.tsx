import ProjectPage from "@/components/ProjectPage";

export const metadata = {
  title: "Negotiation Gym — COLM 2025",
  description:
    "AI Agents that learn to haggle through self-optimizing strategies in a multi-agent social simulation environment.",
};

export default function ColmPaperPage() {
  return (
    <ProjectPage
      title="Negotiation Gym: Self-Optimizing Agents"
      description="Published at COLM 2025. An open-source toolkit and API for designing, configuring, and running multi-agent social simulations focused on negotiation and cooperation."
      techStack={[
        "Python",
        "Agentic AI",
        "AutoGen",
        "MongoDB",
        "LLMs",
        "Multi-Agent Systems",
      ]}
    >
      <div className="space-y-14">
        <section>
          <div className="flex gap-4 mb-6">
            <a 
              href="https://github.com/chrishokamp/multi-agent-social-simulation" 
              target="_blank" 
              rel="noreferrer"
              className="text-[#4a9eed] hover:text-white transition-colors underline"
            >
              View on GitHub
            </a>
            <span className="text-[var(--text-muted)]">|</span>
            <a 
              href="https://arxiv.org/abs/2510.04368" 
              target="_blank" 
              rel="noreferrer"
              className="text-[#4a9eed] hover:text-white transition-colors underline"
            >
              arXiv:2510.04368
            </a>
          </div>

          <h2 className="text-2xl font-bold mb-4">The Pitch</h2>
          <p className="text-[var(--text-muted)] mb-4 leading-relaxed">
            NegotiationGym allows researchers to train AI to negotiate on their behalf. It provides an open-source playground where Large Language Models (LLMs) don't just execute predefined conversational scripts—they practice, reflect, and actively rewrite their own systemic instructions to secure a better deal in subsequent rounds.
          </p>
          <p className="text-[var(--text-muted)] mb-4 leading-relaxed">
            Instead of executing a static simulation, the agents engage in multiple episodic rounds, mathematically evaluate their utility performance, and utilize a dedicated "coach" module to dynamically rewrite their own underlying system prompts. This creates a highly iterative, self-optimizing approach to complex text-based negotiation tasks without requiring direct human fine-tuning of model weights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Core Architecture</h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            The platform is constructed around a highly modular pipeline designed to separate the semantic reasoning of the models from the rigid rules of the negotiation environment. This separation of concerns allows for complex psychological simulations bounded by strict mathematical limits.
          </p>

          {/* HTML Figure: Architecture Diagram */}
          <div className="bg-[#111533]/30 border border-[#4a9eed]/20 p-6 rounded-xl mb-8">
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest text-center opacity-80">Figure 1: Simulation Pipeline</h4>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center text-sm font-mono text-[var(--text-muted)]">
              <div className="border border-slate-700 p-4 rounded bg-[#0a0e27]/80 w-full md:w-auto">
                <span className="block text-white mb-1">Configuration</span>
                JSON Rulebook
              </div>
              <div className="text-xl">→</div>
              <div className="border border-slate-700 p-4 rounded bg-[#0a0e27]/80 w-full md:w-auto">
                <span className="block text-white mb-1">Boardroom</span>
                SelectorGroupChat
              </div>
              <div className="text-xl">→</div>
              <div className="border border-slate-700 p-4 rounded bg-[#0a0e27]/80 w-full md:w-auto">
                <span className="block text-white mb-1">Feedback Loop</span>
                Utility & Coach
              </div>
            </div>
          </div>

          <ul className="space-y-4 text-[var(--text-muted)] list-disc pl-5">
            <li>
              <strong className="text-white">Configuration Interface:</strong> Environment specifications and agent personas are defined strictly via distinct JSON rulebooks. This abstraction allows researchers and non-engineers to architect complex psychological constraints without modifying backend code.
            </li>
            <li>
              <strong className="text-white">SelectorGroupChat:</strong> A central boardroom router powered by AutoGen. It maintains the shared public history and mathematically dictates which agent is granted the floor to speak next, preventing overlapping hallucinations.
            </li>
            <li>
              <strong className="text-white">State Environment:</strong> A lightweight systemic object capturing chronological logs of finished runs. It bundles transcripts and outcomes so agents can objectively study past concessions and failed agreements during the reflection phase.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Optimization Hooks: Self-Rewriting Code</h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            Unlike traditional Reinforcement Learning (RL) which updates neural network weights, NegotiationGym relies on semantic updates. The systemic logic exposes two crucial, overridable Python hooks within the Agent class that drive the learning loop after an episodic dialogue ends:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#111533]/50 border border-[#8b5cf6]/20 p-6 rounded-xl shadow-inner">
              <h3 className="text-lg font-bold text-white mb-3 font-mono">1. compute_utility()</h3>
              <p className="text-[var(--text-muted)] text-[15px] leading-relaxed">
                The agent computationally extracts the final agreed price via function calling and calculates a scalar utility score (ranging 0.0 to 1.0). This strictly evaluates the agent's performance against its private minimum constraints and baseline targets (e.g. buyer's budget vs. seller's floor). 
              </p>
            </div>

            <div className="bg-[#111533]/50 border border-[#22c55e]/20 p-6 rounded-xl shadow-inner">
              <h3 className="text-lg font-bold text-white mb-3 font-mono">2. learn_from_feedback()</h3>
              <p className="text-[var(--text-muted)] text-[15px] leading-relaxed">
                If the utility score falls below an established expectation curve, the agent consults a separate "AI Coach". The coach reads the recent transcript, critiques strategic blunders (like anchoring too early), and outputs a revised system prompt which permanently replaces the agent's brain for the next episode.
              </p>
            </div>
          </div>
          
          <div className="bg-[#0a0e27] border border-slate-700/50 rounded-lg p-5 font-mono text-sm text-slate-300 overflow-x-auto">
            <div className="text-slate-500 mb-2">// Example Coach Output generated at Runtime</div>
            <div className="text-emerald-400 font-bold mb-1">Critique:</div>
            <div className="mb-3">You revealed your maximum budget in turn 2, destroying your leverage.</div>
            <div className="text-[#4a9eed] font-bold mb-1">New System Prompt:</div>
            <div>"You are a strict buyer. NEVER reveal your true budget. Begin by aggressively anchoring the price 40% below the asking rate, and cite fictional competitor prices to justify your stance."</div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Empirical Case Study: The "No-Deal" Phenomenon</h2>
          <p className="text-[var(--text-muted)] mb-4 leading-relaxed">
            To evaluate the efficacy of the reflection loop, we modeled a bilateral trading simulation mimicking a used laptop sale. Initial empirical testing inside NegotiationGym demonstrated a marked improvement in cumulative average utility when agents utilize the reflection hooks, compared to a static baseline that lacks coaching.
          </p>

          {/* HTML Figure: Results Table */}
          <div className="my-8 overflow-hidden rounded-xl border border-slate-700/60 bg-[#111533]/30">
            <h4 className="text-sm font-bold text-white p-4 border-b border-slate-700/60 uppercase tracking-widest text-center opacity-80 bg-[#0a0e27]/50">
              Figure 2: Agreement Rates over 20 Episodic Turns
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--text-muted)]">
                <thead className="bg-[#111533]/50 text-white font-mono border-b border-slate-700/60">
                  <tr>
                    <th scope="col" className="px-6 py-4">Simulation Mode</th>
                    <th scope="col" className="px-6 py-4">Surplus Captured</th>
                    <th scope="col" className="px-6 py-4">Agreements Reached</th>
                    <th scope="col" className="px-6 py-4">Lost to "No-Deal"</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">Baseline (No Coach)</td>
                    <td className="px-6 py-4">~35%</td>
                    <td className="px-6 py-4">3 / 10</td>
                    <td className="px-6 py-4 text-rose-400 font-bold">70%</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors bg-[#8b5cf6]/5">
                    <td className="px-6 py-4 font-semibold text-purple-300">Optimized (Reflection Active)</td>
                    <td className="px-6 py-4">~85%</td>
                    <td className="px-6 py-4">9 / 10</td>
                    <td className="px-6 py-4 text-emerald-400 font-bold">10%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="text-xl font-bold mt-8 mb-3">The Asymmetric Flexibility Advantage</h3>
          <p className="text-[var(--text-muted)] mb-4 leading-relaxed">
            Furthermore, granular results indicate asymmetric learning curves: Buyer agents computationally exhibited substantially stronger optimization trajectories than Seller agents. When both agents were allowed to learn simultaneously, the Buyer consistently captured a wider margin of the theoretical surplus.
          </p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            This phenomenon occurs because Sellers are mathematically bound strictly by their absolute floor price. Attempting to anchor too aggressively as a seller quickly alienates the buyer and causes abrupt simulation terminations (the "No-Deal"). Buyers, conversely, possess the flexibility to employ diverse low-ball anchoring and psychometric timing tactics to test the seller's floor without immediately risking a fatal breakdown of negotiations. This mathematically highlights the necessity of role-integrated learning strategies in multi-agent networks.
          </p>
        </section>
      </div>
    </ProjectPage>
  );
}
