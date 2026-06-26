import React, { useState } from 'react';
import { Menu, X, Layers } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onStartTrial, onLogin }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass border-b border-slate-200/50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-lg text-white">
              <Layers size={20} />
            </div>
            <span className="text-xl font-bold font-display text-slate-800 tracking-wide">
              Syncra<span className="text-brand-purple">.</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#workflow" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              SaaS Workflow
            </a>
            <a href="#models" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              PM Models
            </a>
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#demo" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Live Demo
            </a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Pricing
            </a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle compact />
            <button 
              onClick={onLogin}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200/80 rounded-full transition-all cursor-pointer"
            >
              Log In
            </button>
            <button 
              onClick={onStartTrial}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-95 rounded-full transition-all shadow-md shadow-brand-purple/10 focus:outline-none focus:ring-2 focus:ring-brand-cyan cursor-pointer"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg focus:outline-none hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-lg">
          <div className="px-2 pt-2 pb-4 space-y-1">
            <a
              href="#workflow"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            >
              SaaS Workflow
            </a>
            <a
              href="#models"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            >
              PM Models
            </a>
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            >
              Features
            </a>
            <a
              href="#demo"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            >
              Live Demo
            </a>
            <a
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            >
              Pricing
            </a>
            <div className="pt-4 px-3 space-y-2">
              <ThemeToggle />
              <button 
                onClick={() => {
                  setIsOpen(false);
                  onLogin();
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 hover:text-indigo-600 border border-slate-200/80 rounded-full cursor-pointer"
              >
                Log In
              </button>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  onStartTrial();
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-purple rounded-full cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
