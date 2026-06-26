import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../config";
import { MessageSquare, X, Send, Users, Image as ImageIcon, Loader2, RefreshCw, ChevronDown } from "lucide-react";
const EMPTY_CONTACTS = [];
export default function FloatingChat({
  token,
  user,
  userRole,
  extraContacts = EMPTY_CONTACTS
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);
  const isClient = userRole === "Client";
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowDropdown(false);
  };
  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      if (isClient) {
        const response = await fetch(`${API_BASE_URL}/api/client-share/${token}/dashboard`);
        const data = await response.json();
        if (data.success) {
          const overview = data.data.projectOverview || {};
          const staff = overview.assignedStaff || [];
          const clientContacts = [{
            name: `Company Admin (${overview.org || "Workspace Admin"})`,
            email: overview.companyAdminEmail || "admin@company.com",
            role: "Company Admin",
            type: "Admin",
            avatarColor: "#4f46e5"
          }, ...staff.map((s, index) => ({
            name: typeof s === "object" ? s.name || s.email : `Project Staff ${index + 1}`,
            email: typeof s === "object" ? s.email : s,
            role: typeof s === "object" ? s.role || "Project Staff" : "Project Staff",
            type: "Staff",
            avatarColor: "#6366f1"
          })).filter(c => c.email)];
          setContacts(clientContacts);
          if (!selectedContact && clientContacts.length > 0) {
            setSelectedContact(clientContacts[0]);
          }
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/employee-portal/messages/contacts`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          const merged = [...(data.data || []), ...extraContacts];
          const byEmail = new Map();
          merged.forEach(contact => {
            if (!contact?.email) return;
            const emailKey = contact.email.toLowerCase();
            if (emailKey === user?.email?.toLowerCase()) return;
            if (!byEmail.has(emailKey)) {
              byEmail.set(emailKey, {
                name: contact.name || contact.email,
                email: contact.email,
                role: contact.role || contact.domain || "Employee",
                type: contact.type || "Staff",
                avatarColor: contact.avatarColor || "#6366f1"
              });
            }
          });
          const fetchedContacts = Array.from(byEmail.values());
          setContacts(fetchedContacts);
          const generalContact = {
            name: "General Team Channel",
            email: "all",
            role: "Broadcast",
            type: "General",
            avatarColor: "#818cf8"
          };
          if (!selectedContact) {
            setSelectedContact(generalContact);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load contacts in floating chat:", err);
    } finally {
      setLoadingContacts(false);
    }
  };
  const fetchThread = async (contactEmail, silent = false) => {
    if (!contactEmail) return;
    if (!silent) setLoadingThread(true);
    try {
      if (isClient) {
        const response = await fetch(`${API_BASE_URL}/api/client-share/${token}/messages`);
        const data = await response.json();
        if (data.success) {
          const contactKey = contactEmail.toLowerCase();
          const clientKey = user?.email?.toLowerCase();
          const filtered = data.data.filter(m => {
            const sender = m.sender?.toLowerCase();
            const receiver = m.receiver?.toLowerCase();
            return (sender === clientKey && receiver === contactKey) || (sender === contactKey && receiver === clientKey);
          });
          setMessages(filtered);
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/employee-portal/messages/thread/${contactEmail}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setMessages(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to load thread in floating chat:", err);
    } finally {
      if (!silent) setLoadingThread(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen, userRole, extraContacts]);
  useEffect(() => {
    if (isOpen && selectedContact) {
      fetchThread(selectedContact.email, true);
      pollRef.current = setInterval(() => {
        fetchThread(selectedContact.email, true);
      }, 4000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOpen, selectedContact]);
  const msgCount = messages.length;
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [msgCount, isOpen]);
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleSend = async e => {
    e.preventDefault();
    if (!text.trim() && !imageFile || !selectedContact) return;
    setSending(true);
    const tempText = text;
    setText("");
    try {
      let response;
      if (isClient) {
        response = await fetch(`${API_BASE_URL}/api/client-share/${token}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            receiver: selectedContact.email,
            text: tempText.trim(),
            imageUrl: imagePreview || ""
          })
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/employee-portal/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            receiver: selectedContact.email,
            text: tempText.trim(),
            imageUrl: imagePreview || ""
          })
        });
      }
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setImageFile(null);
        setImagePreview(null);
      } else {
        setText(tempText);
      }
    } catch (err) {
      console.error("Failed to send in floating chat:", err);
      setText(tempText);
    } finally {
      setSending(false);
    }
  };
  return <div className="fixed bottom-6 right-6 z-50 font-sans text-xs"> {} <button onClick={toggleChat} className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:scale-110 active:scale-95 text-white flex items-center justify-center shadow-xl cursor-pointer transition-all duration-200 hover:shadow-indigo-500/20" aria-label="Toggle Messenger"> {isOpen ? <X size={20} /> : <MessageSquare size={20} />} </button> {} {isOpen && <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[460px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"> {} <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0 relative"> <div className="flex items-center space-x-2 flex-grow mr-2"> <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-colors cursor-pointer w-full"> <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-xs shadow-sm" style={{
              backgroundColor: selectedContact?.avatarColor || "#6366f1"
            }}> {selectedContact?.email === "all" ? <Users size={14} /> : selectedContact?.name ? selectedContact.name[0].toUpperCase() : "?"} </div> <div className="truncate flex-grow"> <h4 className="font-extrabold text-slate-800 dark:text-slate-200 leading-tight flex items-center gap-1.5"> <span className="truncate max-w-[140px]">{selectedContact ? selectedContact.name : "Choose Chat..."}</span> <ChevronDown size={12} className={`text-slate-400 transform transition-transform ${showDropdown ? "rotate-180" : ""}`} /> </h4> <p className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest leading-none mt-1"> {selectedContact ? selectedContact.role : "Contacts"} </p> </div> </button> </div> <div className="flex items-center space-x-1 shrink-0"> {selectedContact && <button onClick={() => fetchThread(selectedContact.email)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 cursor-pointer" title="Refresh Thread"> <RefreshCw size={12} /> </button>} </div> {} {showDropdown && <div className="absolute top-16 left-0 right-0 max-h-[300px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto z-20 p-4 space-y-4 text-left"> <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2"> <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Select Contact</span> <button onClick={() => setShowDropdown(false)} className="text-xs text-indigo-500 hover:text-indigo-600 font-extrabold"> Close </button> </div> <div className="space-y-3"> {} {!isClient && <div> <span className="text-[9px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-1">General Channel</span> <button onClick={() => {
                setSelectedContact({
                  name: "General Team Channel",
                  email: "all",
                  role: "Broadcast",
                  type: "General",
                  avatarColor: "#818cf8"
                });
                setShowDropdown(false);
              }} className={`w-full p-2 rounded-xl flex items-center space-x-2.5 text-left font-semibold cursor-pointer transition-all border ${selectedContact?.email === "all" ? "bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400" : "bg-slate-50 dark:bg-slate-850/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-350"}`}> <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400 flex items-center justify-center shrink-0"> <Users size={12} /> </div> <div className="truncate"> <div className="text-xs font-bold">General Team Channel</div> <div className="text-[9px] text-slate-400">Broadcast to all colleagues</div> </div> </button> </div>} {} {contacts.filter(c => c.role !== "Client").length > 0 && <div> <span className="text-[9px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-widest block mb-1.5 mt-2"> {isClient ? "Project Staff" : "Team Members"} </span> <div className="space-y-1.5"> {contacts.filter(c => c.role !== "Client").map(c => <button key={c.email} onClick={() => {
                  setSelectedContact(c);
                  setShowDropdown(false);
                }} className={`w-full p-2 rounded-xl flex items-center space-x-2.5 text-left font-semibold cursor-pointer transition-all border ${selectedContact?.email === c.email ? "bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400" : "bg-slate-50 dark:bg-slate-850/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-350"}`}> <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-[10px]" style={{
                    backgroundColor: c.avatarColor || "#6366f1"
                  }}> {c.name[0].toUpperCase()} </div> <div className="truncate"> <div className="text-xs font-bold truncate max-w-[200px]">{c.name}</div> <div className="text-[9px] text-slate-450 dark:text-slate-400 uppercase tracking-wider">{c.role}</div> </div> </button>)} </div> </div>} {} {!isClient && contacts.filter(c => c.role === "Client").length > 0 && <div> <span className="text-[9px] font-extrabold text-slate-455 dark:text-slate-500 uppercase tracking-widest block mb-1.5 mt-3">Clients</span> <div className="space-y-1.5"> {contacts.filter(c => c.role === "Client").map(c => <button key={c.email} onClick={() => {
                  setSelectedContact(c);
                  setShowDropdown(false);
                }} className={`w-full p-2 rounded-xl flex items-center space-x-2.5 text-left font-semibold cursor-pointer transition-all border ${selectedContact?.email === c.email ? "bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400" : "bg-slate-50 dark:bg-slate-850/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-350"}`}> <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold shrink-0 text-[10px]" style={{
                    backgroundColor: c.avatarColor || "#10b981"
                  }}> {c.name[0].toUpperCase()} </div> <div className="truncate"> <div className="text-xs font-bold truncate max-w-[200px]">{c.name}</div> <div className="text-[9px] text-slate-450 dark:text-slate-450 uppercase tracking-wider">Client</div> </div> </button>)} </div> </div>} </div> </div>} </div> {} <div className="flex-1 flex flex-col min-h-0 bg-slate-50/20 dark:bg-slate-900/10"> {} <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 text-left"> {loadingThread ? <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500"> <Loader2 size={20} className="animate-spin text-indigo-500 mb-1" /> Loading messages... </div> : !selectedContact ? <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-10"> Select a contact from the dropdown to start chatting. </div> : messages.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-555 py-10"> No messages in this chat. </div> : messages.map((m, idx) => {
            const isMe = m.sender?.toLowerCase() === user?.email?.toLowerCase();
            return <div key={idx} className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}> {!isMe && <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 mb-0.5 ml-1"> {m.senderName} </span>} <div className={`p-2.5 rounded-2xl text-[11px] leading-relaxed font-semibold shadow-sm ${isMe ? "bg-indigo-650 text-white rounded-br-none" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-750 rounded-bl-none"}`}> {m.imageUrl && <img src={m.imageUrl} alt="attached" className="max-w-full rounded-lg mb-1 object-cover max-h-32" />} {m.text && <div className="break-words">{m.text}</div>} </div> </div>;
          })} </div> {} {imagePreview && <div className="px-4 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/50 flex items-center gap-2"> <img src={imagePreview} alt="upload" className="h-10 w-10 object-cover rounded-lg" /> <button onClick={() => {
            setImageFile(null);
            setImagePreview(null);
          }} className="text-red-500 hover:text-red-650 cursor-pointer"> <X size={12} /> </button> </div>} {} {selectedContact && <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800 flex items-center gap-2 shrink-0"> <input type="text" placeholder={`Message ${selectedContact.name}...`} value={text} onChange={e => setText(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold" /> <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} /> <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-indigo-500 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer transition-colors" title="Share Image"> <ImageIcon size={13} /> </button> <button type="submit" disabled={sending || !text.trim() && !imageFile} className="p-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg shadow-sm cursor-pointer transition-colors"> {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} </button> </form>} </div> </div>} </div>;
}
