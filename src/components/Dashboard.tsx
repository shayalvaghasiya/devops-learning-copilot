import React from 'react';
import { useUser } from '../contexts/UserContext';
import { DEVOPS_ROADMAP } from '../constants/roadmap';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CircleDashed, Brain, CheckCircle2, GitBranch } from 'lucide-react';
import { motion } from 'motion/react';
import { DependencyGraph } from './DependencyGraph';

export function Dashboard() {
  const { userConcepts, profile } = useUser();

  const radarData = DEVOPS_ROADMAP.map(c => ({
    subject: c.title,
    A: (userConcepts[c.id]?.mastery || 0) * 100,
    fullMark: 100,
  }));

  // Identify weakest concept
  const weakestConcept = DEVOPS_ROADMAP
    .filter(c => userConcepts[c.id]?.mastery !== undefined)
    .sort((a, b) => (userConcepts[a.id]?.mastery || 0) - (userConcepts[b.id]?.mastery || 0))[0] || DEVOPS_ROADMAP[0];

  const masteryStats = DEVOPS_ROADMAP.reduce((acc, c) => {
    const mastery = userConcepts[c.id]?.mastery || 0;
    acc[c.category] = (acc[c.category] || 0) + mastery;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(masteryStats).map(cat => ({
    name: cat.toUpperCase(),
    value: Math.round(masteryStats[cat] * 20) // Normalizing for display
  }));

  const weakPoints = DEVOPS_ROADMAP
    .filter(c => userConcepts[c.id]?.mastery < 0.4)
    .slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 pt-28 max-w-[1400px] mx-auto grid grid-cols-12 gap-6 min-h-[calc(100vh-100px)]"
    >
      {/* Knowledge Graph Section (Left) */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <motion.div variants={itemVariants} className="bento-card flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Knowledge Mapping</h3>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain size={18} className="text-indigo-400" />
                Dynamic Concept Graph
              </h2>
            </div>
            <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-bold border border-indigo-500/20">Live Sync</span>
          </div>
          
          <div className="flex-grow flex items-center justify-center relative overflow-hidden bg-slate-950/50 rounded-2xl border border-slate-800/50 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                <Radar
                  name="Mastery"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Syllabus Mastery</span>
              <span className="text-emerald-400 font-mono text-sm font-bold">{Math.round((profile?.totalMastery || 0) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                style={{ width: `${(profile?.totalMastery || 0) * 100}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Dependency Depth Card */}
        <motion.div variants={itemVariants} className="bento-card flex flex-col h-[350px]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Conceptual Roots</h3>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <GitBranch size={18} className="text-amber-400" />
                Dependency Depth
              </h2>
            </div>
          </div>
          <div className="flex-grow bg-slate-950/30 rounded-2xl border border-slate-800/50 overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Focusing on</p>
              <h4 className="text-xs font-bold text-white bg-slate-900 px-2 py-1 rounded inline-block border border-slate-700 shadow-xl">{weakestConcept.title}</h4>
            </div>
            <DependencyGraph conceptId={weakestConcept.id} />
          </div>
          <p className="mt-4 text-[10px] text-slate-500 leading-tight">
            Visualizing the required chain of mental models to master <span className="text-white font-bold">{weakestConcept.title}</span>.
          </p>
        </motion.div>
      </div>

      {/* Main Focus / Active Lab (Center/Right Grid) */}
      <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Engagement Stats */}
        <motion.div variants={itemVariants} className="bento-card grid grid-cols-2 gap-4 h-32">
          <div className="flex flex-col justify-center">
            <p className="text-[10px] text-slate-500 uppercase mb-1 font-bold tracking-widest">Velocity</p>
            <p className="text-3xl font-black text-indigo-400">{profile?.learningVelocity?.toFixed(1) || '0.0'}</p>
            <p className="text-[10px] text-slate-500 mt-1">Concepts/Hour</p>
          </div>
          <div className="flex flex-col justify-center border-l border-slate-800 pl-4">
            <p className="text-[10px] text-slate-500 uppercase mb-1 font-bold tracking-widest">Mastery Gain</p>
            <p className="text-3xl font-black text-emerald-400">+{Math.round((profile?.totalMastery || 0) * 50)}%</p>
            <p className="text-[10px] text-slate-500 mt-1">Weekly average</p>
          </div>
        </motion.div>

        {/* Cognitive Gaps */}
        <motion.div variants={itemVariants} className="bento-card flex flex-col h-32">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-500" />
            Detected Gaps
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {weakPoints.length > 0 ? weakPoints.map(c => (
              <div key={c.id} className="shrink-0 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2 max-w-[180px]">
                <CircleDashed size={14} className="text-amber-500" />
                <span className="text-[11px] font-bold text-slate-300 truncate">{c.title}</span>
              </div>
            )) : (
              <p className="text-[11px] text-slate-500 italic">No major misconceptions detected.</p>
            )}
          </div>
        </motion.div>

        {/* Hero Learning Path Card */}
        <motion.div variants={itemVariants} className="md:col-span-2 relative bg-white rounded-[32px] p-8 flex flex-col min-h-[300px] shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -mr-32 -mt-32"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-bold tracking-widest uppercase">Adaptive Goal</div>
              <div className="h-px flex-grow bg-slate-100"></div>
            </div>

            <h2 className="text-slate-900 font-black text-4xl mb-4 leading-tight">
              Bridge the gap in <span className="text-indigo-600">Kubernetes Networking</span>
            </h2>
            
            <p className="text-slate-500 text-lg mb-8 max-w-xl">
              Your model shows high comprehension in Docker, but slight hesitation when discussing Ingress logic. Let's fix that.
            </p>

            <div className="mt-auto flex items-center gap-4">
              <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-slate-900 transition-all flex items-center gap-3">
                Start adaptive lab
                <TrendingUp size={20} />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-100 rounded-2xl text-slate-400 font-bold text-sm">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Foundations Verified
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
