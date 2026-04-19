import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { BarChart3, TrendingUp, Users, Music, DollarSign, ArrowUpRight, ArrowDownRight, Globe } from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion } from "motion/react";

export default function AdminReports() {
  const [stats, setStats] = useState({ users: 0, releases: 0, revenue: 0, artists: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const uSnap = await getDocs(collection(db, "users"));
      const rSnap = await getDocs(collection(db, "releases"));
      const aSnap = await getDocs(collection(db, "artists"));
      
      const allUsers = uSnap.docs.map(d => d.data());
      const totalRevenue = allUsers.reduce((acc, curr: any) => acc + (curr.walletBalance || 0), 0);

      setStats({
        users: uSnap.size,
        releases: rSnap.size,
        artists: aSnap.size,
        revenue: totalRevenue
      });

      // Dummy chart data for ecosystem growth
      const last6Months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
      setChartData(last6Months.map(m => ({
        name: m,
        growth: Math.floor(Math.random() * 5000) + 2000,
        assets: Math.floor(Math.random() * 100) + 50
      })));
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight uppercase">Enterprise Intelligence</h1>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-2 px-4 md:px-0">Aggregate network performance and financial growth metrics.</p>
         </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Total Network Users", val: stats.users, icon: Users, color: "bg-brand-blue" },
           { label: "Gross Asset Value", val: formatCurrency(stats.revenue), icon: DollarSign, color: "bg-emerald-500" },
           { label: "Active Releases", val: stats.releases, icon: Music, color: "bg-brand-purple" },
           { label: "Verified Artists", val: stats.artists, icon: Globe, color: "bg-amber-500" }
         ].map((s, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="bg-[#1E293B] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl"
            >
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", s.color)}>
                  <s.icon className="w-6 h-6" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 italic">{s.label}</p>
               <h3 className="text-2xl font-black font-display text-white">{s.val}</h3>
            </motion.div>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 bg-[#1E293B] p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl space-y-10">
            <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-4 uppercase">
               <TrendingUp className="text-brand-blue w-8 h-8" /> Ecosystem Trajectory
            </h3>
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 800}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid #1e293b', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                      itemStyle={{ fontWeight: 900, color: '#fff' }}
                      labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase' }}
                    />
                    <Area type="monotone" dataKey="growth" stroke="#0066FF" strokeWidth={6} fillOpacity={1} fill="url(#growthGrad)" animationDuration={2500} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-[#1E293B] p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
               <h4 className="text-xl font-black font-display uppercase tracking-tight">Market Distribution</h4>
               <div className="space-y-4">
                  {[
                    { label: "Standard Distribution", rate: "74%", color: "bg-brand-blue" },
                    { label: "Enterprise Tier", rate: "12%", color: "bg-brand-purple" },
                    { label: "Verified Pro", rate: "14%", color: "bg-emerald-500" }
                  ].map((m, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>{m.label}</span>
                          <span className="text-white">{m.rate}</span>
                       </div>
                       <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: m.rate }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className={cn("h-full rounded-full", m.color)} 
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="pt-10 border-t border-slate-800">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 italic">Network Health Index</p>
               <div className="flex items-center gap-6">
                  <div className="flex-1 space-y-2">
                     <p className="text-3xl font-black font-display text-emerald-500 tracking-tighter">99.98%</p>
                     <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Uptime Probability</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center p-2">
                     <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center text-slate-950">
                        <ArrowUpRight className="w-6 h-6" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
