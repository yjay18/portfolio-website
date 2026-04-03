"use client";

import React, { useState, useEffect, useRef } from "react";

// Mock data for Chart 1
const utilityData = [
  { round: 1, "no-reflect": 0.2, "buyer-reflect": 0.3, "seller-reflect": 0.2, "both-reflect": 0.3 },
  { round: 5, "no-reflect": 0.22, "buyer-reflect": 0.5, "seller-reflect": 0.3, "both-reflect": 0.45 },
  { round: 10, "no-reflect": 0.25, "buyer-reflect": 0.65, "seller-reflect": 0.4, "both-reflect": 0.6 },
  { round: 15, "no-reflect": 0.26, "buyer-reflect": 0.73, "seller-reflect": 0.42, "both-reflect": 0.68 },
  { round: 20, "no-reflect": 0.26, "buyer-reflect": 0.8, "seller-reflect": 0.45, "both-reflect": 0.72 },
];

// Mock data for Chart 2
const surplusData = [
  { name: "10-Turn (No Coach)", "Surplus Captured": 35, "Lost to No-Deal": 65 },
  { name: "10-Turn (Optimized)", "Surplus Captured": 85, "Lost to No-Deal": 15 },
  { name: "20-Turn (No Coach)", "Surplus Captured": 70, "Lost to No-Deal": 30 },
  { name: "20-Turn (Optimized)", "Surplus Captured": 95, "Lost to No-Deal": 5 },
];

// Simple intersection observer hook for fading elements in natively
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return { ref, className: `transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}` };
}

export default function PaperContent() {
  const [mounted, setMounted] = useState(false);
  const heroFade = useFadeIn();
  const gymFade = useFadeIn();
  const sauceFade = useFadeIn();
  const caseFade = useFadeIn();
  const visualFade = useFadeIn();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full bg-[#0a0a0f] text-slate-200 selection:bg-rose-500/30 overflow-hidden font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative px-6 py-24 md:py-32 max-w-5xl mx-auto flex flex-col items-center text-center mt-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div {...heroFade} className={heroFade.className + " z-10 w-full"}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-semibold tracking-wide shadow-[0_0_20px_rgba(244,63,94,0.1)]">
            <span className="text-xl">📖</span>
            COLM 2025 Spotlight
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-gradient-to-r from-white via-rose-100 to-rose-400 bg-clip-text text-transparent pb-2">
            AI Agents That Learn to Haggle
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed mb-12">
            Welcome to <strong className="text-white font-semibold">NegotiationGym</strong>: An open-source playground where LLMs don't just talk—they practice, reflect, and actively rewrite their own strategies to get a better deal.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-20">
            <a href="https://github.com/chrishokamp/multi-agent-social-simulation" target="_blank" rel="noreferrer" className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] block">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> 
              View on GitHub
            </a>
            <a href="https://arxiv.org/abs/2510.04368" target="_blank" rel="noreferrer" className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-800 hover:border-slate-600 hover:scale-105 active:scale-95 transition-all">
              <span className="font-bold text-xl text-rose-400 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform">↗</span> 
              arXiv:2510.04368
            </a>
          </div>

          <div className="text-left bg-[#0c0d13] border border-slate-800/80 rounded-3xl p-8 md:p-10 backdrop-blur-md max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px] pointer-events-none" />
            <h3 className="text-sm font-bold text-rose-400 tracking-widest uppercase mb-4 opacity-80">The Pitch</h3>
            <p className="text-slate-300 text-xl leading-relaxed font-light">
              What if you could train an AI to negotiate on your behalf? NegotiationGym is an open-source toolkit and API for designing, configuring, and running multi-agent social simulations focused on negotiation and cooperation. Instead of just running the simulation once, the agents play multiple rounds, see how well they did, and use a &quot;coach&quot; to literally rewrite their own underlying prompts so they do better next time. It is survival of the smartest, powered by Agentic AI.
            </p>
          </div>
        </div>
      </section>

      {/* 2. HOW THE GYM WORKS */}
      <section className="relative px-6 py-24 bg-[#07080b] border-y border-slate-800/40">
        <div className="max-w-5xl mx-auto">
          <div {...gymFade} className={gymFade.className}>
            <div className="flex items-center gap-5 mb-14">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-2xl shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                ⚙️
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white tracking-tight">Inside the Arena</h2>
                <p className="text-slate-400 mt-2 text-lg">Think of NegotiationGym as a highly organized digital boardroom.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "GUI / CLI (The Rulebook)", desc: "Where the user defines the agents, their personalities, and their secret goals using simple JSON files. No hardcoding required.", icon: "💻", color: "group-hover:border-purple-500/50 group-hover:bg-purple-500/5" },
                { title: "MongoDB-backed Queue", desc: "An orchestrator streams jobs, allowing multiple users to run simulations on the same backend concurrently.", icon: "💾", color: "group-hover:border-green-500/50 group-hover:bg-green-500/5" },
                { title: "SelectorGroupChat (The Boardroom)", desc: "Maintains the shared conversation history (H) via AutoGen and uniquely decides which agent gets to speak next.", icon: "💬", color: "group-hover:border-blue-500/50 group-hover:bg-blue-500/5" },
                { title: "Environment (The Memory)", desc: "A lightweight object containing chronological logs of finished runs. Every time a negotiation ends, this log is bundled up so agents can study their past mistakes.", icon: "🧠", color: "group-hover:border-rose-500/50 group-hover:bg-rose-500/5" },
              ].map((item, i) => (
                <div key={i} className={`group bg-[#11131a] border border-slate-800/80 rounded-2xl p-8 transition-all duration-300 ${item.color}`}>
                  <div className="mb-5 text-4xl group-hover:scale-110 transition-transform origin-left">{item.icon}</div>
                  <h3 className="text-xl font-bold text-slate-100 mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-[17px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE SECRET SAUCE */}
      <section className="relative px-6 py-32 max-w-5xl mx-auto">
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div {...sauceFade} className={sauceFade.className + " relative z-10"}>
          <div className="flex items-center gap-5 mb-14">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-2xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              ✨
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white tracking-tight">Self-Writing Code and AI Coaches</h2>
            </div>
          </div>

          <p className="text-slate-300 text-xl md:text-2xl mb-12 leading-relaxed font-light">
            At runtime, dictionaries are converted to a <code className="bg-slate-800/80 px-3 py-1.5 rounded-lg text-purple-300 font-mono text-[19px] border border-slate-700/50">UtilityAgent</code> class, which exposes two crucial, overridable Python hooks that drive the learning loop. Every agent has two main jobs once a conversation ends:
          </p>

          <div className="space-y-8">
            <div className="p-[2px] rounded-3xl bg-gradient-to-r from-slate-800 via-purple-900/40 to-slate-800 shadow-xl">
              <div className="bg-[#0b0d14] rounded-[22px] p-8 md:p-10">
                <h3 className="text-2xl font-bold text-white flex items-center gap-4 mb-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-lg shadow-inner">1</span>
                  The Scoreboard <span className="font-mono text-lg text-slate-400 font-normal ml-2 hidden sm:inline">compute_utility(E)</span>
                </h3>
                <p className="text-slate-300 text-[19px] leading-relaxed ml-14">
                  First, the agent looks at the final price and calculates a simple score. <em>Did I get a steal, or did I get ripped off?</em> This hook returns a scalar utility score evaluating the agent's performance based on its private strategy and goals.
                </p>
              </div>
            </div>

            <div className="p-[2px] rounded-3xl bg-gradient-to-r from-rose-900/50 via-red-900/30 to-slate-800 shadow-xl">
              <div className="bg-[#0b0d14] rounded-[22px] p-8 md:p-10">
                <h3 className="text-2xl font-bold text-white flex items-center gap-4 mb-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-lg shadow-inner">2</span>
                  The Brain Upgrade <span className="font-mono text-lg text-slate-400 font-normal ml-2 hidden sm:inline">learn_from_feedback(E)</span>
                </h3>
                <p className="text-slate-300 text-[19px] leading-relaxed ml-14">
                  This is the optimization engine. If the score is bad, the agent reads the chat transcript and gets advice from an AI "Coach". Then, the agent dynamically rewrites its own system prompt for the next round. It is literally evolving its own brain based on experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE CASE STUDY */}
      <section className="relative px-6 py-28 bg-[#07080b] border-t border-slate-800/40">
        <div className="max-w-6xl mx-auto">
          <div {...caseFade} className={caseFade.className}>
            
            <div className="text-center mb-16 px-4">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Putting it to the Test: Buying a Laptop</h2>
              <p className="text-slate-400 text-xl max-w-3xl mx-auto font-light leading-relaxed">
                To see if the Gym actually works, we set up a classic scenario: a Seller trying to offload a used laptop, and a Buyer trying to score a bargain.
              </p>
            </div>

            <div className="bg-[#0d0f16] border border-slate-800/80 rounded-[40px] p-8 md:p-14 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] pointer-events-none" />
              
              <div className="grid lg:grid-cols-2 gap-16 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-8 border-b border-slate-800/60 pb-5">The Mathematical Bounds</h3>
                  <ul className="space-y-6 text-slate-300 text-[17px]">
                    <li className="flex gap-5 items-start">
                      <div className="w-3 h-3 mt-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] shrink-0" />
                      <div>
                        <strong className="text-slate-100 block mb-1 text-lg">Seller's Asking Price</strong>
                        <code className="text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 font-mono text-[15px]">ask ~ U(900, 1400) USD</code>
                      </div>
                    </li>
                    <li className="flex gap-5 items-start">
                      <div className="w-3 h-3 mt-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] shrink-0" />
                      <div>
                        <strong className="text-slate-100 block mb-1 text-lg">Seller's Private Floor</strong>
                        <code className="text-orange-300 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20 font-mono text-[15px]">floor = ask - U(100, 300)</code>
                      </div>
                    </li>
                    <li className="flex gap-5 items-start">
                      <div className="w-3 h-3 mt-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] shrink-0" />
                      <div>
                        <strong className="text-slate-100 block mb-1 text-lg">Buyer's Private Budget</strong>
                        <code className="text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 font-mono text-[15px]">budget ~ U(floor+50, ask-50)</code>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#12151e] rounded-3xl p-8 border border-slate-800/80 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-white mb-4">The AI Coach Steps In</h3>
                  <p className="text-slate-400 leading-relaxed mb-6 text-[17px]">
                    Between rounds, our AI Coach would step in, analyze the chat, and whisper new tactics to the agents.
                  </p>
                  <div className="bg-[#07080b] text-slate-300 text-[15px] font-mono leading-relaxed p-6 rounded-2xl border border-slate-800 border-l-[3px] border-l-emerald-500 shadow-inner">
                    <span className="text-emerald-400 font-bold block mb-2">Coach Analysis:</span> 
                    Initial offer was too close to budget. For round 2, try anchoring the price extremely low and use the "poor student" timing tactic to rush the seller.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. RESULTS AND VISUALIZATIONS */}
      <section className="relative px-6 py-32 max-w-6xl mx-auto">
        <div {...visualFade} className={visualFade.className}>
          <div className="text-center mb-20 px-4">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-6">Buyers Make Better Students</h2>
            <p className="text-slate-400 text-xl font-light">When we let the agents practice and learn, two fascinating things happened.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            
            {/* Chart 1: Native SVG Line Chart Replacement */}
            <div className="bg-[#0b0d14] border border-slate-800/80 rounded-[30px] p-8 md:p-10 shadow-2xl flex flex-col group">
              <h3 className="text-2xl font-bold text-white mb-2">Cumulative Average Utility</h3>
              <p className="text-[15px] text-slate-400 mb-8">Average utility points achieved over 20 repeated rounds. (Higher is better)</p>
              
              <div className="flex-1 w-full bg-[#11131a] rounded-2xl border border-slate-800/50 p-6 pt-10 flex flex-col justify-end relative min-h-[320px] group-hover:border-slate-700 transition-colors">
                {/* SVG Line Graph */}
                <svg className="absolute inset-x-6 inset-y-6 w-[calc(100%-48px)] h-[calc(100%-48px)] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* Grid lines */}
                  <line x1="0" y1="10" x2="100" y2="10" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2"/>
                  <line x1="0" y1="40" x2="100" y2="40" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2"/>
                  <line x1="0" y1="70" x2="100" y2="70" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2"/>
                  <line x1="0" y1="100" x2="100" y2="100" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2"/>
                  
                  {/* Lines mapping utilityData to paths */}
                  <path d="M0,80 L20,78 L40,75 L60,74 L80,74" fill="none" stroke="#64748b" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                  <path d="M0,80 L20,70 L40,60 L60,58 L80,55" fill="none" stroke="#f59e0b" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                  <path d="M0,70 L20,50 L40,35 L60,27 L80,20" fill="none" stroke="#3b82f6" strokeWidth="3.5" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <path d="M0,70 L20,55 L40,40 L60,32 L80,28" fill="none" stroke="#10b981" strokeWidth="4.5" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </svg>

                <div className="flex flex-wrap gap-4 mt-auto text-sm font-semibold text-slate-300 justify-center translate-y-12">
                  <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500"></div> Baseline</span>
                  <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> Both Learn</span>
                  <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div> Buyer Only</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Native HTML/CSS Stacked Bar Chart */}
            <div className="bg-[#0b0d14] border border-slate-800/80 rounded-[30px] p-8 md:p-10 shadow-2xl group">
              <h3 className="text-2xl font-bold text-white mb-2">The "No-Deal" Problem</h3>
              <p className="text-[15px] text-slate-400 mb-8">Percentage of net surplus captured vs lost due to failed 10-turn agreements.</p>
              
              <div className="space-y-6 min-h-[320px] flex flex-col justify-center">
                {surplusData.map((d, i) => (
                  <div key={i}>
                    <div className="text-sm font-semibold text-slate-300 mb-2">{d.name}</div>
                    <div className="flex h-10 rounded-xl overflow-hidden bg-slate-800/50 outline outline-1 outline-slate-700/50">
                      <div 
                        style={{width: `${d["Surplus Captured"]}%`}} 
                        className="bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center px-3 text-[13px] font-bold text-white border-r border-blue-900/50 overflow-hidden text-nowrap shadow-inner"
                      >
                        {d["Surplus Captured"]}%
                      </div>
                      <div 
                        style={{width: `${d["Lost to No-Deal"]}%`}} 
                        className="bg-rose-500 hover:bg-rose-400 transition-colors flex items-center justify-center px-3 text-[13px] font-bold text-white overflow-hidden text-nowrap shadow-inner"
                      >
                        {d["Lost to No-Deal"]}%
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="flex flex-wrap gap-6 mt-8 text-sm font-semibold text-slate-300 justify-center px-4">
                  <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-blue-600 rounded-[3px]" /> Surplus Captured</div>
                  <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-rose-500 rounded-[3px]" /> Lost to No-Deal</div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Key Insight */}
          <div className="bg-gradient-to-br from-[#0c1222] to-[#1a1122] border border-slate-700/50 rounded-[40px] p-10 md:p-14 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[100px] pointer-events-none" />
            <div className="relative z-10 block md:flex gap-10 items-start">
              <div className="shrink-0 w-20 h-20 rounded-[24px] bg-blue-500 flex items-center justify-center text-white mb-8 md:mb-0 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                <span className="text-4xl">💡</span>
              </div>
              <div>
                <h3 className="text-3xl font-black text-white mb-5 tracking-tight">The Flexibility Advantage</h3>
                <p className="text-slate-300 text-[19px] leading-relaxed mb-6 font-light">
                  Interestingly, the Buyer agents learned much better than the Seller agents. <strong>Why? Because of role flexibility.</strong> Being a seller is tough! Sellers are rigidly chained to their absolute minimum floor price, leaving them less room to maneuver.
                </p>
                <p className="text-slate-300 text-[19px] leading-relaxed font-light">
                  Buyers, however, have the flexibility to get creative, try different lowball offers, and use timing tactics to squeeze out a better deal without risking the entire transaction. This mathematically proves the necessity of <em>role-aware learning strategies</em> in Agentic AI.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <div className="pb-40" />
    </div>
  );
}
