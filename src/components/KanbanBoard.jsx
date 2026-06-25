import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

const INITIAL_TASKS = [
  { id: '1', title: 'Design onboarding user flow', status: 'todo', tag: 'Design' },
  { id: '2', title: 'Configure Tailwind CSS v4 in React project', status: 'progress', tag: 'Dev' },
  { id: '3', title: 'Implement accessible Modal component', status: 'progress', tag: 'Dev' },
  { id: '4', title: 'Conduct user research interviews', status: 'done', tag: 'Product' },
  { id: '5', title: 'Optimize production build size', status: 'done', tag: 'Dev' },
];

const COLUMNS = [
  { id: 'todo', name: 'To Do', color: 'border-t-cyan-500 bg-cyan-50/20' },
  { id: 'progress', name: 'In Progress', color: 'border-t-brand-purple bg-purple-50/20' },
  { id: 'done', name: 'Done', color: 'border-t-emerald-500 bg-emerald-50/20' }
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [newTaskTexts, setNewTaskTexts] = useState({ todo: '', progress: '', done: '' });
  const [activeNewTaskCol, setActiveNewTaskCol] = useState(null);

  // Handle Drag & Drop
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: targetStatus } : task
      )
    );
  };

  // Add Task
  const handleAddTask = (status) => {
    const title = newTaskTexts[status].trim();
    if (!title) return;

    const newTask = {
      id: Date.now().toString(),
      title,
      status,
      tag: status === 'todo' ? 'Design' : status === 'progress' ? 'Dev' : 'Marketing'
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTexts(prev => ({ ...prev, [status]: '' }));
    setActiveNewTaskCol(null);
  };

  // Delete Task
  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Move via keyboard/buttons (Accessibility)
  const handleMoveStatus = (taskId, direction) => {
    const currentIndex = COLUMNS.findIndex(col => {
      const task = tasks.find(t => t.id === taskId);
      return col.id === task?.status;
    });

    if (currentIndex === -1) return;
    const nextIndex = currentIndex + direction;

    if (nextIndex >= 0 && nextIndex < COLUMNS.length) {
      const nextStatus = COLUMNS[nextIndex].id;
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: nextStatus } : task
        )
      );
    }
  };

  return (
    <div className="w-full max-w-5xl p-6 mx-auto bg-white/80 rounded-2xl border border-slate-200 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="text-left">
          <h3 className="text-xl font-extrabold font-display text-slate-800">Live Interactive Demo</h3>
          <p className="text-sm text-slate-500 font-medium">Drag & drop cards or use buttons to manage tasks in real-time.</p>
        </div>
        <div className="flex space-x-2">
          <span className="flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span> Design
          </span>
          <span className="flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-brand-purple mr-2"></span> Dev
          </span>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className={`flex flex-col h-[420px] rounded-xl border-t-4 ${column.color} border-x border-b border-slate-200/80 p-4 relative transition-all duration-300 shadow-sm`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-800 flex items-center font-display text-sm uppercase tracking-wider">
                  {column.name}
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-slate-200/80 text-slate-600">
                    {columnTasks.length}
                  </span>
                </h4>
              </div>

              {/* Task Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin text-left">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-all duration-200 shadow-sm group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        task.tag === 'Design' 
                          ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' 
                          : task.tag === 'Dev' 
                            ? 'bg-purple-50 text-brand-purple border border-purple-100' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {task.tag}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-100 rounded cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 line-clamp-2 leading-relaxed">
                      {task.title}
                    </p>

                    {/* Move controls for accessibility */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                      <div className="flex space-x-1">
                        {column.id !== 'todo' && (
                          <button
                            onClick={() => handleMoveStatus(task.id, -1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            aria-label="Move left"
                          >
                            <ArrowLeft size={12} />
                          </button>
                        )}
                        {column.id !== 'done' && (
                          <button
                            onClick={() => handleMoveStatus(task.id, 1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            aria-label="Move right"
                          >
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">ID: {task.id.slice(-4)}</span>
                    </div>
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="h-28 flex items-center justify-center border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs font-semibold text-center px-4">
                    Drop items here or click "+" to add a task.
                  </div>
                )}
              </div>

              {/* Add Task Control */}
              <div className="mt-3">
                {activeNewTaskCol === column.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newTaskTexts[column.id]}
                      onChange={(e) => setNewTaskTexts(prev => ({ ...prev, [column.id]: e.target.value }))}
                      placeholder="Enter task name..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-purple"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTask(column.id);
                        if (e.key === 'Escape') setActiveNewTaskCol(null);
                      }}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddTask(column.id)}
                        className="flex-1 py-1 text-[11px] font-bold bg-brand-purple hover:bg-purple-600 text-white rounded transition-colors cursor-pointer"
                      >
                        Add Task
                      </button>
                      <button
                        onClick={() => setActiveNewTaskCol(null)}
                        className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveNewTaskCol(column.id)}
                    className="w-full py-2 flex items-center justify-center text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-dashed border-slate-300 transition-all cursor-pointer"
                  >
                    <Plus size={14} className="mr-1" /> Add Task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
