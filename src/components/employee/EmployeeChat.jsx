import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../../config";
import { Send, MessageSquare, Loader2, Sparkles, Search, Users, AlertCircle, RefreshCw, Image as ImageIcon, X } from "lucide-react";
export default function EmployeeChat({
  token,
  user
}) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const fileRef = useRef(null);
  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/messages/contacts`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
        const generalChan = {
          name: "General Team Channel",
          email: "all",
          role: "Broadcast",
          type: "Broadcast",
          avatarColor: "#8b5cf6"
        };
        setSelectedContact(generalChan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContacts(false);
    }
  };
  const fetchThread = async (contactEmail, silent = false) => {
    if (!silent) setLoadingThread(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/messages/thread/${contactEmail}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("Failed to load thread:", err);
    } finally {
      if (!silent) setLoadingThread(false);
    }
  };
  useEffect(() => {
    fetchContacts();
  }, [token]);
  useEffect(() => {
    if (selectedContact) {
      fetchThread(selectedContact.email);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        fetchThread(selectedContact.email, true);
      }, 4000);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedContact]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleSendMessage = async e => {
    e.preventDefault();
    if (!text.trim() && !imageFile || !selectedContact) return;
    setSending(true);
    setError("");
    const originalText = text;
    setText("");
    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = imagePreview;
      }
      const response = await fetch(`${API_BASE_URL}/api/employee-portal/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver: selectedContact.email,
          text: originalText.trim(),
          imageUrl
        })
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setImageFile(null);
        setImagePreview(null);
      } else {
        setError(data.message || "Failed to send message.");
        setText(originalText);
      }
    } catch (err) {
      console.error(err);
      setError("Connection to backend server lost.");
      setText(originalText);
    } finally {
      setSending(false);
    }
  };
  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()) || c.email.toLowerCase().includes(searchText.toLowerCase()));
  const generalChan = {
    name: "General Team Channel",
    email: "all",
    role: "Broadcast",
    type: "Broadcast",
    avatarColor: "#8b5cf6"
  };
  return <div className="text-left text-slate-100 font-sans h-[650px] flex flex-col"> {} <div className="flex items-center space-x-2.5 mb-5 flex-shrink-0"> <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl"> <MessageSquare size={24} /> </span> <div> <h2 className="text-xl font-bold text-white">Direct Messenger</h2> <p className="text-xs text-slate-400">Connect directly with Project Leads, Company Admins, and Clients.</p> </div> </div> <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0"> {} <div className="lg:col-span-4 bg-slate-800/60 border border-slate-700/50 rounded-3xl p-4 flex flex-col min-h-0 space-y-4"> {} <div className="relative"> <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"> <Search size={15} /> </span> <input type="text" placeholder="Search contacts..." value={searchText} onChange={e => setSearchText(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-semibold" /> </div> {} <div className="flex-1 overflow-y-auto space-y-2.5 pr-1"> <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block ml-1 mb-1"> General Chat </span> {} <button onClick={() => setSelectedContact(generalChan)} className={`w-full p-3 border rounded-xl flex items-center space-x-3 cursor-pointer transition-all hover:bg-slate-750/30 ${selectedContact && selectedContact.email === "all" ? "bg-slate-800 border-indigo-500/50 text-white" : "bg-slate-850/40 border-slate-700/40 text-slate-400"}`}> <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold"> <Users size={16} /> </div> <div className="flex flex-col text-left space-y-0.5"> <span className="text-xs font-bold text-slate-200">General Channel</span> <span className="text-[9px] font-semibold text-slate-500">Broadcasting Messages</span> </div> </button> <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block ml-1 mt-3 mb-1"> Direct Messages </span> {loadingContacts ? <div className="flex justify-center py-6"> <Loader2 size={18} className="text-indigo-500 animate-spin" /> </div> : filteredContacts.length === 0 ? <p className="text-[10px] text-slate-500 font-semibold pl-1.5 py-2">No other contacts found.</p> : filteredContacts.map(c => {
            const isSelected = selectedContact && selectedContact.email === c.email;
            return <button key={c.email} onClick={() => setSelectedContact(c)} className={`w-full p-3 border rounded-xl flex items-center space-x-3 cursor-pointer transition-all hover:bg-slate-750/30 ${isSelected ? "bg-slate-800 border-indigo-500/50 text-white" : "bg-slate-850/40 border-slate-700/40 text-slate-400"}`}> <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{
                backgroundColor: c.avatarColor || "#10b981"
              }}> {c.name.charAt(0).toUpperCase()} </div> <div className="flex flex-col text-left space-y-0.5 min-w-0 flex-1"> <span className="text-xs font-bold text-slate-200 truncate">{c.name}</span> <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest truncate">{c.role}</span> </div> </button>;
          })} </div> </div> {} <div className="lg:col-span-8 bg-slate-800/60 border border-slate-700/50 rounded-3xl flex flex-col min-h-0 relative overflow-hidden"> {} {selectedContact && <div className="px-6 py-4 bg-slate-850/40 border-b border-slate-700/50 flex items-center justify-between flex-shrink-0"> <div className="flex items-center space-x-3"> <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{
              backgroundColor: selectedContact.avatarColor
            }}> {selectedContact.name.charAt(0).toUpperCase()} </div> <div className="flex flex-col"> <h3 className="text-xs font-bold text-white leading-tight">{selectedContact.name}</h3> <p className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">{selectedContact.role}</p> </div> </div> <button onClick={() => fetchThread(selectedContact.email)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-colors" title="Refresh messages"> <RefreshCw size={14} /> </button> </div>} {} {error && <div className="px-6 py-2.5 bg-red-950/20 text-red-300 text-[10px] font-semibold flex items-center space-x-2 flex-shrink-0"> <AlertCircle size={12} className="text-red-400 flex-shrink-0" /> <span>{error}</span> </div>} {} <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0"> {loadingThread ? <div className="flex flex-col items-center justify-center h-full space-y-2"> <Loader2 size={24} className="text-indigo-500 animate-spin" /> <p className="text-[10px] text-slate-500 font-semibold">Retrieving thread...</p> </div> : messages.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center space-y-2"> <span className="p-3 bg-slate-750/30 border border-slate-700/50 rounded-full text-slate-500"> <MessageSquare size={20} /> </span> <p className="text-[11px] text-slate-500 font-semibold">No messages in this conversation yet.</p> </div> : messages.map((m, idx) => {
            const isMe = m.sender.toLowerCase() === user.email.toLowerCase();
            return <div key={m._id || m.id || idx} className={`flex flex-col max-w-[75%] space-y-1 ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}> {!isMe && <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest ml-1"> {m.senderName} </span>} <div className={`p-3 text-xs leading-relaxed font-semibold rounded-2xl ${isMe ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-950/10" : "bg-slate-900 text-slate-200 rounded-bl-none border border-slate-800"}`}> {m.imageUrl && <img src={m.imageUrl} alt="shared" className="rounded-xl max-w-full mb-1.5 max-h-40 object-cover" />} {m.text && <span>{m.text}</span>} </div> </div>;
          })} <div ref={messagesEndRef} /> </div> {} {imagePreview && <div className="px-6 py-2 bg-slate-850/40 border-t border-slate-700/50 flex items-center gap-2"> <img src={imagePreview} alt="preview" className="h-14 w-14 object-cover rounded-lg border border-slate-600" /> <button type="button" onClick={() => {
            setImageFile(null);
            setImagePreview(null);
          }} className="text-red-400 hover:text-red-500 cursor-pointer"> <X size={14} /> </button> </div>} {} <form onSubmit={handleSendMessage} className="p-4 bg-slate-850/40 border-t border-slate-700/50 flex items-center space-x-3 flex-shrink-0"> <input type="text" placeholder={selectedContact?.email === "all" ? "Send team broadcast..." : `Type direct message...`} value={text} onChange={e => setText(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-semibold" /> <input type="file" accept="image/*" ref={fileRef} onChange={handleImageChange} className="hidden" /> <button type="button" onClick={() => fileRef.current?.click()} className="p-2.5 text-slate-400 hover:text-indigo-400 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer transition-colors" title="Share image"> <ImageIcon size={15} /> </button> <button type="submit" disabled={sending || !text.trim() && !imageFile || !selectedContact} className="p-2.5 bg-indigo-600 hover:bg-indigo-550 disabled:opacity-50 text-white rounded-xl cursor-pointer transition-colors shadow-md shadow-indigo-950/10 flex items-center justify-center"> {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} </button> </form> </div> </div> </div>;
}
