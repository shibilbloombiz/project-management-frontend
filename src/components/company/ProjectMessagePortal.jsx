import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import { Send, Image, X, Users, MessageSquare } from 'lucide-react';

const BASE = API_BASE_URL;

export default function ProjectMessagePortal({ token, userEmail, senderName, companyId }) {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

  // Load contacts
  useEffect(() => {
    fetch(`${BASE}/api/messages`, { headers })
      .then(r => r.json())
      .then(res => {
        if (!res.success) return;
        // derive unique contacts from existing messages
        const emails = new Set();
        const list = [];
        res.data.forEach(m => {
          if (m.sender !== userEmail && !emails.has(m.sender)) {
            emails.add(m.sender);
            list.push({ email: m.sender, name: m.senderName || m.sender, type: 'Staff' });
          }
          if (m.receiver !== userEmail && m.receiver !== 'all' && !emails.has(m.receiver)) {
            emails.add(m.receiver);
            list.push({ email: m.receiver, name: m.receiver, type: 'Contact' });
          }
        });
        // Always include 'all' broadcast
        setContacts([{ email: 'all', name: 'All Staff (Broadcast)', type: 'Broadcast' }, ...list]);
      })
      .catch(err => console.error(err));
  }, []);

  // Load thread when contact selected
  useEffect(() => {
    if (!selectedContact) return;
    loadThread();
    const interval = setInterval(loadThread, 5000);
    return () => clearInterval(interval);
  }, [selectedContact]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadThread = () => {
    fetch(`${BASE}/api/messages`, { headers })
      .then(r => r.json())
      .then(res => {
        if (!res.success) return;
        const filtered = selectedContact.email === 'all'
          ? res.data.filter(m => m.receiver === 'all')
          : res.data.filter(m =>
            (m.sender === userEmail && m.receiver === selectedContact.email) ||
            (m.sender === selectedContact.email && m.receiver === userEmail)
          );
        setMessages(filtered);
      })
      .catch(err => console.error(err));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!selectedContact || (!text.trim() && !imageFile)) return;
    setSending(true);
    try {
      let imageUrl = '';
      // If image selected, encode as base64 data URL and store in message
      if (imageFile) {
        imageUrl = imagePreview;
      }
      await fetch(`${BASE}/api/messages`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: userEmail,
          senderName,
          receiver: selectedContact.email,
          text: text.trim(),
          imageUrl
        })
      });
      setText('');
      setImageFile(null);
      setImagePreview(null);
      loadThread();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ height: '480px' }}>
      {/* Header */}
      <div className="flex items-center border-b border-slate-100 p-4 gap-3">
        <MessageSquare size={15} className="text-indigo-500 shrink-0" />
        <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Message Portal</span>
        <span className="text-[10px] text-slate-400 font-medium ml-auto">Message employees & clients</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Contact List */}
        <div className="w-40 border-r border-slate-100 overflow-y-auto shrink-0">
          {contacts.map(c => (
            <button
              key={c.email}
              onClick={() => setSelectedContact(c)}
              className={`w-full text-left px-3 py-2.5 text-xs font-semibold border-b border-slate-50 transition-colors ${
                selectedContact?.email === c.email
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0 ${c.email === 'all' ? 'bg-indigo-500' : 'bg-purple-500'}`}>
                  {c.email === 'all' ? <Users size={10} /> : c.name[0].toUpperCase()}
                </div>
                <span className="truncate">{c.name}</span>
              </div>
            </button>
          ))}
          {contacts.length === 0 && (
            <p className="text-[10px] text-slate-400 p-3 font-medium">No contacts yet</p>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedContact ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-semibold">
              Select a contact to message
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((m, i) => {
                  const isMe = m.sender === userEmail;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                        {!isMe && <p className="text-[10px] font-extrabold mb-1 opacity-70">{m.senderName || m.sender}</p>}
                        {m.imageUrl && (
                          <img src={m.imageUrl} alt="shared" className="rounded-xl max-w-full mb-1.5 max-h-40 object-cover" />
                        )}
                        {m.text && <p className="leading-relaxed">{m.text}</p>}
                        <p className={`text-[9px] mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <p className="text-center text-slate-400 text-xs py-6 font-medium">No messages yet. Start the conversation!</p>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="px-3 pb-1 flex items-center gap-2">
                  <img src={imagePreview} alt="preview" className="h-14 w-14 object-cover rounded-lg border border-slate-200" />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-red-500 hover:text-red-700 cursor-pointer"><X size={14} /></button>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-slate-100 p-3 flex gap-2 items-center">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={`Message ${selectedContact.name}...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input type="file" accept="image/*" ref={fileRef} onChange={handleImageChange} className="hidden" />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 cursor-pointer transition-colors"
                  title="Share image"
                >
                  <Image size={14} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || (!text.trim() && !imageFile)}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl cursor-pointer transition-colors shadow-sm shadow-indigo-100"
                >
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
