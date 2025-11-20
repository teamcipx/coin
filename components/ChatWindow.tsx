
import React, { useEffect, useState, useRef } from 'react';
import { auth } from '../firebase';
import { sendMessage, subscribeToChat } from '../services/db';
import { ChatMessage } from '../types';
import { Send, User as UserIcon, ShieldCheck } from 'lucide-react';

interface ChatWindowProps {
  requestId: string;
  isAdminView?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ requestId, isAdminView = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToChat(requestId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    setSending(true);
    try {
      await sendMessage(requestId, {
        requestId,
        senderId: isAdminView ? 'admin' : auth.currentUser.uid,
        senderEmail: auth.currentUser.email || 'Anonymous',
        text: newMessage,
        isAdmin: isAdminView
      });
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-black/20 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="bg-white/5 p-3 border-b border-white/5 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
           <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <h3 className="text-sm font-semibold text-white">Support Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
           <div className="text-center text-slate-500 text-xs mt-10">No messages yet. Ask a question about this order.</div>
        )}
        {messages.map((msg) => {
          const isMe = isAdminView ? msg.isAdmin : (!msg.isAdmin && msg.senderId === auth.currentUser?.uid);
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/5 ${msg.isAdmin ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {msg.isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl p-3 text-sm backdrop-blur-sm shadow-sm ${
                isMe 
                  ? 'bg-emerald-600/80 text-white border border-emerald-500/30' 
                  : msg.isAdmin 
                    ? 'bg-slate-800/80 text-slate-200 border border-white/10'
                    : 'bg-slate-800/80 text-slate-200 border border-white/5'
              }`}>
                <div className="text-[10px] opacity-70 mb-1 flex justify-between gap-4">
                   <span>{msg.isAdmin ? 'Support Agent' : msg.senderEmail.split('@')[0]}</span>
                   <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white/5 p-3 border-t border-white/5 flex gap-2 backdrop-blur-md">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all"
        />
        <button 
          type="submit" 
          disabled={sending || !newMessage.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
