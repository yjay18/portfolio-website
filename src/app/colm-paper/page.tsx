import BackToWorld from "@/components/BackToWorld";

export const metadata = {
  title: "Negotiation Gym — COLM 2025",
  description:
    "AI Agents that learn to haggle through self-optimizing strategies in a multi-agent social simulation environment.",
};

export default function ColmPaperPage() {
  return (
    <main className="min-h-screen bg-[#11080a] text-[#a08b93] font-mono selection:bg-[#44cc66]/30">
      <div className="absolute top-8 left-8 z-50">
        <BackToWorld />
      </div>
      <div className="max-w-4xl mx-auto pt-20 pb-20 px-6">
        
        {/* Terminal Header */}
        <div className="border-4 border-[#2d1a22] bg-[#0a0508] p-6 mb-12 shadow-[8px_8px_0px_#000000]">
          <div className="flex justify-between items-center border-b-2 border-[#2d1a22] pb-4 mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-[#e5e5e5] uppercase tracking-widest text-shadow drop-shadow-[2px_2px_0px_#4a1c28]">
              NEGOTIATION_GYM :: COLM_2025
            </h1>
            <span className="animate-pulse h-4 w-4 bg-[#44cc66]"></span>
          </div>
          
          <p className="text-[#a08b93] text-sm leading-relaxed mb-6">
            [ABSTRACT] Agentic AI toolkit designed for bilateral trading simulations. Models practice, reflect, and actively rewrite their own system prompts.
          </p>
          
          <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
            <a href="https://github.com/chrishokamp/multi-agent-social-simulation" target="_blank" rel="noreferrer" className="bg-[#1e3a5f]/40 border border-[#6699cc] text-[#6699cc] px-4 py-2 hover:bg-[#6699cc] hover:text-[#0a0508] transition-none shadow-[2px_2px_0px_#0a0508]">
              &gt; SRC_OVR_GITHUB
            </a>
            <a href="https://arxiv.org/abs/2510.04368" target="_blank" rel="noreferrer" className="bg-[#4a1c28]/40 border border-[#e11d48] text-[#e11d48] px-4 py-2 hover:bg-[#e11d48] hover:text-[#0a0508] transition-none shadow-[2px_2px_0px_#0a0508]">
              &gt; DOC_OVR_ARXIV
            </a>
          </div>
        </div>

        {/* Console Sections */}
        <div className="space-y-10">
          
          <section className="border-l-2 border-[#44cc66] pl-6">
            <h2 className="text-[#44cc66] text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-lg">■</span> DIRECTIVE_OVERVIEW
            </h2>
            <p className="text-[#e5e5e5] text-sm leading-relaxed mb-4 p-4 bg-[#0a0508] border border-[#2d1a22]">
              NegotiationGym allows researchers to train AI to negotiate via self-optimization. Instead of executing a static simulation, agents engage in episodic rounds, mathematically evaluate utility performance, and utilize a dedicated "coach" module to dynamically rewrite their underlying prompts.
            </p>
          </section>

          <section className="border-l-2 border-[#6699cc] pl-6">
            <h2 className="text-[#6699cc] text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-lg">■</span> SYSTEM_ARCHITECTURE
            </h2>
            
            <div className="bg-[#0a0508] border border-[#1e3a5f] p-6 mb-6 text-xs text-center shadow-[4px_4px_0px_#000000]">
              <div className="text-[#6699cc] font-bold mb-4 uppercase tracking-widest border-b border-[#1e3a5f] pb-2 inline-block">PIPELINE_ROUTE</div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-[#e5e5e5]">
                <div className="border border-[#2d1a22] bg-[#180c12] p-3 w-full md:w-auto uppercase">
                  [ CFG ] JSON Rulebook
                </div>
                <div className="text-[#6699cc]">===&gt;</div>
                <div className="border border-[#2d1a22] bg-[#180c12] p-3 w-full md:w-auto uppercase">
                  [ NET ] SelectorChat
                </div>
                <div className="text-[#6699cc]">===&gt;</div>
                <div className="border border-[#1e3a5f] bg-[#1e3a5f]/20 text-[#6699cc] p-3 w-full md:w-auto uppercase font-bold">
                  [ OPS ] Util & Coach
                </div>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-[#a08b93]">
              <li className="flex items-start gap-2">
                <span className="text-[#6699cc] text-xs mt-1">&gt;</span>
                <span><strong className="text-[#e5e5e5]">CFG_INTERFACE:</strong> Environment specifications defined strictly via JSON, abstracting psychological constraints from backend code.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#6699cc] text-xs mt-1">&gt;</span>
                <span><strong className="text-[#e5e5e5]">ROUTER_NODE:</strong> Boardroom router (AutoGen) maintaining shared history and mathematically granting speaking floor protocols.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#6699cc] text-xs mt-1">&gt;</span>
                <span><strong className="text-[#e5e5e5]">STATE_LOG:</strong> Lightweight object capturing chronological run transcripts for agent reflection analysis.</span>
              </li>
            </ul>
          </section>

          <section className="border-l-2 border-[#e11d48] pl-6">
            <h2 className="text-[#e11d48] text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-lg">■</span> HOOK_EXECUTION
            </h2>
            <p className="text-sm mb-6 leading-relaxed">
              Self-rewriting logic is exposed via two critical, overridable Python hooks within the agent memory node:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#0a0508] border-2 border-[#4a1c28] p-5 shadow-[4px_4px_0px_#000000]">
                <h3 className="text-[#e11d48] text-xs font-bold mb-3 uppercase tracking-widest border-b border-[#4a1c28] pb-2">1. compute_utility()</h3>
                <p className="text-xs text-[#a08b93] leading-relaxed">
                  Extracts agreed price via function calling and calculates a scalar utility score evaluating performance against private minimums.
                </p>
              </div>

              <div className="bg-[#0a0508] border-2 border-[#44cc66]/40 p-5 shadow-[4px_4px_0px_#000000]">
                <h3 className="text-[#44cc66] text-xs font-bold mb-3 uppercase tracking-widest border-b border-[#44cc66]/30 pb-2">2. learn_from_feedback()</h3>
                <p className="text-xs text-[#a08b93] leading-relaxed">
                  Consults "AI Coach" for transcript critique. Rewrites systemic instructions permanently for the next episodic iteration.
                </p>
              </div>
            </div>
          </section>

          <section className="border-l-2 border-[#4a1c28] pl-6">
            <h2 className="text-[#a08b93] text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-lg">■</span> EMPIRICAL_DATA
            </h2>
            
            <div className="bg-[#0a0508] border-2 border-[#2d1a22] mt-6 shadow-[4px_4px_0px_#000000] overflow-hidden text-xs">
              <div className="bg-[#180c12] text-[#44cc66] p-3 font-bold uppercase tracking-widest text-center border-b-2 border-[#2d1a22]">
                TABLE_01: AGREEMENT_RATES [20 TURNS]
              </div>
              <table className="w-full text-left text-[#a08b93]">
                <thead className="bg-[#2d1a22]/30 text-[#e5e5e5] uppercase">
                  <tr>
                    <th className="px-4 py-3 font-normal border-b border-[#2d1a22]">SIM_MODE</th>
                    <th className="px-4 py-3 font-normal border-b border-[#2d1a22]">SURPLUS_CAP</th>
                    <th className="px-4 py-3 font-normal border-b border-[#2d1a22]">AGREEMENTS</th>
                    <th className="px-4 py-3 font-normal border-b border-[#2d1a22]">NO_DEAL_LOST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d1a22]">
                  <tr className="hover:bg-[#180c12] transition-none">
                    <td className="px-4 py-3 text-white">Baseline</td>
                    <td className="px-4 py-3">~35%</td>
                    <td className="px-4 py-3">3/10</td>
                    <td className="px-4 py-3 text-[#e11d48] font-bold">70%</td>
                  </tr>
                  <tr className="hover:bg-[#180c12] transition-none bg-[#44cc66]/5">
                    <td className="px-4 py-3 text-[#44cc66]">Optimized</td>
                    <td className="px-4 py-3">~85%</td>
                    <td className="px-4 py-3">9/10</td>
                    <td className="px-4 py-3 text-white font-bold">10%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm mt-6 leading-relaxed">
              <strong className="text-[#e5e5e5] block mb-2 uppercase tracking-widest text-xs">ASYMMETRIC_ADVANTAGE:</strong>
              Buyer agents computationally exhibited stronger optimization trajectories than Seller agents. Sellers are mathematically bound by their absolute floor price, causing aggressive anchoring to breach limits ("No-Deal"). Buyers possess flexibility to low-ball without immediately risking negotiation breakdown, mathematically highlighting the necessity of role-integrated learning strategies.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
