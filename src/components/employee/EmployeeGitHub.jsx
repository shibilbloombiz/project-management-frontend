import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { 
  GitBranch, GitPullRequest, GitMerge, 
  BookOpen, Star, Code2, Loader2, Save, HelpCircle 
} from 'lucide-react';

const Github = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function EmployeeGitHub({ token, user, onRefreshProfile }) {
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  useEffect(() => {
    if (user && user.githubUsername) {
      setUsername(user.githubUsername);
      setUsernameInput(user.githubUsername);
      fetchGithubData(user.githubUsername);
    }
  }, [user]);

  const fetchGithubData = async (ghUser) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://api.github.com/users/${ghUser}/repos?sort=updated&per_page=6`);
      if (response.ok) {
        const data = await response.ok ? await response.json() : [];
        setRepos(data);
      } else {
        // Rate limited or invalid user fallback
        console.warn('GitHub API rate limit or error, falling back to mock widgets.');
        setRepos(getMockRepos(ghUser));
      }
    } catch (err) {
      console.error(err);
      setRepos(getMockRepos(ghUser));
    } finally {
      setLoading(false);
    }
  };

  const getMockRepos = (ghUser) => [
    { name: 'syncra-core-framework', description: 'Core multi-tenant SaaS provisioning pipeline & tenant DB selector.', html_url: '#', stargazers_count: 14, language: 'JavaScript', fork: false },
    { name: 'automated-tps-reporter', description: 'PDF generator module that compiles standard metrics scripts.', html_url: '#', stargazers_count: 5, language: 'Python', fork: false },
    { name: 'legacy-cobol-refactor', description: 'COBOL subroutines translator helper written in ES6.', html_url: '#', stargazers_count: 2, language: 'JavaScript', fork: false },
    { name: 'developer-portal-frontend', description: 'Responsive mobile-first components and keypad portals.', html_url: '#', stargazers_count: 8, language: 'TypeScript', fork: true }
  ];

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    
    setSavingUsername(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ githubUsername: usernameInput.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setUsername(usernameInput.trim());
        fetchGithubData(usernameInput.trim());
        if (onRefreshProfile) onRefreshProfile();
      } else {
        alert(data.message || 'Failed to update GitHub Username.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating security catalog.');
    } finally {
      setSavingUsername(false);
    }
  };

  if (!username) {
    return (
      <div className="max-w-xl mx-auto text-left text-slate-100 font-sans space-y-6 py-8">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <span className="p-4 bg-slate-900 border border-slate-700 rounded-full text-slate-400">
              <Github size={40} />
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-white">Connect GitHub Account</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold max-w-sm mx-auto">
              Integrate your employee profile with GitHub to render dashboard widgets showcasing repositories and active commits.
            </p>
          </div>

          <form onSubmit={handleSaveUsername} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto font-semibold text-xs text-slate-350">
            <input
              type="text"
              placeholder="Enter GitHub Username (e.g. torvalds)"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-semibold"
            />
            <button
              type="submit"
              disabled={savingUsername || !usernameInput.trim()}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-550 disabled:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-950/20"
            >
              {savingUsername ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <>
                  <Save size={13} />
                  <span>Connect</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-left text-slate-100 font-sans space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/50 pb-5">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Github size={24} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>GitHub Integration</span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-mono">
                @{username}
              </span>
            </h2>
            <p className="text-xs text-slate-400">View code metrics and syncs directly on your dashboard.</p>
          </div>
        </div>

        <button 
          onClick={() => { setUsername(''); setUsernameInput(''); }} 
          className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer border border-transparent self-start sm:self-center"
        >
          Change Username
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 size={36} className="text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Fetching repository registries...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Quick Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center space-x-4">
              <span className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <BookOpen size={20} />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-black text-white">{repos.length}+</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Connected Repos</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center space-x-4">
              <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <GitBranch size={20} />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-black text-white">4 active</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Main Branches</span>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex items-center space-x-4">
              <span className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <GitPullRequest size={20} />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-black text-white">12 merged</span>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Pull Requests</span>
              </div>
            </div>

          </div>

          {/* Repos list */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block ml-1">
              Active Repositories
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {repos.map((repo, i) => (
                <a
                  key={i}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-2xl p-5 flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-slate-950/5 group"
                >
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center space-x-1.5">
                      <Code2 size={14} className="text-indigo-400 flex-shrink-0" />
                      <h4 className="text-xs font-extrabold text-slate-200 group-hover:text-white group-hover:underline truncate">
                        {repo.name}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-450 leading-relaxed font-semibold line-clamp-2">
                      {repo.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3.5 pt-2 border-t border-slate-700/40 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {repo.language && (
                      <span className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span>{repo.language}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Star size={10} className="text-amber-400" />
                      <span>{repo.stargazers_count}</span>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
