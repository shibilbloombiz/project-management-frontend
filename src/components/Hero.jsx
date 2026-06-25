import React from 'react';
import KanbanBoard from './KanbanBoard';
import { ArrowRight, Play, Star } from 'lucide-react';

export default function Hero({ onStartTrial }) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Rating Badge */}
        <div className="reveal inline-flex items-center space-x-2 bg-white/80 border border-slate-200/80 px-4 py-1.5 rounded-full mb-8 shadow-sm backdrop-blur-md">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="currentColor" />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-700 font-display">
            Trusted by 50,000+ teams worldwide
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="reveal text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 font-display max-w-5xl mx-auto leading-[1.1]">
          Unify Your Teams. <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Accelerate Your Delivery.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="reveal mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
          The ultimate developer-first workspace that adapts to your workflow. Run Scrum Sprints, manage continuous Kanban boards, or build multi-phase Waterfall project models in one synchronized platform.
        </p>

        {/* Action Buttons */}
        <div className="reveal mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onStartTrial}
            className="w-full sm:w-auto px-8 py-4 font-bold text-white bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-95 rounded-full flex items-center justify-center space-x-2 shadow-lg shadow-brand-purple/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Get Started For Free</span>
            <ArrowRight size={18} />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer">
            <Play size={16} fill="currentColor" className="text-brand-purple" />
            <span>Watch Demo Video</span>
          </button>
        </div>

        {/* Live Board Demo Container */}
        <div id="demo" className="reveal mt-20 relative">
          {/* Subtle outer glow for the board */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan/5 via-brand-indigo/5 to-brand-purple/5 rounded-3xl blur-2xl -z-10"></div>
          
          <KanbanBoard />
        </div>
      </div>
    </section>
  );
}
