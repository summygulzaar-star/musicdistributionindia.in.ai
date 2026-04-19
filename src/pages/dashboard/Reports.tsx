import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../App";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp,
  FileBarChart,
  Table as TableIcon,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Reports() {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const snap = await getDocs(query(collection(db, "royalty_reports"), where("userId", "==", user.uid), orderBy("period", "desc")));
      const reportData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReports(reportData);

      // Simple chart data from reports
      const chart = reportData.slice(0, 6).reverse().map((r: any) => ({
        name: r.period,
        amount: r.amount
      }));
      setChartData(chart);
      
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="p-10 animate-pulse text-slate-400">Aggregating Financial Data...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-5xl font-black font-display tracking-tight uppercase">Royalty <span className="text-brand-blue">Intelligence</span></h1>
            <p className="text-slate-400 font-medium">Analyze your global revenue streams and performance data.</p>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-10">
            {/* Visual Analytics */}
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black font-display uppercase tracking-tight flex items-center gap-4">
                     <TrendingUp className="w-8 h-8 text-brand-blue" /> REVENUE PROJECTION
                  </h3>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-brand-blue"></div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Royalties</span>
                     </div>
                  </div>
               </div>
               
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} tickFormatter={(v) => `₹${v}`} />
                        <Tooltip 
                           cursor={{fill: '#f8fafc', radius: 20}}
                           contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '20px' }}
                           itemStyle={{ fontWeight: 900, color: '#0066FF' }}
                        />
                        <Bar dataKey="amount" radius={[20, 20, 0, 0]}>
                           {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#0066FF' : '#E2E8F0'} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-[4rem] p-10 border border-slate-100 shadow-sm">
               <h3 className="text-2xl font-black font-display uppercase mb-8 flex items-center gap-4">
                  <TableIcon className="w-8 h-8 text-slate-800" /> REVENUE STATEMENTS
               </h3>
               <div className="space-y-4">
                  {reports.map((r, i) => (
                     <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={r.id} 
                        className="p-8 bg-slate-50 rounded-[2.5rem] flex items-center justify-between group hover:bg-brand-blue transition-all"
                     >
                        <div className="flex items-center gap-8">
                           <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors shadow-sm">
                              <Calendar className="w-8 h-8" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-white/60 transition-colors mb-1">Financial Cycle</p>
                              <h4 className="text-2xl font-black font-display uppercase group-hover:text-white transition-colors">{r.period}</h4>
                           </div>
                        </div>
                        <div className="text-right flex items-center gap-10">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/60 transition-colors mb-1">Net Credit</p>
                              <p className="text-2xl font-black font-display text-emerald-600 group-hover:text-white transition-colors">{formatCurrency(r.amount)}</p>
                           </div>
                           <a 
                             href={r.reportUrl} 
                             target="_blank" 
                             rel="noreferrer"
                             className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-brand-blue group-hover:scale-110 transition-all shadow-sm"
                           >
                              <Download className="w-6 h-6" />
                           </a>
                        </div>
                     </motion.div>
                  ))}
                  {reports.length === 0 && (
                     <div className="p-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest border-2 border-dashed border-slate-100 rounded-[3rem]">
                        Awaiting first revenue cycle transmission
                     </div>
                  )}
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-brand-dark p-10 rounded-[3.5rem] text-white space-y-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-brand-blue/30 to-brand-purple/30 opacity-40"></div>
               <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                        <TrendingUp className="w-6 h-6" />
                     </div>
                     <h4 className="text-xl font-black font-display uppercase tracking-tight">Earning Potential</h4>
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Total Lifecycle Revenue</p>
                        <p className="text-5xl font-black font-display tracking-tight text-white">{formatCurrency(reports.reduce((acc, curr) => acc + curr.amount, 0))}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Average Monthly Creditation</p>
                        <p className="text-2xl font-black font-display text-white">
                           {formatCurrency(reports.length > 0 ? (reports.reduce((acc, curr) => acc + curr.amount, 0) / reports.length) : 0)}
                        </p>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 space-y-4">
                     <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-white/60">
                        <span>Platform Reach</span>
                        <span className="text-brand-blue">250+ Stores</span>
                     </div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-linear-to-r from-brand-blue to-cyan-400 rounded-full" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
               <h4 className="text-lg font-black font-display uppercase tracking-tight">Intelligence Feeds</h4>
               <div className="space-y-4">
                  {[
                     { label: "Market Growth", val: "+14%", pos: true },
                     { label: "Global Streams", val: "1.2M", pos: true },
                     { label: "Retention Rate", val: "92%", pos: true },
                     { label: "Disbursement Lag", val: "< 24h", pos: true }
                  ].map((stat, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-black text-slate-800">{stat.val}</span>
                           {stat.pos ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
