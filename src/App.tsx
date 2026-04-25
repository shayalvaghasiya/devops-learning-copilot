/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TutorChat } from './components/TutorChat';
import { Brain, Rocket, Target, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

function Landing() {
  const { signIn } = useUser();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl space-y-10 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-black border border-indigo-500/20 mb-4 uppercase tracking-[0.2em]">
          <Zap size={14} />
          <span>Real-time Cognitive Modeling</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
          DEVOPS <br/> <span className="text-indigo-500">RECODED.</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
          The only learning platform that builds a <span className="text-white">dynamic knowledge graph</span> of your skills. Stop watching videos, start building.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
          <button 
            onClick={signIn}
            className="group px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-xl hover:bg-indigo-500 hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center gap-2"
          >
            Initialize Lab
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-3 text-slate-500 font-bold px-6 py-4 border border-slate-800 rounded-2xl bg-slate-900/50 backdrop-blur-xl">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span>Active Nodes: Docker, K8s, CI/CD</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {[
            { icon: Brain, title: 'Neural roadmap', desc: 'Visualization of your dependency nodes and conceptual clusters.' },
            { icon: Rocket, title: 'Fluid Adaptation', desc: 'The curriculum bends to your hesitation patterns and error rate.' },
            { icon: Zap, title: 'Scenario Driven', desc: 'Learn by solving infrastructure failures, not by memorizing definitions.' }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-8 bg-slate-900/50 backdrop-blur-md rounded-[32px] border border-slate-800 text-left hover:border-indigo-500/50 transition-colors"
            >
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20">
                <feature.icon size={28} />
              </div>
              <h3 className="font-black text-xl text-white mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(79,70,229,0.3)]" />
          <p className="font-bold text-slate-400 animate-pulse tracking-widest uppercase text-xs">Initializing Knowledge Graph...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Landing />;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === 'dashboard' ? <Dashboard /> : <TutorChat />}
      </main>
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
