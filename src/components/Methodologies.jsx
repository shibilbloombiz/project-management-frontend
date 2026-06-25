import React from "react";
import { Shield, Sparkles, TrendingUp, GitMerge, Check, AlertTriangle } from "lucide-react";
const MODELS = [{
  id: "scrum",
  name: "Agile & Scrum",
  shortDesc: "Iterative delivery through sprints, daily standups, and cross-functional self-organization.",
  icon: Sparkles,
  color: "from-purple-500/5 to-indigo-500/5 hover:border-purple-500/20 text-purple-600",
  badge: "Iterative & Fast",
  bestFor: "Software development, startup products, and projects with rapidly changing requirements.",
  characteristics: ["Sprints (1-4 week cycles) with fixed scope deliverables.", "Roles: Product Owner, Scrum Master, and Developers.", "Ceremonies: Sprint Planning, Daily Standup, Review, and Retrospective.", "Key Metric: Sprint Velocity (story points completed)."],
  pros: ["High flexibility & quick responses to user feedback", "Early testing & continuous product value delivery", "Excellent team transparency and accountability"],
  cons: ["Scope creep risk if Product Owner is poorly guided", "High dependency on team discipline and collaboration", "Hard to predict exact final cost and timeline"],
  diagramType: "scrum"
}, {
  id: "kanban",
  name: "Visual Kanban",
  shortDesc: "Continuous visual progress tracking, strict limits on work-in-progress (WIP), and maximum flow.",
  icon: TrendingUp,
  color: "from-cyan-500/5 to-blue-500/5 hover:border-brand-cyan/20 text-cyan-600",
  badge: "Continuous Flow",
  bestFor: "Operations, client support tickets, marketing pipelines, and continuous product releases.",
  characteristics: ["Visual Board depicting statuses: Todo, In Progress, Done.", "WIP Limits to restrict active bottleneck tasks.", "Pull system: tasks are pulled rather than pushed.", "Key Metrics: Lead Time (concept to delivery) & Cycle Time."],
  pros: ["Reduces multitasking bottlenecks instantly", "Extremely adaptive to mid-day changes", "Low process overhead (no rigid meetings needed)"],
  cons: ["Easily unaligned if boards are neglected", "Lacks native built-in long-term milestones", "Less effective for multi-phase dependencies"],
  diagramType: "kanban"
}, {
  id: "waterfall",
  name: "Waterfall & Gantt",
  shortDesc: "Predictable sequential phases (requirements, design, dev, test, release) with fixed scope.",
  icon: Shield,
  color: "from-emerald-500/5 to-teal-500/5 hover:border-emerald-500/20 text-emerald-600",
  badge: "Highly Predictable",
  bestFor: "Construction, hardware engineering, manufacturing, and regulated medical/finance projects.",
  characteristics: ["Gantt charts tracking critical path milestones.", "Strict phase gates (cannot begin dev before design is signed off).", "Extensive documentation at requirements gathering phase.", "Linear timeline with rigid milestones."],
  pros: ["Very clear project outcomes, budgets, and schedules", "Easy to track milestone progresses for clients", "Highly detailed documentation for compliance"],
  cons: ["Extremely expensive to make changes post-dev", "Value is only realized at the very end of the cycle", "Lacks flexibility when unexpected issues occur"],
  diagramType: "waterfall"
}, {
  id: "hybrid",
  name: "Hybrid Scrumban",
  shortDesc: "Blending Waterfall-style phase alignment with Agile sprint cycles or Kanban board logic.",
  icon: GitMerge,
  color: "from-amber-500/5 to-orange-500/5 hover:border-amber-500/20 text-amber-600",
  badge: "Flexible Structure",
  bestFor: "Enterprise software deployments, SaaS scale-ups, and clients requiring fixed budgets but agile development.",
  characteristics: ["Phase 1: High-level requirements phase (Waterfall).", "Phase 2: Execution via iterative Agile Sprints (Scrum).", "Use of Kanban visual boards for sprint tracking.", "Continuous governance combined with agility."],
  pros: ["Reconciles client needs for planning with developer needs for agility", "Structured checkpoints for complex risk reduction", "Scalable for large cross-team integrations"],
  cons: ["Process conflict between administrative rules and team speed", "Can lead to \"fake agile\" (Waterfall with standups)", "Requires highly skilled managers to orchestrate"],
  diagramType: "hybrid"
}];
export default function Methodologies({
  onSelectModel
}) {
  return <section id="models" className="py-24 relative overflow-hidden bg-white"> {} <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none"></div> <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"> <div className="reveal text-center max-w-3xl mx-auto mb-16"> <span className="text-xs font-semibold uppercase tracking-widest text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-full border border-brand-purple/20"> Platform Frameworks </span> <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight"> Built for Every Project Management Model </h2> <p className="mt-4 text-lg text-slate-600"> Syncra supports multiple project frameworks natively. Choose the framework that fits your workflow, or combine them to craft your own hybrid model. </p> </div> {} <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {MODELS.map(model => {
          const Icon = model.icon;
          return <button key={model.id} onClick={() => onSelectModel(model)} className={`reveal flex flex-col text-left h-full rounded-2xl glass-card border border-slate-200 bg-white/50 p-6 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 cursor-pointer ${model.color}`}> <div className="p-3 bg-slate-100 rounded-xl w-fit mb-4"> <Icon size={24} /> </div> <div className="flex items-center space-x-2 mb-2"> <h3 className="text-lg font-bold text-slate-800 font-display"> {model.name} </h3> </div> <span className="text-[10px] w-fit mb-4 px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600"> {model.badge} </span> <p className="text-sm text-slate-500 flex-1 leading-relaxed"> {model.shortDesc} </p> <div className="mt-6 pt-4 border-t border-slate-200/50 w-full flex items-center justify-between text-xs font-bold text-slate-700 group"> <span>Explore Model Details</span> <span className="text-brand-purple transition-transform group-hover:translate-x-1">→</span> </div> </button>;
        })} </div> </div> </section>;
}
export function ModelDiagram({
  type
}) {
  if (type === "scrum") {
    return <div className="w-full h-44 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 p-4 relative overflow-hidden"> <svg viewBox="0 0 400 180" className="w-full h-full text-slate-800"> {} <path d="M 200 90 A 45 45 0 1 1 200 89.9" fill="none" stroke="url(#purpleGlowLight)" strokeWidth="4" strokeDasharray="6 3" className="animate-[spin_40s_linear_infinite]" /> <circle cx="200" cy="90" r="45" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.2" /> {} <line x1="60" y1="90" x2="140" y2="90" stroke="#0891b2" strokeWidth="2" strokeDasharray="4 4" /> <polygon points="145,90 137,86 137,94" fill="#0891b2" /> {} <rect x="20" y="70" width="30" height="40" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" /> <line x1="26" y1="80" x2="44" y2="80" stroke="#cbd5e1" strokeWidth="1.5" /> <line x1="26" y1="90" x2="38" y2="90" stroke="#cbd5e1" strokeWidth="1.5" /> {} <rect x="330" y="70" width="40" height="40" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="2" /> <path d="M 342 90 L 348 96 L 358 84" fill="none" stroke="#10b981" strokeWidth="2" /> {} <line x1="250" y1="90" x2="320" y2="90" stroke="#10b981" strokeWidth="2" /> <polygon points="325,90 317,86 317,94" fill="#10b981" /> {} <text x="35" y="130" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="middle">Product Backlog</text> <text x="200" y="94" fill="#8b5cf6" fontSize="10" fontWeight="extrabold" textAnchor="middle">Sprint Cycle</text> <text x="200" y="152" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="middle">Daily Standup</text> <text x="350" y="130" fill="#10b981" fontSize="10" fontWeight="extrabold" textAnchor="middle">Shippable Increment</text> <defs> <linearGradient id="purpleGlowLight" x1="0%" y1="0%" x2="100%" y2="100%"> <stop offset="0%" stopColor="#8b5cf6" /> <stop offset="100%" stopColor="#6366f1" /> </linearGradient> </defs> </svg> </div>;
  }
  if (type === "kanban") {
    return <div className="w-full h-44 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 p-4"> <div className="grid grid-cols-3 gap-3 w-full h-full max-w-md"> {} <div className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col"> <span className="text-[9px] font-bold text-cyan-600 tracking-wider uppercase mb-2 block border-b border-slate-100 pb-1">To Do</span> <div className="flex-1 space-y-1.5 overflow-hidden"> <div className="bg-slate-50 rounded p-1.5 border-l-2 border-cyan-500"> <div className="h-1 w-6 bg-cyan-500 rounded mb-1"></div> <div className="h-1 w-full bg-slate-300 rounded"></div> </div> <div className="bg-slate-50 rounded p-1.5 border-l-2 border-cyan-500 opacity-60"> <div className="h-1 w-4 bg-cyan-500 rounded mb-1"></div> <div className="h-1 w-3/4 bg-slate-300 rounded"></div> </div> </div> </div> {} <div className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col"> <span className="text-[9px] font-bold text-brand-purple tracking-wider uppercase mb-2 block border-b border-slate-100 pb-1 flex justify-between"> Active <span className="text-brand-purple font-extrabold text-[8px] bg-purple-50 px-1 rounded">WIP: 2</span> </span> <div className="flex-1 space-y-1.5 overflow-hidden"> <div className="bg-slate-50 rounded p-1.5 border-l-2 border-brand-purple"> <div className="h-1 w-5 bg-brand-purple rounded mb-1"></div> <div className="h-1.5 w-full bg-slate-300 rounded mb-1"></div> <div className="h-1 w-2/3 bg-slate-300 rounded"></div> </div> </div> </div> {} <div className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col"> <span className="text-[9px] font-bold text-emerald-600 tracking-wider uppercase mb-2 block border-b border-slate-100 pb-1">Done</span> <div className="flex-1 space-y-1.5 overflow-hidden"> <div className="bg-slate-50 rounded p-1.5 border-l-2 border-emerald-500"> <div className="h-1 w-4 bg-emerald-500 rounded mb-1"></div> <div className="h-1 w-full bg-slate-300 rounded"></div> </div> <div className="bg-slate-50 rounded p-1.5 border-l-2 border-emerald-500"> <div className="h-1 w-6 bg-emerald-500 rounded mb-1"></div> <div className="h-1 w-4/5 bg-slate-300 rounded"></div> </div> </div> </div> </div> </div>;
  }
  if (type === "waterfall") {
    return <div className="w-full h-44 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 p-4"> <svg viewBox="0 0 400 180" className="w-full h-full text-slate-800"> {} {} <rect x="20" y="25" width="80" height="20" rx="3" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.5" /> <text x="60" y="38" fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle">1. Plan</text> {} <path d="M 80 45 L 80 65 L 125 65" fill="none" stroke="#94a3b8" strokeWidth="1.5" /> <polygon points="130,65 122,61 122,69" fill="#94a3b8" /> {} <rect x="110" y="55" width="80" height="20" rx="3" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.5" /> <text x="150" y="68" fill="#8b5cf6" fontSize="9" fontWeight="bold" textAnchor="middle">2. Design</text> {} <path d="M 170 75 L 170 95 L 215 95" fill="none" stroke="#94a3b8" strokeWidth="1.5" /> <polygon points="220,95 212,91 212,99" fill="#94a3b8" /> {} <rect x="200" y="85" width="80" height="20" rx="3" fill="#ffffff" stroke="#0891b2" strokeWidth="1.5" /> <text x="240" y="98" fill="#0891b2" fontSize="9" fontWeight="bold" textAnchor="middle">3. Build</text> {} <path d="M 260 105 L 260 125 L 305 125" fill="none" stroke="#94a3b8" strokeWidth="1.5" /> <polygon points="310,125 302,121 302,129" fill="#94a3b8" /> {} <rect x="290" y="115" width="90" height="20" rx="3" fill="#ffffff" stroke="#10b981" strokeWidth="1.5" /> <text x="335" y="128" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">4. Release</text> </svg> </div>;
  }
  return <div className="w-full h-44 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 p-4"> <svg viewBox="0 0 400 180" className="w-full h-full text-slate-800"> {} <rect x="20" y="45" width="90" height="35" rx="5" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" /> <text x="65" y="60" fill="#d97706" fontSize="9" fontWeight="bold" textAnchor="middle">Milestone Plan</text> <text x="65" y="72" fill="#475569" fontSize="8" textAnchor="middle">(Phase Gates)</text> {} <line x1="110" y1="62" x2="160" y2="62" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" /> <polygon points="165,62 157,58 157,66" fill="#94a3b8" /> {} <rect x="175" y="30" width="180" height="65" rx="6" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.5" /> <text x="265" y="48" fill="#8b5cf6" fontSize="10" fontWeight="bold" textAnchor="middle">Sprint Iterations</text> {} <rect x="195" y="58" width="35" height="15" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" /> <rect x="245" y="58" width="35" height="15" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" /> <rect x="295" y="58" width="35" height="15" rx="2" fill="#f8fafc" stroke="#10b981" strokeWidth="1" /> {} <path d="M 335 45 C 355 45, 355 80, 335 80" fill="none" stroke="#8b5cf6" strokeWidth="1.5" /> <polygon points="330,80 338,76 338,84" fill="#8b5cf6" /> {} <text x="200" y="130" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="middle">Governed Phase Boundaries</text> <text x="200" y="148" fill="#8b5cf6" fontSize="9" fontWeight="bold" textAnchor="middle">executed via Agile Sprints</text> </svg> </div>;
}
