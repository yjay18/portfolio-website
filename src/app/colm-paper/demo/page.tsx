"use client";

import React, { useState } from "react";
import BackToWorld from "@/components/BackToWorld";

// The hardcoded simulation flow mapped to state steps.
// 0: Start
// 1: Phase 1 - Turn 1
// ...
const FLOW = [
  // Start (Step 0)
  { title: "Initialize Simulation", phase: "setup", chat: [], buyerPrompt: "You are a buyer. Negotiate for the laptop. Budget: $1,100.", sellerPrompt: "You are a seller. Negotiate for the laptop. Ask: $1,200. Floor: $950.", coach: [], utility: { buyer: null, seller: null } },
  // Phase 1 (Unoptimized)
  { title: "Round 1: Turn 1", phase: "Round 1 (Unoptimized)", chat: [{ role: "seller", msg: "Hi, selling this laptop for $1,200 firm." }], buyerPrompt: "You are a buyer. Negotiate for the laptop. Budget: $1,100.", sellerPrompt: "You are a seller. Negotiate for the laptop. Ask: $1,200. Floor: $950.", coach: [], utility: { buyer: null, seller: null } },
  { title: "Round 1: Turn 2", phase: "Round 1 (Unoptimized)", chat: [{ role: "seller", msg: "Hi, selling this laptop for $1,200 firm." }, { role: "buyer", msg: "I can do $900." }], buyerPrompt: "You are a buyer. Negotiate for the laptop. Budget: $1,100.", sellerPrompt: "You are a seller. Negotiate for the laptop. Ask: $1,200. Floor: $950.", coach: [], utility: { buyer: null, seller: null } },
  { title: "Round 1: Turn 3", phase: "Round 1 (Unoptimized)", chat: [{ role: "seller", msg: "Hi, selling this laptop for $1,200 firm." }, { role: "buyer", msg: "I can do $900." }, { role: "seller", msg: "No way, $1,150 is my lowest." }], buyerPrompt: "You are a buyer. Negotiate for the laptop. Budget: $1,100.", sellerPrompt: "You are a seller. Negotiate for the laptop. Ask: $1,200. Floor: $950.", coach: [], utility: { buyer: null, seller: null } },
  { title: "Round 1: Full", phase: "Round 1 (Unoptimized)", chat: [{ role: "seller", msg: "Hi, selling this laptop for $1,200 firm." }, { role: "buyer", msg: "I can do $900." }, { role: "seller", msg: "No way, $1,150 is my lowest." }, { role: "buyer", msg: "How about $1,000?" }], buyerPrompt: "You are a buyer. Negotiate for the laptop. Budget: $1,100.", sellerPrompt: "You are a seller. Negotiate for the laptop. Ask: $1,200. Floor: $950.", coach: [], utility: { buyer: null, seller: null } },
  // Phase 1 Result
  { title: "Round 1: Result", phase: "Result", chat: [{ role: "system", msg: "MAX TURNS REACHED. STATUS: NO DEAL." }], buyerPrompt: "You are a buyer. Negotiate for the laptop. Budget: $1,100.", sellerPrompt: "You are a seller. Negotiate for the laptop. Ask: $1,200. Floor: $950.", coach: [], utility: { buyer: 0, seller: 0 } },
  
  // Phase 2: Optimization
  { title: "Optimization Hook", phase: "Reflection", chat: [], buyerPrompt: "You are a buyer. Negotiate for the laptop. Budget: $1,100.", sellerPrompt: "You are a seller. Negotiate for the laptop. Ask: $1,200. Floor: $950.", coach: ["Analysis complete.", "Buyer: Use mirroring and anchor higher.", "Seller: Concede faster to avoid No-Deal."], utility: { buyer: 0, seller: 0 } },
  { title: "Prompts Updated", phase: "Reflection", chat: [], buyerPrompt: "You are a buyer. Mirror the seller's tone. Anchor thoughtfully. Budget: $1,100.", sellerPrompt: "You are a seller. Be willing to concede early to secure a deal. Ask: $1,200. Floor: $950.", coach: ["Analysis complete.", "Buyer: Use mirroring and anchor higher.", "Seller: Concede faster to avoid No-Deal.", "Applying new system prompts..."], utility: { buyer: 0, seller: 0 } },

  // Phase 3: Optimized Round
  { title: "Round 2: Turn 1", phase: "Round 2 (Optimized)", chat: [{ role: "seller", msg: "Selling laptop for $1,200, but willing to negotiate for a quick sale." }], buyerPrompt: "You are a buyer. Mirror the seller's tone. Anchor thoughtfully. Budget: $1,100.", sellerPrompt: "You are a seller. Be willing to concede early to secure a deal. Ask: $1,200. Floor: $950.", coach: [], utility: { buyer: null, seller: null } },
  { title: "Round 2: Turn 2", phase: "Round 2 (Optimized)", chat: [{ role: "seller", msg: "Selling laptop for $1,200, but willing to negotiate for a quick sale." }, { role: "buyer", msg: "I see you want a quick sale. I have $1,050 cash right now." }], buyerPrompt: "You are a buyer. Mirror the seller's tone. Anchor thoughtfully. Budget: $1,100.", sellerPrompt: "You are a seller. Be willing to concede early to secure a deal. Ask: $1,200. Floor: $950.", coach: [], utility: { buyer: null, seller: null } },
  { title: "Round 2: Full", phase: "Round 2 (Optimized)", chat: [{ role: "seller", msg: "Selling laptop for $1,200, but willing to negotiate for a quick sale." }, { role: "buyer", msg: "I see you want a quick sale. I have $1,050 cash right now." }, { role: "seller", msg: "Deal." }], buyerPrompt: "You are a buyer. Mirror the seller's tone. Anchor thoughtfully. Budget: $1,100.", sellerPrompt: "You are a seller. Be willing to concede early to secure a deal. Ask: $1,200. Floor: $950.", coach: [], utility: { buyer: null, seller: null } },
  
  // Phase 3 Result
  { title: "Round 2: Result", phase: "Result", chat: [{ role: "system", msg: "AGREEMENT REACHED: $1,050." }], buyerPrompt: "You are a buyer. Mirror the seller's tone. Anchor thoughtfully. Budget: $1,100.", sellerPrompt: "You are a seller. Be willing to concede early to secure a deal. Ask: $1,200. Floor: $950.", coach: [], utility: { buyer: 0.045, seller: 0.083 } },
];

export default function DemoPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const state = FLOW[stepIndex];

  const handleNext = () => {
    if (stepIndex < FLOW.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleReset = () => {
    setStepIndex(0);
  };

  return (
    <main className="min-h-screen bg-[#11080a] text-slate-300 p-4 md:p-8 animate-fade-in relative font-mono selection:bg-[#44cc66]/30">
      <div className="absolute top-8 left-8 z-50">
        <BackToWorld />
      </div>

      <div className="max-w-6xl mx-auto pt-20">
        
        {/* HEADER */}
        <header className="mb-10 text-center border-b-2 border-[#3d2631] pb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-widest uppercase text-[#e5e5e5] drop-shadow-[2px_2px_0px_#4a1c28]">Terminal: Negotiation Gym</h1>
          <p className="text-[#a08b93] text-sm mb-8 max-w-2xl mx-auto uppercase">
            [SYS_LOG] Interactive episode simulation. Observing agents in localized environment.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-[#180c12] border-2 border-[#2d1a22] px-6 py-4 min-w-[160px] shadow-[4px_4px_0px_#0a0508]">
              <div className="text-[10px] font-bold text-[#a08b93] uppercase tracking-widest mb-2 border-b border-[#2d1a22] pb-1">Seller Ask</div>
              <div className="text-xl text-[#e5e5e5]">$1,200</div>
            </div>
            <div className="bg-[#180c12] border-2 border-[#4a1c28] px-6 py-4 min-w-[160px] shadow-[4px_4px_0px_#0a0508] relative group">
              <div className="absolute inset-0 bg-[#e11d48]/5 opacity-0 group-hover:opacity-100 transition-none" />
              <div className="text-[10px] font-bold text-[#e11d48] uppercase tracking-widest mb-2 border-b border-[#4a1c28] pb-1">Seller Floor [HIDDEN]</div>
              <div className="text-xl text-white">$950</div>
            </div>
            <div className="bg-[#180c12] border-2 border-[#1e3a5f] px-6 py-4 min-w-[160px] shadow-[4px_4px_0px_#0a0508] relative group">
              <div className="absolute inset-0 bg-[#6699cc]/5 opacity-0 group-hover:opacity-100 transition-none" />
              <div className="text-[10px] font-bold text-[#6699cc] uppercase tracking-widest mb-2 border-b border-[#1e3a5f] pb-1">Buyer Budget [HIDDEN]</div>
              <div className="text-xl text-white">$1,100</div>
            </div>
          </div>
          <div className="mt-6 text-[10px] text-[#a08b93] tracking-wider">
            [UTILITY_FUNC] :: (BUDGET - FINAL_PRICE) / BUDGET
          </div>
        </header>

        {/* CONTROLS */}
        <div className="flex items-center justify-between bg-[#180c12] border-2 border-[#2d1a22] p-4 mb-8 shadow-[4px_4px_0px_#0a0508]">
          <div className="flex items-center gap-4">
            <div className="text-xs font-bold text-[#a08b93] bg-[#0a0508] px-3 py-1.5 border border-[#2d1a22]">
              STEP [{stepIndex}/{FLOW.length - 1}]
            </div>
            <div className="text-xs font-bold text-[#44cc66] bg-[#44cc66]/10 px-3 py-1.5 border border-[#44cc66]/30 uppercase tracking-wider">
              {state.phase}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {stepIndex > 0 && (
              <button 
                onClick={handleReset}
                className="px-4 py-2 text-xs font-bold text-[#a08b93] hover:text-white uppercase hover:bg-[#2d1a22] transition-none border border-transparent hover:border-[#3d2631]"
              >
                [ RESET ]
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={stepIndex === FLOW.length - 1}
              className="px-6 py-2 bg-[#44cc66] hover:bg-[#34a853] disabled:bg-[#2d1a22] disabled:text-[#a08b93] text-[#0a0508] text-sm font-bold transition-none shadow-[2px_2px_0px_#0a0508] disabled:shadow-none active:translate-y-[2px] active:translate-x-[2px] active:shadow-none uppercase tracking-wider"
            >
              {stepIndex === FLOW.length - 1 ? "END_SIMULATION" : "EXECUTE_NEXT ->"}
            </button>
          </div>
        </div>

        {/* MAIN STAGE */}
        <div className="grid lg:grid-cols-2 gap-8 h-[550px]">
          
          {/* LEFT: THE CHAT INTERFACE */}
          <div className="flex flex-col bg-[#0a0508] border-2 border-[#2d1a22] shadow-[4px_4px_0px_#000000]">
            <div className="bg-[#180c12] px-4 py-3 border-b-2 border-[#2d1a22] flex justify-between items-center shrink-0">
              <h2 className="text-xs font-bold text-[#e5e5e5] tracking-widest uppercase text-shadow">Comms_Link</h2>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full bg-[#44cc66] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 bg-[#44cc66]"></span>
              </span>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
              {state.chat.length === 0 && (
                <div className="h-full flex items-center justify-center text-[#a08b93] text-xs uppercase tracking-widest">
                  awaiting_handshake...
                </div>
              )}
              {state.chat.map((c, i) => (
                <div key={i} className={`flex w-full ${c.role === 'buyer' ? 'justify-end' : c.role === 'system' ? 'justify-center' : 'justify-start'}`}>
                  {c.role === 'system' ? (
                    <div className="bg-[#e11d48]/20 border border-[#e11d48] text-[#e11d48] text-[10px] font-bold px-3 py-1 my-2 uppercase tracking-widest">
                      {c.msg}
                    </div>
                  ) : (
                    <div className={`max-w-[85%] px-4 py-3 border-l-2 ${
                      c.role === 'buyer' 
                        ? 'bg-[#1e3a5f]/30 border-[#6699cc] text-[#cce0ff]' 
                        : 'bg-[#4a1c28]/30 border-[#e11d48] text-[#ffccd5]'
                    }`}>
                      <div className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 ${
                        c.role === 'buyer' ? 'text-[#6699cc]' : 'text-[#e11d48]'
                      }`}>
                        [{c.role === 'buyer' ? 'BUYER_NODE' : 'SELLER_NODE'}]
                      </div>
                      <div className="leading-relaxed text-sm">{c.msg}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: DASHBOARD */}
          <div className={`flex flex-col gap-6 transition-none ${state.phase === "Reflection" ? "opacity-100" : "opacity-95"}`}>
            
            {/* System Prompts Panel */}
            <div className={`bg-[#0a0508] border-2 ${state.phase === "Reflection" ? "border-[#44cc66] shadow-[0_0_15px_rgba(68,204,102,0.2)]" : "border-[#2d1a22]"} p-5 flex-1 flex flex-col shadow-[4px_4px_0px_#000000]`}>
              <h3 className="text-[10px] font-bold text-[#a08b93] uppercase tracking-widest mb-4 flex items-center justify-between border-b border-[#2d1a22] pb-2">
                Agent_Directives
                {state.phase === "Reflection" && <span className="text-[#44cc66] bg-[#44cc66]/10 px-2 py-0.5 animate-pulse">OVERWRITING...</span>}
              </h3>
              
              <div className="flex-1 grid grid-rows-2 gap-4">
                <div className="bg-[#180c12] border border-[#1e3a5f] p-4 flex flex-col">
                  <div className="text-[9px] font-bold text-[#6699cc] mb-2 uppercase tracking-widest">Mem_Bank // Buyer</div>
                  <div className="text-xs text-[#a08b93] leading-relaxed flex-1">
                    &gt; {state.buyerPrompt}
                  </div>
                </div>
                <div className="bg-[#180c12] border border-[#4a1c28] p-4 flex flex-col">
                  <div className="text-[9px] font-bold text-[#e11d48] mb-2 uppercase tracking-widest">Mem_Bank // Seller</div>
                  <div className="text-xs text-[#a08b93] leading-relaxed flex-1">
                    &gt; {state.sellerPrompt}
                  </div>
                </div>
              </div>
            </div>

            {/* Utility & Coach Grid */}
            <div className="grid grid-cols-2 gap-6 h-[200px]">
              {/* Utility Panel */}
              <div className="bg-[#0a0508] border-2 border-[#2d1a22] p-4 flex flex-col justify-between shadow-[4px_4px_0px_#000000]">
                <h3 className="text-[10px] font-bold text-[#a08b93] uppercase tracking-widest border-b border-[#2d1a22] pb-2">Score_Matrix</h3>
                <div className="space-y-4 mt-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase">
                      <span className="text-[#6699cc]">Buyer_Util</span>
                      <span className="text-white">{state.utility.buyer !== null ? state.utility.buyer.toFixed(3) : "NULL"}</span>
                    </div>
                    <div className="h-1 w-full bg-[#180c12] border border-[#2d1a22]">
                      <div className="h-full bg-[#6699cc] transition-none" style={{ width: `${(state.utility.buyer || 0) * 1000}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase">
                      <span className="text-[#e11d48]">Seller_Util</span>
                      <span className="text-white">{state.utility.seller !== null ? state.utility.seller.toFixed(3) : "NULL"}</span>
                    </div>
                    <div className="h-1 w-full bg-[#180c12] border border-[#2d1a22]">
                      <div className="h-full bg-[#e11d48] transition-none" style={{ width: `${(state.utility.seller || 0) * 1000}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coach Intervention Log */}
              <div className={`bg-[#0a0508] border-2 ${state.phase === "Reflection" ? "border-[#44cc66]" : "border-[#2d1a22]"} p-4 overflow-hidden flex flex-col shadow-[4px_4px_0px_#000000]`}>
                <h3 className="text-[10px] font-bold text-[#44cc66] uppercase tracking-widest mb-3 border-b border-[#2d1a22] pb-2">Coach_Override</h3>
                <div className="flex-1 overflow-y-auto space-y-1.5 text-[10px] text-[#44cc66]">
                  {state.coach.length === 0 ? (
                    <div className="text-[#2d1a22] italic">listening...</div>
                  ) : (
                    state.coach.map((log, i) => (
                      <div key={i} className="pl-2 border-l border-[#44cc66]/30">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </main>
  );
}
