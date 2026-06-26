import React, { useRef, useEffect, useState } from 'react';
import { MessageSquare, Send, Loader2, Image as ImageIcon, X } from 'lucide-react';

export default function ClientMessagesPanel({
  messages,
  contacts,
  selectedContact,
  setSelectedContact,
  messageText,
  setMessageText,
  sending,
  onSendMessage,
  clientEmail
}) {
  const chatContainerRef = useRef(null);
  const fileRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const activeContact = contacts.find(c => c.id === selectedContact) || contacts[0];

  const activeEmail = activeContact?.email?.toLowerCase();
  const clientEmailKey = clientEmail?.toLowerCase();
  const filteredMessages = messages.filter((m) => {
    const sender = m.sender?.toLowerCase();
    const receiver = m.receiver?.toLowerCase();
    return (
      (sender === clientEmailKey && receiver === activeEmail) ||
      (sender === activeEmail && receiver === clientEmailKey)
    );
  });

  const msgCount = filteredMessages.length;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [msgCount, selectedContact]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!messageText.trim() && !imagePreview) || !activeContact) return;
    onSendMessage(activeContact.email, messageText.trim(), imagePreview || '');
    setMessageText('');
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col h-[480px]">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2 shrink-0 text-left">
        <MessageSquare size={14} className="text-indigo-500" />
        <span className="font-extrabold text-slate-800 uppercase tracking-wider text-xs">Employee & Admin Chat</span>
      </div>

      {/* Info banner */}
      <div className="px-4 py-2 bg-indigo-50 border-b border-slate-100 text-[10px] text-indigo-700 font-bold flex items-center gap-1.5 leading-relaxed shrink-0 text-left">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
        <span>Employee Chat: You can chat directly with assigned project employees and the company admin.</span>
      </div>

      {/* Contact tabs */}
      <div className="flex bg-slate-50 border-b border-slate-100 p-2 gap-2 shrink-0 overflow-x-auto">
        {contacts.map(c => (
          <button
            type="button"
            key={c.id}
            onClick={() => setSelectedContact(c.id)}
            className={`min-w-[110px] flex-1 py-1.5 px-2 rounded-lg font-bold text-[10px] text-center border transition-all cursor-pointer truncate ${
              selectedContact === c.id 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {c.name.split(' ')[0]} {c.name.includes('Admin') ? 'Admin' : 'Specialist'}
          </button>
        ))}
      </div>

      {/* Message logs */}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50/20 text-xs font-semibold leading-relaxed">
        {filteredMessages.length === 0 ? (
          <div className="py-24 text-center text-slate-400 font-semibold">
            <MessageSquare size={22} className="mx-auto text-slate-350 mb-2" />
            <p>No messages in this workspace thread.</p>
          </div>
        ) : (
          filteredMessages.map((m, i) => {
            const isMe = m.sender?.toLowerCase() === clientEmail?.toLowerCase();
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end text-right' : 'justify-start text-left'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-sm text-left ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-slate-250 text-slate-800 rounded-bl-sm border border-slate-300/40'
                }`}>
                  {!isMe && (
                    <span className="text-[8.5px] block text-indigo-650 font-extrabold mb-0.5">
                      {m.senderName}
                    </span>
                  )}
                  {m.imageUrl && (
                    <img 
                      src={m.imageUrl} 
                      alt="shared" 
                      className="rounded-xl max-w-full mb-1.5 max-h-40 object-cover cursor-pointer" 
                      onClick={() => window.open(m.imageUrl, '_blank')} 
                    />
                  )}
                  {m.text && <p className="break-words">{m.text}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0 text-left">
          <div className="flex items-center gap-2">
            <img src={imagePreview} alt="preview" className="h-10 w-10 object-cover rounded-lg border border-slate-200" />
            <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[150px]">{imageFile?.name || 'Attached image'}</span>
          </div>
          <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-red-500 hover:text-red-655 cursor-pointer">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 flex gap-2 items-center shrink-0">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileRef} 
          onChange={handleImageChange} 
          className="hidden" 
        />
        <input
          type="text"
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          placeholder={activeContact ? `Message ${activeContact.name}...` : "Select a contact..."}
          className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold outline-none focus:ring-1 focus:ring-indigo-400 text-xs text-slate-700"
          required={!imagePreview}
          disabled={!activeContact || sending}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-colors shrink-0"
          title="Attach image"
          disabled={!activeContact || sending}
        >
          <ImageIcon size={13} />
        </button>
        <button
          type="submit"
          disabled={sending || !activeContact || (!messageText.trim() && !imagePreview)}
          className="p-2 bg-indigo-650 text-white hover:bg-indigo-600 disabled:bg-slate-300 rounded-xl shadow cursor-pointer transition flex-shrink-0"
        >
          {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        </button>
      </form>
    </div>
  );
}
