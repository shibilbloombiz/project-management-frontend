import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import { Clock, CheckCircle, Fingerprint, Delete, X, ShieldAlert, Loader2, Play, Square, Award } from "lucide-react";
export default function EmployeeAttendance({
  token,
  user
}) {
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalAction, setTerminalAction] = useState("checkIn");
  const [pin, setPin] = useState("");
  const [scanState, setScanState] = useState("idle");
  const fetchTodayAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/attendance/today`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTodayRecord(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };
  useEffect(() => {
    fetchTodayAttendance();
  }, [token]);
  const handleKeyClick = val => {
    setError("");
    if (val === "clear") {
      setPin("");
    } else if (val === "backspace") {
      setPin(prev => prev.slice(0, -1));
    } else {
      if (pin.length < 6) {
        setPin(prev => prev + val);
      }
    }
  };
  const startBiometricScan = action => {
    setError("");
    setPin("");
    setTerminalAction(action);
    setShowTerminal(true);
    setScanState("scanning");
    setTimeout(() => {
      setScanState("scanned");
    }, 1800);
  };
  const handleMarkPresent = async () => {
    if (pin.length < 4 || pin.length > 6) {
      setError("Please enter a complete 4 to 6-digit PIN.");
      return;
    }
    setError("");
    setLoading(true);

    let coords = null;
    if (navigator.geolocation) {
      try {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            (err) => {
              console.warn("Geolocation warning/error:", err);
              if (err.code === err.PERMISSION_DENIED) {
                reject(new Error("Location permission denied. Please allow GPS access to verify your location."));
              } else {
                reject(new Error(`Failed to retrieve coordinates: ${err.message}`));
              }
            },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        });
      } catch (geoErr) {
        setError(geoErr.message);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          pin,
          action: terminalAction,
          latitude: coords?.latitude,
          longitude: coords?.longitude
        })
      });
      const data = await response.json();
      if (data.success) {
        setTodayRecord(data.data);
        setShowTerminal(false);
        setPin("");
        setScanState("idle");
      } else {
        setError(data.message || "Authentication failed. Incorrect PIN.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to log attendance. Server connection lost.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="max-w-4xl mx-auto text-left text-slate-100 font-sans space-y-6"> {} <div className="flex items-center space-x-2.5 mb-2"> <span className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl shadow-inner"> <Clock size={22} /> </span> <div> <h2 className="text-xl font-bold text-white tracking-tight">Shift Attendance Hub</h2> <p className="text-xs text-slate-400">Secure check-in and check-out tracking powered by virtual biometrics or passcode verification.</p> </div> </div> <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {} <div className="md:col-span-1 space-y-6"> {} <div className="bg-gradient-to-br from-indigo-950/20 to-slate-900/40 border border-slate-800/85 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]"> <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-indigo-550/5 rounded-full blur-2xl pointer-events-none"></div> <div className="space-y-4 z-10"> <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block"> Today's Shift Status </span> {todayRecord ? <div className="space-y-3"> <div className="inline-flex items-center space-x-2 text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm"> <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> <span>Currently Clocked In</span> </div> <div className="text-xs text-slate-400 space-y-1.5"> <p className="flex justify-between border-b border-slate-850 pb-1">Check-in: <strong className="text-slate-200">{todayRecord.checkIn}</strong></p> <p className="flex justify-between border-b border-slate-850 pb-1">Check-out: <strong className="text-slate-200">{todayRecord.checkOut || "Active Session"}</strong></p> </div> </div> : <div className="space-y-2"> <div className="text-slate-400 flex items-center space-x-1.5 text-xs font-bold"> <span className="w-2.5 h-2.5 rounded-full bg-slate-600 animate-pulse"></span> <span>Offline / Shift Closed</span> </div> <p className="text-[10px] text-slate-500 font-semibold leading-relaxed"> Verify your credentials using the control panel scanner to log today's time records. </p> </div>} </div> {} {todayRecord && todayRecord.duration && <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between z-10"> <span className="text-xs text-slate-450 font-medium">Logged Duration</span> <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20 rounded-lg shadow-sm"> {todayRecord.duration} </span> </div>} </div> {} <div className="bg-slate-900/30 border border-slate-800/40 rounded-3xl p-5 space-y-3.5"> <h4 className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">Shift Guidelines</h4> <div className="space-y-2.5 text-[11px] text-slate-450 font-semibold leading-relaxed"> <div className="flex items-start space-x-2"> <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span> <p>Verify your credentials on check-in and check-out to calculate duration accurately.</p> </div> <div className="flex items-start space-x-2"> <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span> <p>Support requests can be opened directly with company leads in the chat portal.</p> </div> </div> </div> </div> {} <div className="md:col-span-2 bg-gradient-to-br from-slate-900/40 to-slate-950/60 border border-slate-800/85 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden"> <div className="space-y-1.5"> <h3 className="text-base font-extrabold text-white">Attendance Terminal Console</h3> <p className="text-xs text-slate-400 leading-relaxed font-semibold"> Scan your virtual biometric credentials using our digital nodes below to update your status. </p> </div> {} <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {} <button onClick={() => startBiometricScan("checkIn")} disabled={!!todayRecord} className={`p-6 border rounded-2xl flex flex-col items-center justify-center space-y-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${todayRecord ? "bg-slate-900/20 border-slate-850/80 text-slate-600 opacity-50 cursor-not-allowed" : "bg-indigo-605/10 hover:bg-indigo-600/20 border-indigo-500/20 hover:border-indigo-500/45 text-indigo-400 hover:text-indigo-300 shadow-lg shadow-indigo-950/10"}`}> <span className={`p-4 rounded-full ${todayRecord ? "bg-slate-900" : "bg-indigo-500/10"}`}> <Play size={22} className={todayRecord ? "text-slate-700" : "text-indigo-400"} /> </span> <div> <h4 className="text-xs font-bold text-slate-200">Start Daily Shift</h4> <p className="text-[9px] text-slate-450 mt-1 font-semibold">Clock in for check-in records</p> </div> </button> {} <button onClick={() => startBiometricScan("checkOut")} disabled={!todayRecord || !!todayRecord.checkOut} className={`p-6 border rounded-2xl flex flex-col items-center justify-center space-y-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${!todayRecord || todayRecord.checkOut ? "bg-slate-900/20 border-slate-850/80 text-slate-600 opacity-50 cursor-not-allowed" : "bg-emerald-650/10 hover:bg-emerald-650/20 border-emerald-500/20 hover:border-emerald-500/45 text-emerald-450 hover:text-emerald-350 shadow-lg shadow-emerald-950/10"}`}> <span className={`p-4 rounded-full ${!todayRecord || todayRecord.checkOut ? "bg-slate-900" : "bg-emerald-500/10"}`}> <Square size={22} className={!todayRecord || todayRecord.checkOut ? "text-slate-700" : "text-emerald-400"} /> </span> <div> <h4 className="text-xs font-bold text-slate-200">End Shift Session</h4> <p className="text-[9px] text-slate-450 mt-1 font-semibold">Mark check-out & compute duration</p> </div> </button> </div> {} {user?.hasAttendancePin && <div className="flex justify-center mt-1"> <button onClick={() => {
            setError("");
            setPin("");
            setTerminalAction(todayRecord ? "checkOut" : "checkIn");
            setShowTerminal(true);
            setScanState("scanned");
          }} className="w-full py-2.5 bg-indigo-500/5 hover:bg-indigo-500/15 border border-indigo-500/15 hover:border-indigo-500/35 text-xs font-bold text-indigo-400 hover:text-indigo-300 rounded-2xl cursor-pointer transition-all duration-300 shadow-md"> <span>Authorize with PIN Passcode</span> </button> </div>} <div className="p-4 bg-slate-900/40 border border-slate-800/45 rounded-2xl flex items-center space-x-3 text-[11px] text-slate-450 leading-relaxed font-semibold"> <span className="p-2 bg-indigo-500/10 text-indigo-455 border border-indigo-500/15 rounded-xl flex-shrink-0"> <Award size={14} /> </span> <p>Biometric authentication runs inside a secured localized sandbox node, updating your status in real-time.</p> </div> </div> </div> {} {showTerminal && <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 transition-all"> <div className="w-full max-w-sm bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden relative flex flex-col"> {} <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between"> <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider"> {terminalAction === "checkIn" ? "Check-In Verification" : "Check-Out Verification"} </h3> <button onClick={() => {
            setShowTerminal(false);
            setScanState("idle");
            setPin("");
          }} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-all"> <X size={16} /> </button> </div> {} {error && <div className="px-5 py-3 bg-red-950/30 border-b border-red-900/30 text-red-300 text-[11px] font-bold flex items-center space-x-2"> <ShieldAlert size={14} className="text-red-400 flex-shrink-0" /> <span>{error}</span> </div>} {} {scanState === "scanning" ? <div className="p-10 flex flex-col items-center justify-center space-y-6"> <div className="relative"> <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div> <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/35 rounded-full flex items-center justify-center text-indigo-400 relative"> <Fingerprint size={38} className="animate-pulse" /> </div> </div> <div className="text-center space-y-1.5"> <p className="text-xs font-bold text-slate-200">Scanning Biometric Node...</p> <p className="text-[10px] text-slate-500 font-semibold animate-pulse">Position finger on scanner overlay</p> </div> </div> : <div className="p-6 space-y-5"> <div className="text-center space-y-2"> <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Enter Verification PIN</p> {} <div className="flex justify-center space-x-2.5 py-1"> {[...Array(6)].map((_, i) => <div key={i} className={`w-3 h-3 rounded-full border border-slate-700 transition-all duration-200 ${pin.length > i ? "bg-indigo-500 border-indigo-400 shadow-md shadow-indigo-500/35 scale-110" : "bg-slate-950"}`}></div>)} </div> </div> {} <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto py-1"> {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => <button key={num} type="button" onClick={() => handleKeyClick(num)} className="w-12 h-12 bg-slate-950/60 hover:bg-slate-800 active:bg-slate-750 border border-slate-800/40 rounded-full font-bold text-base text-white cursor-pointer transition-all flex items-center justify-center mx-auto"> {num} </button>)} <button type="button" onClick={() => handleKeyClick("clear")} className="w-12 h-12 bg-slate-955 hover:bg-red-950/20 border border-transparent rounded-full font-bold text-[9px] text-red-400 hover:text-red-300 cursor-pointer transition-all flex items-center justify-center mx-auto uppercase tracking-wider"> Clear </button> <button type="button" onClick={() => handleKeyClick(0)} className="w-12 h-12 bg-slate-955 hover:bg-slate-800 active:bg-slate-750 border border-slate-800/40 rounded-full font-bold text-base text-white cursor-pointer transition-all flex items-center justify-center mx-auto"> 0 </button> <button type="button" onClick={() => handleKeyClick("backspace")} className="w-12 h-12 bg-slate-955 hover:bg-slate-800 border border-transparent rounded-full font-bold text-slate-400 hover:text-white cursor-pointer transition-all flex items-center justify-center mx-auto"> <Delete size={15} /> </button> </div> <div className="pt-3 border-t border-slate-800/80"> <button onClick={handleMarkPresent} disabled={loading || pin.length < 4 || pin.length > 6} className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:opacity-50 text-white disabled:text-slate-500 font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-lg shadow-indigo-900/10 flex items-center justify-center space-x-2"> {loading ? <> <Loader2 size={13} className="animate-spin" /> <span>Verifying Security Keys...</span> </> : <span>Authenticate Code</span>} </button> </div> </div>} </div> </div>} </div>;
}
