import React from 'react';
import { useUser } from '../contexts/UserContext';
import { LogIn, LogOut, Brain, LayoutDashboard, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const { user, signIn, logout, profile } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 z-50 flex items-center justify-between px-8 mx-6 mt-4 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/20">
          Σ
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none text-white">ALC: DevOps</h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Adaptive learning • v2.4</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <div className="hidden lg:flex gap-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-semibold",
                  activeTab === 'dashboard' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('tutor')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-semibold",
                  activeTab === 'tutor' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <MessageSquare size={16} />
                AI Tutor
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-800"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{profile?.displayName || 'User'}</p>
                <p className="text-[10px] text-emerald-400 uppercase tracking-tighter font-bold">Level {Math.floor((profile?.totalMastery || 0) * 100)} Architect</p>
              </div>
              <button onClick={logout} className="group relative">
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-indigo-500 overflow-hidden ring-4 ring-indigo-500/10">
                   {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700 flex items-center justify-center text-indigo-400 font-bold">U</div>}
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-red-500 rounded-full border-2 border-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                  <LogOut size={10} className="text-white" />
                </div>
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={signIn}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
          >
            <LogIn size={18} />
            Sign In with Google
          </button>
        )}
      </div>
    </nav>
  );
}
