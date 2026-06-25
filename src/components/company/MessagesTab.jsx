import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, RefreshCw, User } from 'lucide-react';

export default function MessagesTab({ messages, onSendMessage, userEmail, org, employees = [], clients = [] }) {
  const [selectedRecipient, setSelectedRecipient] = useState('all');
  const [text, setText] = useState('');
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat when messages reload or selection changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedRecipient]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text, selectedRecipient);
    setText('');
  };

  // Filter messages based on selectedRecipient
  const filteredMessages = messages.filter(msg => {
    const msgReceiver = msg.receiver || 'all';
    const msgSender = msg.sender || '';
    if (selectedRecipient === 'all') {
      return msgReceiver === 'all';
    } else {
      // Show messages between userEmail and selectedRecipient
      return (msgSender.toLowerCase() === userEmail.toLowerCase() && msgReceiver.toLowerCase() === selectedRecipient.toLowerCase()) ||
             (msgSender.toLowerCase() === selectedRecipient.toLowerCase() && msgReceiver.toLowerCase() === userEmail.toLowerCase());
    }
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[520px] text-left">
      
      {/* Chat header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
            <MessageSquare size={16} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold font-display text-slate-800 dark:text-slate-200">Company Collaboration Thread</h4>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              {org} Workspace Network Active
            </span>
          </div>
        </div>

        {/* Dropdown to change selected contact/room */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Chat Recipient:</span>
          <select
            value={selectedRecipient}
            onChange={(e) => setSelectedRecipient(e.target.value)}
            className="bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-805 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <option value="all">All Staff (Broadcast)</option>
            {employees.length > 0 && (
              <optgroup label="Employees">
                {employees.map(emp => (
                  <option key={emp.email} value={emp.email}>{emp.name} ({emp.email})</option>
                ))}
              </optgroup>
            )}
            {clients.length > 0 && (
              <optgroup label="Clients">
                {clients.map(cli => (
                  <option key={cli.email} value={cli.email}>{cli.name} ({cli.email})</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Chat Messages Panel */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
        {filteredMessages.map((msg, index) => {
          const isMe = msg.sender.toLowerCase() === userEmail.toLowerCase();
          return (
            <div 
              key={msg._id || index}
              className={`flex items-end space-x-2.5 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'}`}
            >
              {/* Profile letter placeholder */}
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300/40 dark:border-slate-700 text-slate-650 dark:text-slate-300 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                {msg.senderName ? msg.senderName[0] : <User size={10} />}
              </div>

              {/* Chat bubble body */}
              <div className="space-y-1">
                {!isMe && (
                  <span className="text-[9px] font-extrabold text-slate-450 dark:text-slate-500 block px-1">
                    {msg.senderName} ({msg.sender.split('@')[0]})
                  </span>
                )}
                <div 
                  className={`p-3 rounded-2xl shadow-sm text-xs font-semibold leading-relaxed ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800/80 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        {filteredMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-10">
            <span className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-400 dark:text-slate-500">
              <MessageSquare size={20} />
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">No messages in this chat thread yet.</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat input form */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
        <input
          type="text"
          placeholder={selectedRecipient === 'all' ? "Broadcast team message..." : "Type direct message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
        />
        <button
          type="submit"
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer transition-colors"
          aria-label="Send message"
        >
          <Send size={14} />
        </button>
      </form>

    </div>
  );
}
