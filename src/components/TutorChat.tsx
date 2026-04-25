import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getTutorResponse } from '../lib/gemini';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Send, Bot, User, Sparkles, Loader2, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
}

export function TutorChat() {
  const { user, userConcepts, profile } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // We'll use a single "current" session for simplicity in MVP
    const messagesRef = collection(db, 'users', user.uid, 'sessions', 'current', 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !user || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      const messagesRef = collection(db, 'users', user.uid, 'sessions', 'current', 'messages');
      await addDoc(messagesRef, {
        role: 'user',
        content: userMsg,
        timestamp: serverTimestamp()
      });

      // Simple heuristic for "Next Concept" detection or learning state
      const response = await getTutorResponse(
        messages.slice(-10).map(m => ({ role: m.role, parts: [{ text: m.content }] })),
        userMsg,
        { concepts: userConcepts, profile }
      );

      await addDoc(messagesRef, {
        role: 'assistant',
        content: response,
        timestamp: serverTimestamp()
      });

      // Adaptively update knowledge state (Simulated for MVP, would normally be parsed from LLM response)
      // If user confirms understanding, we increment mastery a bit
      if (userMsg.toLowerCase().includes('understood') || userMsg.toLowerCase().includes('i see')) {
         // Logic to find current concept and boost it
      }

    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] pt-24 pb-6 px-6 bg-slate-950">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Left Side: Chat Interface */}
        <div className="lg:col-span-2 bento-card flex flex-col overflow-hidden bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                  <Brain size={20} />
               </div>
               <div>
                 <h2 className="text-lg font-bold text-white leading-none">Socratic Copilot</h2>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Adaptive session active</p>
               </div>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-full border border-slate-800 text-[10px] font-bold text-emerald-400">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               SYSTEM ONLINE
             </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 px-2 scrollbar-hide py-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-3xl">
                   <p className="text-sm font-semibold text-indigo-400">
                     "Explain how container networking works in your own words. Why would we use a CNI?"
                   </p>
                </div>
                <p className="text-slate-500 text-xs font-medium max-w-[280px]">
                  I use Socratic questioning to detect shallow understanding. Let's start with the basics.
                </p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-start gap-4 transition-all",
                    msg.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-slate-700 shadow-sm transition-all",
                    msg.role === 'user' ? "bg-slate-800 text-slate-400" : "bg-indigo-600 text-white"
                  )}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed border transition-all",
                    msg.role === 'user' 
                      ? "bg-indigo-600 border-indigo-500 text-white rounded-tr-none shadow-xl shadow-indigo-500/10" 
                      : "bg-slate-800 border-slate-700 text-slate-100 rounded-tl-none"
                  )}>
                    <div className="prose prose-invert prose-sm whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white border border-indigo-500">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-indigo-400" />
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSend} className="mt-4 flex items-center bg-slate-950 rounded-2xl p-2 border border-slate-800 group focus-within:border-indigo-500 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Explain yourself..."
              className="bg-transparent text-sm w-full px-4 outline-none text-white placeholder:text-slate-700 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-700 transition-all shadow-lg"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Right Side: Adaptive Context Panel */}
        <div className="hidden lg:flex flex-col gap-6">
          <motion.div variants={itemVariants} className="bento-card bg-slate-900 flex-grow flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Cognitive Context</h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Current State</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Flow Detected</span>
                  <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold">OPTIMAL</div>
                </div>
              </div>
              
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Hesitation Pattern</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-amber-500">3.2s</span>
                  <span className="text-[10px] text-slate-600 font-mono italic">avg on networking</span>
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl">
                 <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-amber-500" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter">Confusion Guard</span>
                 </div>
                 <p className="text-xs text-slate-300 leading-normal">
                   You're mixing OSI Layer 3 and 4 here. Let's look at the routing table inside a pod specifically.
                 </p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-800">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Roadmap Dependency</h4>
               <div className="flex gap-2">
                  <div className="flex-1 h-1 bg-indigo-600 rounded-full"></div>
                  <div className="flex-1 h-1 bg-indigo-600 rounded-full"></div>
                  <div className="flex-1 h-1 bg-slate-800 rounded-full"></div>
                  <div className="flex-1 h-1 bg-slate-800 rounded-full"></div>
               </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
