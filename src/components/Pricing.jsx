import React from 'react';
import { Check, Flame, Shield, Zap } from 'lucide-react';

export default function Pricing({ plans = [], onSelectPlan }) {
  // Initial fallback plans if dynamic plans are empty or loading
  const defaultPlans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      desc: 'Small limited access package to explore Syncra core capabilities.',
      features: [
        'Max 3 Projects active',
        'Max 5 Employees workspace roster',
        'Max 2 Clients registry records',
        'Shared client portals access',
        'In-memory fallback local store resilience',
      ],
      icon: <Zap className="text-slate-400" size={20} />,
      cta: 'Get Started Free',
      popular: false,
      color: 'border-slate-200 bg-white/70 hover:shadow-slate-100',
      btnColor: 'bg-slate-800 text-white hover:bg-slate-900',
    },
    {
      name: 'Starter Package',
      price: '₹2,500',
      period: 'month',
      desc: 'Perfect for smaller agencies launching automated compliance audits.',
      features: [
        'Max 10 Projects active',
        'Max 15 Employees roster capacity',
        'Max 10 Clients profiles',
        'Shared client description portals',
        'Daily database persistent checkpoints',
      ],
      icon: <Zap className="text-indigo-500" size={20} />,
      cta: 'Subscribe Starter',
      popular: false,
      color: 'border-indigo-100 bg-white/70 hover:shadow-indigo-50',
      btnColor: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100',
    },
    {
      name: 'Scale Package Tier',
      price: '₹8,900',
      period: 'month',
      desc: 'Complete PM pipelines with automated attendance reporting.',
      features: [
        'Max 30 Projects active',
        'Max 50 Employees capacity',
        'Max 40 Clients profiles',
        'Dynamic Excel/CSV attendance reporting',
        'Soft-delete trash bin recovery log',
      ],
      icon: <Flame className="text-amber-500" size={20} />,
      cta: 'Subscribe Scale',
      popular: true,
      color: 'border-amber-200 bg-amber-50/20 hover:shadow-amber-100 scale-105 shadow-lg',
      btnColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-95 shadow-amber-100',
    },
    {
      name: 'Enterprise SaaS Tier',
      price: '₹25,000',
      period: 'month',
      desc: 'High-performance dedicated infrastructure node for corporations.',
      features: [
        'Unlimited projects active',
        'Unlimited employee seat rosters',
        'Unlimited client registers',
        'SLA security verification console',
        'Custom corporate email domains auth',
      ],
      icon: <Shield className="text-purple-500" size={20} />,
      cta: 'Contact Enterprise',
      popular: false,
      color: 'border-purple-100 bg-white/70 hover:shadow-purple-50',
      btnColor: 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100',
    },
  ];

  // Map dynamic plans to match the landing page theme
  const displayPlans = (plans && plans.length > 0) ? [...plans].sort((a, b) => a.price - b.price).map(p => {
    const isFree = p.name.toLowerCase().includes('free');
    const isScale = p.name.toLowerCase().includes('scale');
    const isEnterprise = p.name.toLowerCase().includes('enterprise');

    let icon = <Zap className="text-indigo-500" size={20} />;
    let popular = false;
    let color = 'border-indigo-100 bg-white/70 hover:shadow-indigo-50';
    let btnColor = 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100';
    let desc = `Perfect for growing workspaces. Enforces a capacity cap of ${p.limit}.`;
    
    if (isFree) {
      icon = <Zap className="text-slate-400" size={20} />;
      color = 'border-slate-200 bg-white/70 hover:shadow-slate-100';
      btnColor = 'bg-slate-800 text-white hover:bg-slate-900';
      desc = 'Small limited access package to explore Syncra core capabilities.';
    } else if (isScale) {
      icon = <Flame className="text-amber-500" size={20} />;
      popular = true;
      color = 'border-amber-200 bg-amber-50/20 hover:shadow-amber-100 scale-105 shadow-lg';
      btnColor = 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-95 shadow-amber-100';
      desc = 'Complete PM pipelines with automated attendance reporting.';
    } else if (isEnterprise) {
      icon = <Shield className="text-purple-500" size={20} />;
      color = 'border-purple-100 bg-white/70 hover:shadow-purple-50';
      btnColor = 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100';
      desc = 'High-performance dedicated infrastructure node for corporations.';
    }

    return {
      name: p.name,
      price: p.price === 0 ? 'Free' : `₹${p.price.toLocaleString()}`,
      period: 'month',
      desc,
      features: [
        `Max ${p.maxProjects === 99999 ? 'Unlimited' : p.maxProjects} Projects active`,
        `Max ${p.maxUsers === 99999 ? 'Unlimited' : p.maxUsers} Employees capacity`,
        'Shared client portal gateways',
        'Daily database persistent checkpoints',
        isFree ? 'In-memory local store resilience' : 'Dedicated workspace isolation node'
      ],
      icon,
      cta: isFree ? 'Get Started Free' : `Subscribe ${p.name.split(' ')[0]}`,
      popular,
      color,
      btnColor
    };
  }) : defaultPlans;

  return (
    <section id="pricing" className="py-20 bg-slate-50 relative overflow-hidden text-left reveal">
      {/* Background blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title / Description */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Subscription Plan Tiers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Flexible Packages Tailored to Your Growth
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Deploy secure PM modules scoped exactly to your headcount. Get started on our Free Plan or scale with high-capacity enterprise workspaces.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch pt-6">
          {displayPlans.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative flex flex-col justify-between border-2 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm whitespace-nowrap">
                  Most Popular
                </div>
              )}
              
              <div>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">
                    {plan.name}
                  </span>
                  {plan.icon}
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-extrabold font-display text-slate-900 tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 ml-1">
                    /{plan.period === 'forever' ? 'forever' : 'month'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium mb-6 min-h-[36px] leading-relaxed">
                  {plan.desc}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-start text-xs font-semibold text-slate-600 space-x-2">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectPlan(plan.name)}
                className={`w-full py-3 rounded-2xl font-bold text-xs cursor-pointer shadow-md transition-all active:scale-[0.98] ${plan.btnColor}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
