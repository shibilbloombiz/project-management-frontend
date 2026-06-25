import React from 'react';
import { Cpu, Zap, BarChart3, Users, Shuffle, Lock } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Real-Time Synchronization',
    description: 'Collaborate with your team instantly. Status updates, comments, and task assignments propagate across all client devices in milliseconds.',
    color: 'text-cyan-600 bg-cyan-50'
  },
  {
    icon: Cpu,
    title: 'No-Code Workflow Automations',
    description: 'Save hours by automating repetitive chores. Create rules like: "When a GitHub Pull Request is opened, move task card to In Review".',
    color: 'text-brand-purple bg-purple-50'
  },
  {
    icon: BarChart3,
    title: 'Actionable Insights & Velocity',
    description: 'Track sprint velocities, cumulative flow diagrams, and Cycle/Lead times automatically to find bottlenecks and optimize delivery speed.',
    color: 'text-emerald-600 bg-emerald-50'
  },
  {
    icon: Users,
    title: 'Cross-Functional Collaboration',
    description: 'Bridge the gap between design, engineering, and product. Threaded discussions, rich markdown docs, and media attachments nested inside every card.',
    color: 'text-blue-600 bg-blue-50'
  },
  {
    icon: Shuffle,
    title: 'Framework Interoperability',
    description: 'Switch visual representations instantly. View your dev tasks as a Kanban board, and view marketing launch pipelines as a linear timeline Gantt chart.',
    color: 'text-amber-600 bg-amber-50'
  },
  {
    icon: Lock,
    title: 'Enterprise-Grade Security',
    description: 'Maintain strict control over access permissions. Benefit from single sign-on (SSO), data encryption at rest, and compliance audit logging.',
    color: 'text-rose-600 bg-rose-50'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 border-t border-slate-200/80 bg-slate-50/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="reveal text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-cyan bg-brand-cyan/10 px-3 py-1 rounded-full border border-brand-cyan/20">
            Advanced Capabilities
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Designed for Modern High-Velocity Teams
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything your product development organization needs, built inside a blazingly fast interface.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="reveal p-8 rounded-2xl glass-card border border-slate-200 bg-white/50 flex flex-col items-start hover:border-slate-300 transition-all duration-300 shadow-sm"
              >
                <div className={`p-3 rounded-xl mb-6 ${feature.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 font-display">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
