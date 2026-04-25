/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TutorChat } from './components/TutorChat';
import { Brain, Rocket, Target, Zap, ChevronRight, LogOut, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from './lib/utils';

function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl space-y-10 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/5 text-cyan-400 rounded-full text-[10px] font-black border border-cyan-500/20 mb-4 uppercase tracking-[0.3em]">
          <Zap size={14} />
          <span>Cognitive Engine v2.0</span>
        </div>
        
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.85] uppercase">
          DEVOPS <br/> <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">RECODED.</span>
        </h1>
        
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
          The <span className="text-white">intelligent personal assistant</span> for learning devops. Adaptive labs for the next generation of engineers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
          <button 
            onClick={onEnter}
            className="group px-10 py-5 bg-white text-zinc-950 rounded-xl font-black text-xl hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_50px_rgba(6,182,212,0.2)] flex items-center gap-2 uppercase tracking-tighter"
          >
            Access Lab
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-3 text-zinc-500 font-bold px-6 py-4 border border-zinc-800 rounded-xl bg-zinc-900/50 backdrop-blur-xl">
             <div className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(217,70,239,0.5)]"></div>
             <span className="text-xs uppercase tracking-widest">Nodes Active: Docker, K8s, CI/CD</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {[
            { icon: Brain, title: 'Neural roadmap', desc: 'Visualization of your dependency nodes and conceptual clusters.', color: 'text-cyan-400' },
            { icon: Rocket, title: 'Fluid Adaptation', desc: 'The curriculum bends to your hesitation patterns and error rate.', color: 'text-fuchsia-400' },
            { icon: Zap, title: 'Scenario Driven', desc: 'Learn by solving infrastructure failures, not by memorizing definitions.', color: 'text-emerald-400' }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-8 bg-zinc-900/30 backdrop-blur-xl rounded-2xl border border-zinc-800/50 text-left hover:border-cyan-500/30 transition-all group"
            >
              <div className={cn("w-14 h-14 bg-zinc-950 rounded-xl flex items-center justify-center mb-6 shadow-xl border border-zinc-800 group-hover:border-cyan-500/50 transition-colors", feature.color)}>
                <feature.icon size={28} />
              </div>
              <h3 className="font-black text-xl text-white mb-2 tracking-tight uppercase tracking-wide">{feature.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'tutor'>('landing');
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(6,182,212,0.4)]" />
          <p className="font-black text-cyan-400 animate-pulse tracking-[0.4em] uppercase text-[10px]">Syncing Neural Graph...</p>
        </div>
      </div>
    );
  }

  if (activeTab === 'landing') {
    return <Landing onEnter={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <Navbar activeTab={activeTab as any} setActiveTab={setActiveTab as any} />
      <main className="relative z-10">
        {activeTab === 'dashboard' ? <Dashboard /> : <TutorChat />}
      </main>
      
      {/* Global Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}
