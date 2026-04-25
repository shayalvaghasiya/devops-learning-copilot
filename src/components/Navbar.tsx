import React from 'react';
import { useUser } from '../contexts/UserContext';
import { LogIn, LogOut, Brain, LayoutDashboard, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const { user, signIn, logout, profile } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800 z-50 flex items-center justify-between px-8 mx-6 mt-4 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('landing')}>
        <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center font-black text-xl text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          Σ
        </div>
        <div>
          <h1 className="text-lg font-black leading-none text-white uppercase tracking-tighter">ALC: DevOps</h1>
          <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-1">session active : v2.4</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex gap-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg transition-all text-xs font-black uppercase tracking-widest",
              activeTab === 'dashboard' ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" : "text-zinc-500 hover:text-white hover:bg-zinc-800"
            )}
          >
            <LayoutDashboard size={14} />
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('tutor')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg transition-all text-xs font-black uppercase tracking-widest",
              activeTab === 'tutor' ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" : "text-zinc-500 hover:text-white hover:bg-zinc-800"
            )}
          >
            <MessageSquare size={14} />
            Copilot
          </button>
        </div>
        
        <div className="h-8 w-px bg-zinc-800"></div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-white uppercase tracking-tight leading-none">{profile?.displayName || 'Operator'}</p>
            <p className="text-[9px] text-cyan-400 font-mono font-bold tracking-widest mt-1">SYS.AUTH: OK</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-cyan-500">
               <Brain size={16} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
