import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { User, Mail, ShieldAlert, Key, MapPin, ClipboardList, Lock, Sparkles, LogOut, Check } from "lucide-react";
export default function EmployeePortal({
  onBackToLanding
}) {
  const [token, setToken] = useState(sessionStorage.getItem("employee_token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [domain, setDomain] = useState("");
  const [avatarColor, setAvatarColor] = useState("#6366f1");
  const [skills, setSkills] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchTasks();
    }
  }, [token]);
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/employee-portal/me`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.data);
        setName(data.data.name || "");
        setPhone(data.data.phone || "");
        setBio(data.data.bio || "");
        setLocation(data.data.location || "");
        setDomain(data.data.domain || "");
        setAvatarColor(data.data.avatarColor || "#6366f1");
        setSkills(Array.isArray(data.data.skills) ? data.data.skills.join(", ") : "");
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };
  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employee-portal/tasks`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTasks(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTasksLoading(false);
    }
  };
  const handleLogin = async e => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employee-portal/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed.");
      }
      sessionStorage.setItem("employee_token", data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message || "Server error during login.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateProfile = async e => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/employee-portal/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          phone,
          bio,
          location,
          domain,
          avatarColor,
          skills
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileSuccess("Profile updated successfully.");
        setProfile(data.data);
      } else {
        setProfileError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      setProfileError("Failed to update profile due to connection error.");
    }
  };
  const handleChangePassword = async e => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/employee-portal/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccess("Password updated successfully.");
        setOldPassword("");
        setNewPassword("");
      } else {
        setPasswordError(data.message || "Failed to update password.");
      }
    } catch (err) {
      setPasswordError("Failed to update password due to connection error.");
    }
  };
  const handleUpdateTaskStatus = async (projectId, taskId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/employee-portal/tasks/${projectId}/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTasks(prev => prev.map(t => {
          if (t.taskId === taskId && t.projectId === projectId) {
            return {
              ...t,
              status: newStatus
            };
          }
          return t;
        }));
      } else {
        alert(data.message || "Failed to update task.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update task due to connection error.");
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem("employee_token");
    setToken("");
    setProfile(null);
    setTasks([]);
  };
  if (!token) {
    return <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-left relative overflow-hidden font-sans"> {} <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" /> <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" /> <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4"> <div className="flex items-center justify-center space-x-2"> <span className="text-xl font-black font-display tracking-tight text-white flex items-center"> <Sparkles size={20} className="text-indigo-500 mr-2" /> Syncra <span className="text-indigo-500 ml-1 font-medium">Employee Portal</span> </span> </div> <h2 className="mt-6 text-center text-2xl font-extrabold text-white font-display"> Log in to Workspace </h2> <p className="mt-1.5 text-center text-xs text-slate-400 font-semibold"> Use your corporate invite credentials to access your sprint task sheet. </p> </div> <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4"> <div className="bg-slate-900/80 backdrop-blur-md py-8 px-4 border border-slate-800 shadow-2xl rounded-3xl sm:px-10"> {error && <div className="mb-4 p-3 bg-red-950/50 border border-red-900 rounded-xl flex items-start space-x-2 text-red-400 text-xs font-semibold"> <ShieldAlert size={14} className="shrink-0 mt-0.5" /> <span>{error}</span> </div>} <form onSubmit={handleLogin} className="space-y-5 text-slate-300 font-semibold text-xs"> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> Corporate Email Address </label> <div className="relative"> <Mail size={14} className="absolute left-3 top-2.5 text-slate-500" /> <input type="email" required placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" /> </div> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> Temporary Password </label> <div className="relative"> <Key size={14} className="absolute left-3 top-2.5 text-slate-500" /> <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" /> </div> </div> <div className="pt-2"> <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-900/30 transition-all cursor-pointer flex justify-center items-center"> {isLoading ? "Verifying..." : "Access My Workspace"} </button> </div> </form> <div className="mt-6 border-t border-slate-800 pt-4 text-center"> <button onClick={onBackToLanding} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"> Back to Homepage </button> </div> </div> </div> </div>;
  }
  return <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans text-left"> {} <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex justify-between items-center"> <div className="flex items-center space-x-3"> <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm"> S </div> <div> <h1 className="text-sm font-extrabold text-slate-800 flex items-center"> Syncra Employee Space <span className="ml-2 px-2 py-0.5 text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-150 rounded-full font-bold">Self-Service</span> </h1> {profile && <p className="text-[10px] text-slate-400 font-bold mt-0.5">Logged in as {profile.name} ({profile.org || "Initech Systems"})</p>} </div> </div> <button onClick={handleLogout} className="flex items-center space-x-1.5 px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded-xl text-xs font-bold text-red-600 transition-colors cursor-pointer"> <LogOut size={12} /> <span>Exit Workspace</span> </button> </header> <div className="flex-grow max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start"> {} <aside className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4"> {profile && <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100"> <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-md" style={{
            backgroundColor: avatarColor
          }}> {name ? name.split(" ").map(n => n[0]).join("") : "E"} </div> <h2 className="mt-3 font-extrabold text-slate-800 text-sm">{name || "Employee"}</h2> <span className="text-[10px] bg-slate-100 text-slate-500 font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200 mt-1 block"> {domain || "Tech Stack Specialist"} </span> <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-semibold mt-2"> <MapPin size={10} /> <span>{location || "Remote Node"}</span> </div> </div>} <nav className="flex flex-col space-y-1 font-semibold text-xs"> <button onClick={() => setActiveTab("tasks")} className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === "tasks" ? "bg-indigo-50 text-indigo-700 font-extrabold" : "text-slate-600 hover:bg-slate-50"}`}> <ClipboardList size={14} /> <span>Sprint Task Sheet</span> </button> <button onClick={() => setActiveTab("profile")} className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === "profile" ? "bg-indigo-50 text-indigo-700 font-extrabold" : "text-slate-600 hover:bg-slate-50"}`}> <User size={14} /> <span>Profile Settings</span> </button> <button onClick={() => setActiveTab("security")} className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === "security" ? "bg-indigo-50 text-indigo-700 font-extrabold" : "text-slate-600 hover:bg-slate-50"}`}> <Lock size={14} /> <span>Security</span> </button> </nav> </aside> {} <main className="lg:col-span-3 space-y-6"> {} {activeTab === "tasks" && <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5"> <div className="flex justify-between items-center border-b border-slate-100 pb-4"> <div> <h3 className="text-sm font-extrabold text-slate-800">My Sprint Task Sheet</h3> <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Update status of deliverables assigned to you. This updates dashboard diagrams instantly.</p> </div> <button onClick={fetchTasks} className="p-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-[10px] font-bold text-slate-500 cursor-pointer"> Sync Tasks </button> </div> {tasksLoading ? <div className="p-10 text-center text-slate-400 font-bold text-xs animate-pulse">Syncing tasks...</div> : <div className="space-y-3"> {tasks.map(task => <div key={`${task.projectId}_${task.taskId}`} className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"> <div className="space-y-1"> <span className="text-[9px] bg-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded border border-slate-300"> {task.projectName} </span> <h4 className="font-extrabold text-slate-800 text-sm pt-0.5">{task.taskTitle}</h4> </div> <div className="flex items-center space-x-2 shrink-0"> <label className="text-[10px] text-slate-400 font-bold mr-1">Status:</label> <select value={task.status} onChange={e => handleUpdateTaskStatus(task.projectId, task.taskId, task.status, e.target.value)} className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"> <option value="Planning">Planning</option> <option value="Dev">In Development</option> <option value="QA">QA / Review</option> <option value="Done">Completed</option> </select> </div> </div>)} {tasks.length === 0 && <div className="text-center py-12 text-slate-400 font-semibold text-xs"> No deliverables are currently assigned to your email handle. </div>} </div>} </div>} {} {activeTab === "profile" && <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5"> <div className="border-b border-slate-100 pb-4"> <h3 className="text-sm font-extrabold text-slate-800">Configure Sprint Profile</h3> <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Keep your details up-to-date so that project planners can orchestrate sprints correctly.</p> </div> {profileSuccess && <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl flex items-start space-x-2 text-emerald-700 text-xs font-semibold"> <Check size={14} className="shrink-0 mt-0.5" /> <span>{profileSuccess}</span> </div>} {profileError && <div className="p-3 bg-red-50 border border-red-150 rounded-xl flex items-start space-x-2 text-red-600 text-xs font-semibold"> <ShieldAlert size={14} className="shrink-0 mt-0.5" /> <span>{profileError}</span> </div>} <form onSubmit={handleUpdateProfile} className="space-y-4 font-semibold text-xs text-slate-700"> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> Full Name </label> <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" /> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> Phone Number </label> <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" /> </div> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> Location </label> <input type="text" placeholder="e.g. Bangalore" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" /> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> Domain Stack / Role </label> <input type="text" placeholder="e.g. QA Engineer" value={domain} onChange={e => setDomain(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" /> </div> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> Avatar Design Color </label> <div className="flex items-center space-x-2"> {["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"].map(color => <button key={color} type="button" onClick={() => setAvatarColor(color)} className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${avatarColor === color ? "border-slate-800 scale-110" : "border-transparent"}`} style={{
                  backgroundColor: color
                }} />)} </div> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> My Skills (comma-separated list) </label> <input type="text" placeholder="e.g. React, Node, Python, Cypress" value={skills} onChange={e => setSkills(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" /> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> Short Bio / Focus Area </label> <textarea rows="3" placeholder="Tell the team what you specialize in..." value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" /> </div> <div className="pt-2"> <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-colors"> Save Sprint Profile </button> </div> </form> </div>} {} {activeTab === "security" && <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5"> <div className="border-b border-slate-100 pb-4"> <h3 className="text-sm font-extrabold text-slate-800">Workspace Security</h3> <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Change your corporate temporary password to lock your profile record securely.</p> </div> {passwordSuccess && <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl flex items-start space-x-2 text-emerald-700 text-xs font-semibold"> <Check size={14} className="shrink-0 mt-0.5" /> <span>{passwordSuccess}</span> </div>} {passwordError && <div className="p-3 bg-red-50 border border-red-150 rounded-xl flex items-start space-x-2 text-red-600 text-xs font-semibold"> <ShieldAlert size={14} className="shrink-0 mt-0.5" /> <span>{passwordError}</span> </div>} <form onSubmit={handleChangePassword} className="space-y-4 font-semibold text-xs text-slate-750 max-w-sm"> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> Current Password </label> <input type="password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" /> </div> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> New Secure Password </label> <input type="password" required placeholder="At least 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" /> </div> <div className="pt-2"> <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-colors"> Update My Credentials </button> </div> </form> </div>} </main> </div> </div>;
}
