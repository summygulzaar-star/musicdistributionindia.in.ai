import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  Users, 
  Music, 
  Clock, 
  CheckCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Wallet,
  Youtube,
  Fingerprint,
  MessageSquare,
  Zap,
  MoreVertical
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn, formatCurrency } from "../../lib/utils";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminHome() {
  const [stats, setStats] = useState({
    users: 0,
    totalReleases: 0,
    pending: 0,
    approved: 0,
    revenue: 0,
    liquidation: 0,
    pendingOAC: 0,
    pendingCID: 0,
    supportVol: 0
  });
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [velocityChart, setVelocityChart] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      const uSnap = await getDocs(collection(db, "users"));
      const rSnap = await getDocs(collection(db, "releases"));
      const rData = rSnap.docs.map(d => ({...d.data(), createdAt: d.data().createdAt}));
      
      const tSnap = await getDocs(collection(db, "transactions"));
      const tData = tSnap.docs.map(d => d.data());

      const oacSnap = await getDocs(collection(db, "oac_requests"));
      const cidSnap = await getDocs(collection(db, "content_id_requests"));
      const sSnap = await getDocs(query(collection(db, "support_tickets"), where("status", "==", "pending")));

      const totalRevenue = tData
        .filter(t => t.type === 'earning')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalLiquidation = tData
        .filter(t => t.type === 'withdrawal' && t.status === 'pending')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setStats({
        users: uSnap.size,
        totalReleases: rSnap.size,
        pending: rData.filter(r => (r as any).status === 'pending').length,
        approved: rData.filter(r => (r as any).status === 'approved' || (r as any).status === 'live').length,
        revenue: totalRevenue,
        liquidation: totalLiquidation,
        pendingOAC: oacSnap.size,
        pendingCID: cidSnap.size,
        supportVol: sSnap.size
      });

      // Chart Data Generation
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const last6Months = Array.from({length: 6}, (_, i) => {
        const mIdx = (currentMonth - i + 12) % 12;
        return months[mIdx];
      }).reverse();

      const revByMonth: Record<string, number> = {};
      const upByMonth: Record<string, number> = {};
      last6Months.forEach(m => {
        revByMonth[m] = 0;
        upByMonth[m] = 0;
      });

      tData.filter(t => t.type === 'earning').forEach(t => {
        const m = months[new Date(t.createdAt).getMonth()];
        if (revByMonth[m] !== undefined) revByMonth[m] += t.amount;
      });

      rData.forEach(r => {
        const m = months[new Date((r as any).createdAt).getMonth()];
        if (upByMonth[m] !== undefined) upByMonth[m] += 1;
      });

      setRevenueChart(last6Months.map(m => ({ name: m, revenue: revByMonth[m] })));
      setVelocityChart(last6Months.map(m => ({ name: m, uploads: upByMonth[m] })));

      // Fetch all pending releases for the review queue
      const q = query(collection(db, "releases"), where("status", "==", "pending"));
      const qSnap = await getDocs(q);
      const queueData = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort manually to handle documents missing createdAt
      queueData.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
      
      setQueue(queueData);
    };
    fetchAdminStats();
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight mb-2 uppercase italic text-left">Mission <span className="text-brand-purple">Control</span></h1>
          <p className="text-slate-500 font-medium tracking-wide text-left text-xs uppercase">Enterprise identity & asset orchestration engine.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-6 py-3 bg-slate-800/50 rounded-2xl border border-slate-700 flex items-center gap-3 self-start lg:self-auto">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Node-01 Live</span>
           </div>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {[
          { label: "Total Platform Users", val: stats.users, icon: Users, color: "text-brand-blue", bg: "bg-brand-blue/10" },
          { label: "Pending Reviews", val: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Active Live Assets", val: stats.approved, icon: Music, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Gross Platform Revenue", val: formatCurrency(stats.revenue), icon: TrendingUp, color: "text-brand-purple", bg: "bg-brand-purple/10" },
          { label: "Pending Liquidations", val: formatCurrency(stats.liquidation), icon: Wallet, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "OAC Applications", val: stats.pendingOAC, icon: Youtube, color: "text-rose-600", bg: "bg-rose-600/10" },
          { label: "CID Requests", val: stats.pendingCID, icon: Fingerprint, color: "text-cyan-500", bg: "bg-cyan-500/10" },
          { label: "Support Vol", val: stats.supportVol, icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-400/10" },
        ].map((s, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#1E293B] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-800 hover:border-brand-purple/50 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 md:mb-6", s.bg)}>
              <s.icon className={cn("w-5 h-5 md:w-6 md:h-6", s.color)} />
            </div>
            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 md:mb-2 truncate">{s.label}</p>
            <h3 className="text-xl md:text-3xl font-black font-display tracking-tighter text-white">{s.val}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
         <div className="bg-[#1E293B] p-10 rounded-[4rem] border border-slate-800 shadow-2xl space-y-8">
            <h3 className="text-xl font-black font-display tracking-tight text-slate-300 uppercase flex items-center gap-4">
               <TrendingUp className="text-brand-purple w-6 h-6" /> Revenue Performance
            </h3>
            <div className="h-[300px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontWeight: 800 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-[#1E293B] p-10 rounded-[4rem] border border-slate-800 shadow-2xl space-y-8">
            <h3 className="text-xl font-black font-display tracking-tight text-slate-300 uppercase flex items-center gap-4">
               <Zap className="text-brand-blue w-6 h-6" /> Upload Velocity
            </h3>
            <div className="h-[300px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155' }}
                  />
                  <Bar dataKey="uploads" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Content Review Queue */}
      <div className="bg-[#1E293B] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl">
         <div className="p-6 md:p-12 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-4 uppercase italic">
               <ShieldAlert className="text-amber-500 w-6 h-6 md:w-8 md:h-8" /> CONTENT REVIEW QUEUE
            </h3>
            <span className="self-start md:self-auto px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl text-[10px] md:text-xs font-bold tracking-widest uppercase">{stats.pending} ACTIONS REQUIRED</span>
         </div>
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[900px]">
               <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                     <th className="px-12 py-8">Asset Details</th>
                     <th className="px-6 py-8">Identity</th>
                     <th className="px-6 py-8">Submitted On</th>
                     <th className="px-6 py-8 text-center text-brand-purple">SLA Status</th>
                     <th className="px-12 py-8 text-right">Review</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                  {queue.map((release, i) => (
                    <tr key={i} className="group hover:bg-slate-800/50 transition-colors">
                       <td className="px-12 py-8">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 shadow-xl group-hover:scale-105 transition-transform bg-slate-800">
                                <img src={release.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                             </div>
                             <div>
                                <h4 className="font-bold text-lg text-white group-hover:text-brand-blue transition-colors">{release.title || release.songName}</h4>
                                <p className="text-xs text-slate-500 mt-1 font-medium">{release.labelName || release.label || "Independent"}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-8">
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-300">{release.artist || release.singerName}</span>
                             <span className="text-[10px] text-slate-500 tracking-widest uppercase mt-1">Lead Artist</span>
                          </div>
                       </td>
                       <td className="px-6 py-8 text-sm text-slate-400 font-medium">
                          {new Date(release.createdAt).toLocaleDateString()}
                       </td>
                       <td className="px-6 py-8 text-center">
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold tracking-tighter">
                             <Clock className="w-3 h-3" /> WITHIN LIMITS
                          </span>
                       </td>
                       <td className="px-12 py-8 text-right">
                          <Link 
                            to={`/admin/review/${release.id}`} 
                            className="btn-premium bg-brand-blue text-white py-3 px-6 text-xs flex items-center justify-center gap-2 ml-auto shadow-blue-900/40"
                          >
                             MASTER REVIEW <ArrowRight className="w-4 h-4" />
                          </Link>
                       </td>
                    </tr>
                  ))}
                  {queue.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-12 py-24 text-center">
                         <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6 opacity-20" />
                         <p className="text-slate-500 font-display text-xl uppercase tracking-widest font-bold">ALL CLEAR. NO PENDING REVIEWS.</p>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
