import { Check, Flame, Zap } from 'lucide-react';

const fallbackPlans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    desc: 'Small limited access package to explore Syncra core capabilities.',
    features: [
      'Max 3 Projects active',
      'Max 5 Employees workspace roster',
      'Max 2 Clients registry records',
      'Shared client portals access',
      'In-memory fallback local store resilience',
    ],
    iconType: 'free',
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Starter Package',
    price: 2500,
    period: 'month',
    desc: 'Perfect for smaller agencies launching automated compliance audits.',
    features: [
      'Max 10 Projects active',
      'Max 15 Employees roster capacity',
      'Max 10 Clients profiles',
      'Shared client description portals',
      'Daily database persistent checkpoints',
    ],
    iconType: 'starter',
    cta: 'Subscribe Starter',
    popular: false,
  },
  {
    name: 'Scale Package Tier',
    price: 8900,
    period: 'month',
    desc: 'Complete PM pipelines with automated attendance reporting.',
    features: [
      'Max 30 Projects active',
      'Max 50 Employees capacity',
      'Max 40 Clients profiles',
      'Formal PDF reporting exports',
      'Soft-delete trash bin recovery log',
    ],
    iconType: 'scale',
    cta: 'Subscribe Scale',
    popular: true,
  },
];

function getPlanStyle(plan) {
  const name = plan.name.toLowerCase();
  if (name.includes('free')) {
    return {
      icon: <Zap className="text-slate-400" size={20} />,
      color: 'border-slate-200 bg-white/70 hover:shadow-slate-100',
      btnColor: 'bg-slate-800 text-white hover:bg-slate-900',
    };
  }
  if (name.includes('scale')) {
    return {
      icon: <Flame className="text-amber-500" size={20} />,
      color: 'border-amber-200 bg-amber-50/20 hover:shadow-amber-100 scale-105 shadow-lg',
      btnColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-95 shadow-amber-100',
    };
  }
  return {
    icon: <Zap className="text-indigo-500" size={20} />,
    color: 'border-indigo-100 bg-white/70 hover:shadow-indigo-50',
    btnColor: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100',
  };
}

function mapDynamicPlan(plan) {
  const isFree = plan.name.toLowerCase().includes('free');
  const style = getPlanStyle(plan);
  return {
    name: plan.name,
    price: Number(plan.price) || 0,
    period: isFree ? 'forever' : 'month',
    desc: isFree
      ? 'Small limited access package to explore Syncra core capabilities.'
      : `Perfect for growing workspaces. Enforces a capacity cap of ${plan.limit}.`,
    features: [
      `Max ${plan.maxProjects === 99999 ? 'Unlimited' : plan.maxProjects} Projects active`,
      `Max ${plan.maxUsers === 99999 ? 'Unlimited' : plan.maxUsers} Employees capacity`,
      'Shared client portal gateways',
      'Daily database persistent checkpoints',
      isFree ? 'In-memory local store resilience' : 'Dedicated workspace isolation node',
    ],
    cta: isFree ? 'Get Started Free' : `Subscribe ${plan.name.split(' ')[0]}`,
    popular: plan.name.toLowerCase().includes('scale'),
    ...style,
  };
}

export default function Pricing({ plans = [], onSelectPlan }) {
  const sourcePlans = plans.length > 0 ? plans : fallbackPlans;
  const displayPlans = [...sourcePlans]
    .sort((a, b) => Number(a.price) - Number(b.price))
    .map((plan) => ('iconType' in plan ? { ...plan, ...getPlanStyle(plan) } : mapDynamicPlan(plan)));

  return (
    <section id="pricing" className="py-20 bg-slate-50 relative overflow-hidden text-left reveal">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
            Subscription Plan Tiers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            Flexible Packages Tailored to Your Growth
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Deploy secure PM modules scoped exactly to your headcount. Get started on our Free Plan or scale with high-capacity workspaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-6">
          {displayPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between border-2 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-sm whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">
                    {plan.name}
                  </span>
                  {plan.icon}
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-extrabold font-display text-slate-900 tracking-tight">
                    {Number(plan.price) === 0 ? 'Free' : `Rs ${Number(plan.price).toLocaleString('en-IN')}`}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 ml-1">
                    /{plan.period === 'forever' ? 'forever' : 'month'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium mb-6 min-h-[36px] leading-relaxed">
                  {plan.desc}
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-xs font-semibold text-slate-600 space-x-2">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

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
