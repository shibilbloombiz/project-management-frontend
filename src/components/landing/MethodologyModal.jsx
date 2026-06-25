import { Check, AlertTriangle } from 'lucide-react';
import Modal from '../Modal';
import { ModelDiagram } from '../Methodologies';

export default function MethodologyModal({ selectedModel, onClose }) {
  return (
    <Modal
      isOpen={!!selectedModel}
      onClose={onClose}
      title={selectedModel ? selectedModel.name : ''}
    >
      {selectedModel && (
        <div className="space-y-6">
          <p className="text-slate-600 text-base leading-relaxed font-semibold">
            {selectedModel.shortDesc}
          </p>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block font-display">
              Methodology Visualization
            </span>
            <ModelDiagram type={selectedModel.diagramType} />
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block font-display">
              Key Characteristics
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {selectedModel.characteristics.map((char, index) => (
                <li key={index} className="flex items-start space-x-2 text-slate-600 font-medium">
                  <span className="text-brand-purple mt-1 flex-shrink-0">*</span>
                  <span>{char}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm">
            <span className="font-bold text-slate-800 block mb-1 font-display">Best Applied To:</span>
            <span className="text-slate-600 font-medium leading-relaxed">{selectedModel.bestFor}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center font-display">
                <Check size={14} className="mr-1" /> Key Benefits
              </span>
              <ul className="space-y-2 text-sm text-slate-600 font-medium">
                {selectedModel.pros.map((pro, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-emerald-500 mt-1 flex-shrink-0">+</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center font-display">
                <AlertTriangle size={14} className="mr-1" /> Trade-offs & Risks
              </span>
              <ul className="space-y-2 text-sm text-slate-600 font-medium">
                {selectedModel.cons.map((con, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-amber-500 mt-1 flex-shrink-0">!</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg border border-slate-200 transition-colors mr-3 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 rounded-lg shadow-md transition-all cursor-pointer"
            >
              Try It in Live Demo
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
