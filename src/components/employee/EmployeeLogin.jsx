import React, { useState } from "react";
import { API_BASE_URL } from "../../config";
import { Mail, Lock, KeyRound, ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function EmployeeLogin({
  onLoginSuccess,
  onBackToLanding
}) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async e => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError("Please fill in both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("employeeToken", data.token);
        localStorage.setItem("employeeName", data.name);
        localStorage.setItem("employeeEmail", loginEmail);
        localStorage.setItem("employeeId", data.employeeId);
        localStorage.setItem("companyId", data.companyId);
        localStorage.setItem("org", data.org);
        onLoginSuccess(data.token, data);
      } else {
        setError(data.message || "Login failed. Invalid credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Cannot connect to the server. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-slate-100 font-sans"> {onBackToLanding && <button onClick={onBackToLanding} className="absolute top-8 left-8 flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"> <ArrowLeft size={16} /> <span>Return to Landing</span> </button>} <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div> <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div> <div className="w-full max-w-lg bg-slate-800/90 border border-slate-700/80 shadow-2xl rounded-3xl p-8 relative z-10 backdrop-blur-md"> <div className="text-center mb-8"> <span className="inline-flex p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-4 shadow-inner"> <KeyRound size={28} /> </span> <h2 className="text-3xl font-extrabold tracking-tight text-white font-display"> Employee Workspace </h2> <p className="text-sm text-slate-400 mt-2 font-medium"> Sign in to access your projects & tools </p> </div> {error && <div className="flex items-start space-x-2.5 p-3.5 bg-red-950/40 border border-red-800/50 text-red-300 text-xs font-semibold rounded-xl mb-6"> <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" /> <span>{error}</span> </div>} <form onSubmit={handleLogin} className="space-y-5 text-left text-xs font-semibold text-slate-300"> <div> <label htmlFor="login-email" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2"> Work Email Address </label> <div className="relative"> <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"> <Mail size={16} /> </span> <input id="login-email" type="email" placeholder="name@company.com" value={loginEmail} onChange={e => {
              setLoginEmail(e.target.value);
              setError("");
            }} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" /> </div> </div> <div> <label htmlFor="login-password" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2"> Password </label> <div className="relative"> <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400"> <Lock size={16} /> </span> <input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={e => {
              setLoginPassword(e.target.value);
              setError("");
            }} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" /> </div> </div> <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold text-sm rounded-xl cursor-pointer transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center space-x-2 mt-4"> {loading ? <> <Loader2 size={16} className="animate-spin" /> <span>Signing in...</span> </> : <> <span>Sign In</span> <ArrowRight size={16} /> </>} </button> </form> </div> </div>;
}
