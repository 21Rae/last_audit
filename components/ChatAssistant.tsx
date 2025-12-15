import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { AuditReport } from '../types';
import { chatWithAuditor } from '../services/geminiService';

interface Props {
  report: AuditReport;
}

export const ChatAssistant: React.FC<Props> = ({ report }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'model', text: 'Hi! I analyzed your store. Ask me anything about the results.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Build history for API
      const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const responseText = await chatWithAuditor(report, userMsg, history);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error answering that." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center gap-2"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="font-semibold pr-2">Ask AI Auditor</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 flex flex-col h-[500px] max-h-[80vh] overflow-hidden">
          <div className="bg-brand-600 p-4 flex justify-between items-center text-white">
             <div className="flex items-center gap-2">
               <div className="bg-white/20 p-1.5 rounded-lg">
                 <MessageSquare className="w-4 h-4" />
               </div>
               <span className="font-bold">Audit Assistant</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="hover:bg-brand-700 p-1 rounded">
               <X className="w-5 h-5" />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4" ref={scrollRef}>
             {messages.map((m, idx) => (
               <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                   m.role === 'user' 
                     ? 'bg-brand-600 text-white rounded-br-none' 
                     : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                 }`}>
                   {m.text}
                 </div>
               </div>
             ))}
             {loading && (
               <div className="flex justify-start">
                 <div className="bg-slate-200 rounded-full px-3 py-1 animate-pulse">
                   <span className="text-xs text-slate-500">Typing...</span>
                 </div>
               </div>
             )}
          </div>

          <div className="p-3 bg-white border-t border-slate-200">
             <div className="relative">
               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Type a question..."
                 className="w-full bg-white text-slate-900 pl-4 pr-10 py-2 rounded-full border border-slate-300 focus:outline-none focus:border-brand-500 text-sm"
               />
               <button 
                 onClick={handleSend}
                 disabled={loading}
                 className="absolute right-2 top-1.5 p-1 bg-brand-100 text-brand-600 rounded-full hover:bg-brand-200 disabled:opacity-50"
               >
                 <Send className="w-4 h-4" />
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};