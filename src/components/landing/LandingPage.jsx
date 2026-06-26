import Navbar from '../Navbar';
import Hero from '../Hero';
import WorkflowExplorer from '../WorkflowExplorer';
import Methodologies from '../Methodologies';
import Features from '../Features';
import Pricing from '../Pricing';
import Footer from '../Footer';

export default function LandingPage({
  plans,
  onStartTrial,
  onSelectModel,
  onSelectPricingPlan,
  onLogin,
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar onStartTrial={onStartTrial} onLogin={onLogin} />

      <main className="flex-grow">
        <Hero onStartTrial={onStartTrial} />
        <WorkflowExplorer />
        <Methodologies onSelectModel={onSelectModel} />
        <Features />
        <Pricing plans={plans} onSelectPlan={onSelectPricingPlan} />
      </main>

      <Footer />
    </div>
  );
}
