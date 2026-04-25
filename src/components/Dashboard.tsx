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
        <motion.div variants={itemVariants} className="bento-card flex flex-col flex-grow border-zinc-800 bg-zinc-900/40">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">Knowledge Mapping</h3>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain size={18} className="text-cyan-400" />
                Neural Concept Graph
              </h2>
            </div>
            <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded text-[10px] font-bold border border-cyan-500/20 uppercase tracking-tighter">Live Sync</span>
          </div>
          
          <div className="flex-grow flex items-center justify-center relative overflow-hidden bg-zinc-950/80 rounded-2xl border border-zinc-800/50 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#27272a" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} />
                <Radar
                  name="Mastery"
                  dataKey="A"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
            {/* Scanner line animation artifact */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-scan"></div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Syllabus Mastery</span>
              <span className="text-cyan-400 font-mono text-sm font-black">{Math.round((profile?.totalMastery || 0) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/30">
              <div 
                className="bg-cyan-500 h-full transition-all duration-1000 shadow-[0_0_15px_rgba(6,182,212,0.6)]" 
                style={{ width: `${(profile?.totalMastery || 0) * 100}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Dependency Depth Card */}
        <motion.div variants={itemVariants} className="bento-card flex flex-col h-[350px] border-zinc-800 bg-zinc-900/40">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">Conceptual Roots</h3>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <GitBranch size={18} className="text-fuchsia-400" />
                Dependency Depth
              </h2>
            </div>
          </div>
          <div className="flex-grow bg-zinc-950/50 rounded-xl border border-zinc-800/50 overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
              <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Focusing on</p>
              <h4 className="text-[11px] font-bold text-white bg-zinc-900/80 px-2 py-1 rounded inline-block border border-zinc-700 shadow-2xl backdrop-blur-sm">{weakestConcept.title}</h4>
            </div>
            <DependencyGraph conceptId={weakestConcept.id} />
          </div>
          <p className="mt-4 text-[10px] text-zinc-500 leading-tight font-medium">
            Visualizing the required chain of mental models to master <span className="text-white font-bold tracking-tight">{weakestConcept.title}</span>.
          </p>
        </motion.div>
      </div>

      {/* Main Focus / Active Lab (Center/Right Grid) */}
      <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Engagement Stats */}
        <motion.div variants={itemVariants} className="bento-card grid grid-cols-2 gap-4 h-32 bg-zinc-900/40 border-zinc-800">
          <div className="flex flex-col justify-center">
            <p className="text-[9px] text-zinc-500 uppercase mb-1 font-black tracking-[0.2em]">Velocity</p>
            <p className="text-4xl font-black text-cyan-400 tracking-tighter">{profile?.learningVelocity?.toFixed(1) || '0.0'}</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mt-1">Concepts/Hour</p>
          </div>
          <div className="flex flex-col justify-center border-l border-zinc-800 pl-6">
            <p className="text-[9px] text-zinc-500 uppercase mb-1 font-black tracking-[0.2em]">Mastery Gain</p>
            <p className="text-4xl font-black text-fuchsia-500 tracking-tighter">+{Math.round((profile?.totalMastery || 0) * 50)}%</p>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider mt-1">Weekly avg</p>
          </div>
        </motion.div>

        {/* Cognitive Gaps */}
        <motion.div variants={itemVariants} className="bento-card flex flex-col h-32 bg-zinc-900/40 border-zinc-800">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-500" />
            Detected Anomalies
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {weakPoints.length > 0 ? weakPoints.map(c => (
              <div key={c.id} className="shrink-0 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-2 max-w-[180px]">
                <CircleDashed size={12} className="text-amber-500" />
                <span className="text-[11px] font-bold text-zinc-300 truncate uppercase tracking-tight">{c.title}</span>
              </div>
            )) : (
              <p className="text-[11px] text-zinc-600 italic font-medium">Clear cognitive path detected.</p>
            )}
          </div>
        </motion.div>

        {/* Hero Learning Path Card */}
        <motion.div variants={itemVariants} className="md:col-span-2 relative bg-zinc-50 rounded-2xl p-10 flex flex-col min-h-[350px] shadow-[0_30px_70px_rgba(0,0,0,0.4)] overflow-hidden group border border-white">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-500/10 blur-[120px] -ml-40 -mb-40"></div>
          
          <div className="relative z-10 flex flex-col h-full uppercase">
            <div className="flex items-center gap-3 mb-8">
              <div className="px-3 py-1 bg-zinc-950 text-white rounded text-[10px] font-black tracking-[0.3em]">ADAPTIVE TARGET</div>
              <div className="h-px flex-grow bg-zinc-200"></div>
            </div>

            <h2 className="text-zinc-950 font-black text-5xl mb-6 leading-[0.9] tracking-tighter">
              Bridge the neural gap <br/> in <span className="text-cyan-600">K8s Networking</span>
            </h2>
            
            <p className="text-zinc-600 text-lg mb-10 max-w-xl normal-case font-medium leading-relaxed">
              Detection of slight hesitation during Ingress logic exercises. Initializing specialized remediation lab to reinforce foundational routing models.
            </p>

            <div className="mt-auto flex items-center gap-6">
              <button className="px-10 py-5 bg-zinc-950 text-white rounded-xl font-black text-xl shadow-2xl hover:bg-cyan-600 transition-all flex items-center gap-4 tracking-tighter">
                INITIALIZE LAB
                <TrendingUp size={22} className="text-cyan-400" />
              </button>
              <div className="hidden sm:flex items-center gap-3 px-5 py-3 border border-zinc-200 rounded-xl text-zinc-500 font-black text-[10px] tracking-widest bg-white/50">
                <CheckCircle2 size={16} className="text-cyan-500" />
                FOUNDATIONS VERIFIED
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
