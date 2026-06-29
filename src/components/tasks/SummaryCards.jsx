import React from 'react';

export default function SummaryCards({ kpis, activeCard, onCardClick }) {
  const cards = [
    { id: 'total', label: 'Total Tasks', value: kpis.total, color: 'text-indigo-600 dark:text-indigo-400', bgClass: 'border-indigo-105 hover:border-indigo-400 bg-white dark:bg-slate-900 dark:border-slate-800' },
    { id: 'pending', label: 'Pending', value: kpis.pending, color: 'text-slate-600 dark:text-slate-400', bgClass: 'border-slate-100 hover:border-slate-400 bg-white dark:bg-slate-900 dark:border-slate-800' },
    { id: 'inProgress', label: 'In Progress', value: kpis.inProgress, color: 'text-blue-500 dark:text-blue-400', bgClass: 'border-blue-100 hover:border-blue-400 bg-white dark:bg-slate-900 dark:border-slate-800' },
    { id: 'review', label: 'In Review', value: kpis.review, color: 'text-purple-500 dark:text-purple-400', bgClass: 'border-purple-100 hover:border-purple-400 bg-white dark:bg-slate-900 dark:border-slate-800' },
    { id: 'completed', label: 'Completed', value: kpis.completed, color: 'text-emerald-500 dark:text-emerald-450', bgClass: 'border-emerald-100 hover:border-emerald-400 bg-white dark:bg-slate-900 dark:border-slate-800' },
    { id: 'overdue', label: 'Overdue', value: kpis.overdue, color: 'text-red-500 dark:text-red-400', bgClass: 'border-red-100 hover:border-red-450 bg-red-50/10 dark:bg-red-950/5 dark:border-red-900/30 font-bold' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const isSelected = activeCard === card.id;
        return (
          <div
            key={card.id}
            onClick={() => onCardClick(card.id)}
            className={`p-4 border rounded-2xl flex flex-col justify-between space-y-1.5 cursor-pointer shadow-sm transition-all duration-300 ${card.bgClass} ${isSelected ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:scale-[1.01]'}`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">{card.label}</span>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>}
            </div>
            <span className={`text-2xl font-black ${card.color}`}>{card.value}</span>
          </div>
        );
      })}
    </div>
  );
}
