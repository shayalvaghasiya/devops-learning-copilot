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
    if (!user) {
      // Load from localStorage for guest
      const saved = localStorage.getItem('guest_messages');
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse guest messages', e);
        }
      }
      return;
    }

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
    if (!user && messages.length > 0) {
      localStorage.setItem('guest_messages', JSON.stringify(messages));
    }
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, user]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userMsg,
        timestamp: new Date()
      };

      if (user) {
        const messagesRef = collection(db, 'users', user.uid, 'sessions', 'current', 'messages');
        await addDoc(messagesRef, {
          role: 'user',
          content: userMsg,
          timestamp: serverTimestamp()
        });
      } else {
        setMessages(prev => [...prev, newMessage]);
      }

      // Prepare history for Gemini
      const chatHistory = messages.slice(-10).map(m => ({ 
        role: m.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: m.content }] 
      }));

      const response = await getTutorResponse(
        chatHistory,
        userMsg,
        { concepts: userConcepts, profile }
      );

      const tutorResponse = response;

      if (user) {
        const messagesRef = collection(db, 'users', user.uid, 'sessions', 'current', 'messages');
        await addDoc(messagesRef, {
          role: 'assistant',
          content: tutorResponse,
          timestamp: serverTimestamp()
        });
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: tutorResponse,
          timestamp: new Date()
        }]);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = "The Cognitive Engine encountered an unexpected error. Please try again.";
      
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "The Cognitive Engine is currently under high demand. Neural pathways are saturated. Please wait a moment for resources to stabilize before continuing.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `⚠️ [SYSTEM ERROR] ${errorMessage}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] pt-24 pb-6 px-6 bg-zinc-950">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Left Side: Chat Interface */}
        <div className="lg:col-span-2 bento-card flex flex-col overflow-hidden bg-zinc-900 border-zinc-800">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white shadow-xl shadow-cyan-500/20">
                  <Brain size={20} />
               </div>
               <div>
                 <h2 className="text-lg font-bold text-white leading-none uppercase tracking-tighter">Socratic Copilot</h2>
                 <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">session active : v2.0</p>
               </div>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 rounded-md border border-zinc-800 text-[10px] font-black text-cyan-400">
               <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
               SYSTEM ONLINE
             </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 px-2 scrollbar-hide py-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                <div className="p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-1">
                     <Sparkles size={12} className="text-cyan-500/30" />
                   </div>
                   <p className="text-sm font-bold text-cyan-400 leading-relaxed uppercase tracking-tight">
                     "Explain container networking in your own words. Why would we use a CNI?"
                   </p>
                </div>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest max-w-[280px]">
                  Detecting cognitive boundaries through Socratic elicitation.
                </p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-start gap-4 transition-all",
                    msg.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-zinc-700 shadow-sm transition-all",
                    msg.role === 'user' ? "bg-zinc-800 text-zinc-500" : "bg-cyan-600 text-white"
                  )}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "p-4 rounded-xl max-w-[85%] text-sm leading-relaxed border transition-all shadow-2xl",
                    msg.role === 'user' 
                      ? "bg-zinc-950 border-cyan-500/30 text-white rounded-tr-none shadow-cyan-500/5" 
                      : "bg-zinc-800/80 border-zinc-700 text-zinc-200 rounded-tl-none font-medium"
                  )}>
                    <div className="prose prose-invert prose-sm whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                  <Bot size={16} />
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-xl rounded-tl-none border border-zinc-700">
                  <Loader2 size={16} className="animate-spin text-cyan-400" />
                </div>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSend} className="mt-4 flex items-center bg-zinc-950 rounded-xl p-2 border border-zinc-800 group focus-within:border-cyan-500/50 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Elicit understanding..."
              className="bg-transparent text-sm w-full px-4 outline-none text-white placeholder:text-zinc-700 font-bold uppercase tracking-tight"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3 bg-white text-zinc-950 rounded-lg hover:bg-cyan-500 hover:text-white disabled:bg-zinc-900 disabled:text-zinc-800 transition-all shadow-xl font-black"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Right Side: Adaptive Context Panel */}
        <div className="hidden lg:flex flex-col gap-6">
          <motion.div variants={itemVariants} className="bento-card bg-zinc-900 flex-grow flex flex-col border-zinc-800">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Cognitive Context</h3>
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                <p className="text-[9px] text-zinc-500 uppercase font-black mb-1 tracking-widest">Logic Flow</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white tracking-tight">Optimal Phase</span>
                  <div className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 rounded text-[9px] font-black border border-cyan-500/20 uppercase tracking-widest">Stable</div>
                </div>
              </div>
              
              <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                <p className="text-[9px] text-zinc-500 uppercase font-black mb-1 tracking-widest">Elicitation Latency</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-fuchsia-500 tracking-tighter">3.2s</span>
                  <span className="text-[9px] text-zinc-600 font-mono font-bold uppercase tracking-widest">avg deviation</span>
                </div>
              </div>

              <div className="bg-cyan-500/5 border border-cyan-500/10 p-5 rounded-xl">
                 <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">Logic Guard active</span>
                 </div>
                 <p className="text-[11px] text-zinc-400 leading-normal font-medium">
                   Detected collision between Layer 3 and 4 mental models. Redirecting Socratic path to routing tables.
                 </p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-800">
               <h4 className="text-[9px] font-black text-zinc-500 uppercase mb-4 tracking-widest leading-none">Roadmap Lock</h4>
               <div className="flex gap-1.5 h-1">
                  <div className="flex-1 bg-cyan-600 rounded-full shadow-[0_0_5px_rgba(6,182,212,0.4)]"></div>
                  <div className="flex-1 bg-cyan-600 rounded-full shadow-[0_0_5px_rgba(6,182,212,0.4)]"></div>
                  <div className="flex-1 bg-zinc-800 rounded-full"></div>
                  <div className="flex-1 bg-zinc-800 rounded-full"></div>
               </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
