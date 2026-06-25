import React, { useState } from 'react';
import { Layers, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-100/90 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top Section: Branding & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-12 border-b border-slate-200">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-tr from-brand-purple to-brand-cyan rounded-lg text-white">
                <Layers size={18} />
              </div>
              <span className="text-lg font-bold font-display text-slate-900 tracking-wide">
                Syncra<span className="text-brand-purple">.</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed font-medium">
              The project workspace built to adapt to your teams' engineering cycles. Break barriers, increase sprint velocities, and hit ship dates on time.
            </p>
          </div>
          
          {/* Newsletter signup form */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 font-display uppercase tracking-wider">
              Subscribe to our Product Updates
            </h4>
            {subscribed ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold">
                🎉 Success! Thank you for subscribing to Syncra's newsletter.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-purple placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-purple hover:bg-purple-600 rounded-xl text-sm font-bold text-white flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-brand-purple/10"
                >
                  <span>Subscribe</span>
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Middle Section: Site Map Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 font-display">Product</h5>
            <ul className="space-y-2.5">
              <li><a href="#models" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium">Framework Models</a></li>
              <li><a href="#features" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium">Platform Features</a></li>
              <li><a href="#demo" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium">Interactive Demo</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium">Integrations Hub</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 font-display">Resources</h5>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium font-medium">Agile Playbooks</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium">Dev Documentation</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium">Product Blog</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium">API Guides</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 font-display">Company</h5>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium">About Us</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium">Customers</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium">Press Room</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 font-display">Legal</h5>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium font-medium">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium font-medium">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium font-medium">Security Details</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium font-medium">GDPR & Trust</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Syncra Technologies Inc. All rights reserved. Designed for high performance.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-slate-400 hover:text-slate-800 transition-colors" aria-label="GitHub">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-800 transition-colors" aria-label="Twitter">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="mt-[1px]">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-800 transition-colors" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
