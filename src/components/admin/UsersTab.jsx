import React from 'react';
import { Trash2 } from 'lucide-react';
import Tooltip from '../Tooltip';

export default function UsersTab({ users, onDeleteUser }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/70 dark:bg-slate-850/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            <th className="py-4 px-6">User Details</th>
            <th className="py-4 px-6">Email Address</th>
            <th className="py-4 px-6">Organization</th>
            <th className="py-4 px-6">SaaS System Role</th>
            <th className="py-4 px-6">Registration Date</th>
            <th className="py-4 px-6">Status Registry</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-350">
          {users.map((user, i) => (
            <tr key={user._id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="py-4 px-6 flex items-center space-x-3 text-left">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-extrabold flex items-center justify-center text-xs shrink-0">
                  {user.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <span className="font-extrabold text-slate-800 dark:text-white">{user.name}</span>
              </td>
              <td className="py-4 px-6 text-xs font-medium font-mono text-slate-500 dark:text-slate-400">{user.email}</td>
              <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{user.org || 'SaaS System Node'}</td>
              <td className="py-4 px-6">
                <span className={`text-xs font-bold border px-2 py-0.5 rounded-full ${
                  user.role === 'Super Admin'
                    ? 'bg-purple-50 text-brand-purple border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/30'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/60'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="py-4 px-6 text-xs text-slate-400 dark:text-slate-500 font-medium">{user.date || 'April 10, 2026'}</td>
              <td className="py-4 px-6">
                <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-450">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  {user.status}
                </span>
              </td>
              <td className="py-4 px-6 text-right">
                {user.role !== 'Super Admin' && (
                  <Tooltip text="Delete User Account">
                    <button
                      onClick={() => onDeleteUser(user._id || user.id)}
                      className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 border border-transparent hover:border-red-200 dark:hover:border-red-950/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </Tooltip>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-semibold">No users match search filter query.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
