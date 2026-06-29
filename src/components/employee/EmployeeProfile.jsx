import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import { User, Mail, Phone, MapPin, Briefcase, FileText, Code, Check, Loader2, AlertCircle, Sparkles, Lock, KeyRound, ShieldCheck } from "lucide-react";
export default function EmployeeProfile({
  token,
  user,
  onRefreshProfile
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [domain, setDomain] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [avatarColor, setAvatarColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [pin, setPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const handlePinUpdate = async e => {
    e.preventDefault();
    if (!pin || pin.length < 4 || pin.length > 6 || isNaN(Number(pin))) {
      setPinError("PIN must be 4 to 6 digits.");
      return;
    }
    setPinError("");
    setPinSuccess("");
    setPinLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/security/pin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          pin
        })
      });
      const data = await response.json();
      if (data.success) {
        setPinSuccess("PIN updated successfully!");
        setPin("");
        if (onRefreshProfile) onRefreshProfile();
      } else {
        setPinError(data.message || "Failed to update PIN.");
      }
    } catch (err) {
      setPinError("Connection failed.");
    } finally {
      setPinLoading(false);
    }
  };
  const handlePasswordUpdate = async e => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setPwError("");
    setPwSuccess("");
    setPwLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/change-password`, {
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
      const data = await response.json();
      if (data.success) {
        setPwSuccess("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwError(data.message || "Failed to update password.");
      }
    } catch (err) {
      setPwError("Connection failed.");
    } finally {
      setPwLoading(false);
    }
  };
  const colors = [{
    value: "#6366f1",
    label: "Indigo"
  }, {
    value: "#ec4899",
    label: "Pink"
  }, {
    value: "#f59e0b",
    label: "Amber"
  }, {
    value: "#10b981",
    label: "Emerald"
  }, {
    value: "#3b82f6",
    label: "Blue"
  }, {
    value: "#8b5cf6",
    label: "Purple"
  }, {
    value: "#ef4444",
    label: "Red"
  }, {
    value: "#06b6d4",
    label: "Cyan"
  }];
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setLocation(user.location || "");
      setDomain(user.domain || "");
      setBio(user.bio || "");
      setSkills(user.skills ? user.skills.join(", ") : "");
      setAvatarColor(user.avatarColor || "#6366f1");
    }
  }, [user]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          location: location.trim(),
          domain,
          bio: bio.trim(),
          skills,
          avatarColor
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Profile updated successfully!");
        if (onRefreshProfile) onRefreshProfile();
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setError("Connection to backend failed.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="max-w-4xl mx-auto text-left text-slate-100 font-sans space-y-6"> {} <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/60 to-slate-800/80 border border-slate-700/50 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0"> <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none"></div> {} <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-lg relative border-4 border-slate-800/90" style={{
        backgroundColor: avatarColor
      }}> {name ? name.charAt(0).toUpperCase() : "?"} <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></span> </div> {} <div className="text-center sm:text-left flex-1 space-y-1"> <h2 className="text-2xl font-black text-white flex items-center justify-center sm:justify-start space-x-2"> <span>{name || "Employee Profile"}</span> <span className="inline-flex px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-md uppercase tracking-wider"> {domain || "General"} </span> </h2> <p className="text-xs text-slate-400 font-medium flex items-center justify-center sm:justify-start space-x-1.5"> <Mail size={12} className="text-slate-500" /> <span>{user?.email}</span> </p> <p className="text-xs text-slate-500 font-semibold flex items-center justify-center sm:justify-start space-x-1.5"> <Sparkles size={12} className="text-indigo-400" /> <span>Workspace: <strong className="text-slate-300 font-bold">{user?.org || "My Org"}</strong></span> </p> </div> </div> {} <div className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-6 sm:p-8"> {error && <div className="flex items-start space-x-2.5 p-3.5 bg-red-950/40 border border-red-800/50 text-red-300 text-xs font-semibold rounded-xl mb-6"> <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" /> <span>{error}</span> </div>} {success && <div className="flex items-start space-x-2.5 p-3.5 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-semibold rounded-xl mb-6"> <Check size={16} className="flex-shrink-0 mt-0.5 text-emerald-400" /> <span>{success}</span> </div>} <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold text-slate-300"> <div className="grid grid-cols-1 sm:grid-cols-2 gap-5"> {} <div> <label htmlFor="prof-name" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2"> Full Name <span className="text-red-500">*</span> </label> <div className="relative"> <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"> <User size={15} /> </span> <input id="prof-name" type="text" placeholder="Your full name" value={name} onChange={e => {
                setName(e.target.value);
                setError("");
              }} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" /> </div> </div> {} <div> <label htmlFor="prof-phone" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2"> Phone Number </label> <div className="relative"> <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"> <Phone size={15} /> </span> <input id="prof-phone" type="text" placeholder="+1 (555) 123-4567" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" /> </div> </div> {} <div> <label htmlFor="prof-loc" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2"> Location </label> <div className="relative"> <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"> <MapPin size={15} /> </span> <input id="prof-loc" type="text" placeholder="City, Country" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" /> </div> </div> {} <div> <label htmlFor="prof-domain" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2"> Domain / Specialization </label> <div className="relative"> <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"> <Briefcase size={15} /> </span> <select id="prof-domain" value={domain} onChange={e => setDomain(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"> <option value="Frontend">Frontend Development</option> <option value="Backend">Backend Development</option> <option value="Fullstack">Full Stack Engineering</option> <option value="QA / Testing">QA & Testing</option> <option value="UI/UX Design">UI/UX Design</option> <option value="DevOps">DevOps & Infrastructure</option> <option value="Product">Product Management</option> </select> </div> </div> </div> {} <div> <label htmlFor="prof-skills" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2"> Skills (Comma Separated) </label> <div className="relative"> <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"> <Code size={15} /> </span> <input id="prof-skills" type="text" placeholder="React, Node.js, Mongoose, Express, Git" value={skills} onChange={e => setSkills(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" /> </div> {skills && <div className="flex flex-wrap gap-1.5 mt-2.5"> {skills.split(",").map((tag, i) => tag.trim() && <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 font-semibold text-[10px] rounded-lg"> {tag.trim()} </span>)} </div>} </div> {} <div> <label htmlFor="prof-bio" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2"> Short Biography </label> <div className="relative"> <span className="absolute top-3.5 left-3.5 text-slate-500"> <FileText size={15} /> </span> <textarea id="prof-bio" rows={3} placeholder="Share something about yourself, tech stack preferences, or recent project achievements..." value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-sans" /> </div> </div> {} <div> <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3"> Personal Avatar Theme Color </label> <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 max-w-md"> {colors.map(c => <button key={c.value} type="button" onClick={() => setAvatarColor(c.value)} className="w-8 h-8 rounded-full cursor-pointer relative flex items-center justify-center border-2 border-transparent hover:scale-105 active:scale-95 transition-all" style={{
              backgroundColor: c.value
            }} title={c.label}> {avatarColor === c.value && <Check size={14} className="text-white drop-shadow-md font-bold" />} </button>)} </div> </div> {} <div className="pt-4 border-t border-slate-700/80"> <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center space-x-2 shadow-lg shadow-indigo-900/10"> {loading ? <> <Loader2 size={14} className="animate-spin" /> <span>Saving details...</span> </> : <span>Save Profile Changes</span>} </button> </div> </form> </div> {} <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"> {} <div className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-6 sm:p-8 space-y-4"> <div className="flex items-center space-x-2 border-b border-slate-700/50 pb-3"> <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl"> <KeyRound size={16} /> </span> <h3 className="text-sm font-bold text-white">Security PIN</h3> </div> <p className="text-[11px] text-slate-400 leading-relaxed font-semibold"> Change the 4 to 6-digit PIN saved with your employee security settings. </p> {pinError && <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-300 text-[11px] font-bold rounded-xl flex items-center space-x-2"> <AlertCircle size={14} className="text-red-400 flex-shrink-0" /> <span>{pinError}</span> </div>} {pinSuccess && <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-[11px] font-bold rounded-xl flex items-center space-x-2"> <Check size={14} className="text-emerald-400 flex-shrink-0" /> <span>{pinSuccess}</span> </div>} <form onSubmit={handlePinUpdate} className="space-y-4 text-xs font-semibold text-slate-350"> <div> <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5"> New Security PIN </label> <input type="text" pattern="[0-9]*" inputMode="numeric" maxLength={6} placeholder="4-6 digit numeric code" value={pin} onChange={e => setPin(e.target.value.replace(/[^0-9]/g, ""))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" /> </div> <button type="submit" disabled={pinLoading} className="w-full py-2 bg-emerald-650 hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center space-x-2"> {pinLoading ? <Loader2 size={13} className="animate-spin" /> : <span>Update PIN Code</span>} </button> </form> </div> {} <div className="bg-slate-800/60 border border-slate-700/50 rounded-3xl p-6 sm:p-8 space-y-4"> <div className="flex items-center space-x-2 border-b border-slate-700/50 pb-3"> <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl"> <Lock size={16} /> </span> <h3 className="text-sm font-bold text-white">Update Portal Password</h3> </div> <p className="text-[11px] text-slate-400 leading-relaxed font-semibold"> Change your account password. Ensure it has at least 6 characters. </p> {pwError && <div className="p-3 bg-red-950/40 border border-red-800/50 text-red-300 text-[11px] font-bold rounded-xl flex items-center space-x-2"> <AlertCircle size={14} className="text-red-400 flex-shrink-0" /> <span>{pwError}</span> </div>} {pwSuccess && <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-[11px] font-bold rounded-xl flex items-center space-x-2"> <Check size={14} className="text-emerald-400 flex-shrink-0" /> <span>{pwSuccess}</span> </div>} <form onSubmit={handlePasswordUpdate} className="space-y-3 text-xs font-semibold text-slate-350"> <div> <input type="password" placeholder="Current Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" /> </div> <div> <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" /> </div> <div> <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" /> </div> <button type="submit" disabled={pwLoading} className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-750 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center space-x-2"> {pwLoading ? <Loader2 size={13} className="animate-spin" /> : <span>Change Password</span>} </button> </form> </div> </div> </div>;
}

