import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../App";
import { 
  TrendingUp, 
  Music, 
  Globe, 
  Wallet,
  ArrowUpRight,
  MoreVertical,
  Plus,
  User,
  Shield,
  Bell,
  CheckCircle,
  ShieldAlert
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "motion/react";

export default function Overview() {
  const { user, profile, isAdmin } = useAuth();
  const [recentReleases, setRecentReleases] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, live: 0, pending: 0, rejected: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchSystemNotifications = async () => {
      const q = query(collection(db, "system_notifications"), orderBy("createdAt", "desc"), limit(3));
      const snap = await getDocs(q);
      setSystemNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchSystemNotifications();

    const fetchData = async () => {
      if (!user) return;
      
      // Fetch Recent Releases
      const q = query(
        collection(db, "releases"), 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(4)
      );
      
      const snap = await getDocs(q);
      setRecentReleases(snap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch Stats
      const allSnap = await getDocs(query(collection(db, "releases"), where("userId", "==", user.uid)));
      const allData = allSnap.docs.map(d => d.data());
      
      setStats({
        total: allData.length,
        live: allData.filter((r: any) => r.status === 'live').length,
        pending: allData.filter((r: any) => r.status === 'pending' || r.status === 'approved').length,
        rejected: allData.filter((r: any) => r.status === 'rejected').length
      });

      // Fetch Earnings for Chart
      const tSnap = await getDocs(query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        where("type", "==", "earning"),
        orderBy("createdAt", "asc")
      ));

      const earningsByDay: Record<string, number> = {};
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      }).reverse();

      last7Days.forEach(day => earningsByDay[day] = 0);

      tSnap.docs.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        if (earningsByDay[date] !== undefined) {
          earningsByDay[date] += data.amount;
        }
      });

      const formattedChart = last7Days.map(day => ({
        name: day,
        revenue: earningsByDay[day]
      }));

      setChartData(formattedChart);
    };
    fetchData();
  }, [user]);

  return (
    <div className="space-y-12 pb-20">
      {isAdmin && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-brand-purple text-white p-6 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-purple-500/20"
        >
          <div className="flex items-center gap-6 text-left">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black uppercase tracking-tighter text-lg leading-tight text-left">Administrative Privilege Detected</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">You have full authority over the distribution network</p>
            </div>
          </div>
          <Link to="/admin" className="px-8 py-3 bg-white text-brand-purple rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-lg">
            Enter Admin Portal
          </Link>
        </motion.div>
      )}

      {/* System Notifications */}
      <AnimatePresence>
        {systemNotifications.length > 0 && (
          <div className="space-y-4">
            {systemNotifications.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-4 md:p-6 rounded-[2rem] border flex items-center gap-6 relative overflow-hidden",
                  n.type === 'urgent' ? "bg-rose-50 border-rose-100 text-rose-800" :
                  n.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-800" :
                  "bg-blue-50 border-blue-100 text-blue-800"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  n.type === 'urgent' ? "bg-rose-100" :
                  n.type === 'warning' ? "bg-amber-100" :
                  "bg-blue-100"
                )}>
                   {n.type === 'urgent' ? <ShieldAlert className="w-6 h-6" /> :
                    n.type === 'warning' ? <Bell className="w-6 h-6" /> :
                    <Globe className="w-6 h-6" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3">
                    <p className="font-black uppercase tracking-tight text-sm md:text-base">{n.title}</p>
                    <span className="text-[9px] font-bold opacity-40 uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs md:text-sm font-medium opacity-80 mt-1">{n.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Welcome & Earnings Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight mb-2 uppercase flex flex-wrap items-center gap-2 md:gap-4 text-left">
            Welcome, <span className="text-brand-blue">{profile?.displayName?.split(" ")[0]}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium text-left">Your global music empire is scaling. Here's your mission control.</p>
        </div>
        
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-slate-100 flex items-center gap-4 md:gap-8 group">
           <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500/10 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-emerald-500">
              <Wallet className="w-6 h-6 md:w-8 md:h-8" />
           </div>
           <div>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5 md:mb-1">Treasury Balance</p>
              <h2 className="text-2xl md:text-4xl font-black font-display tracking-tight group-hover:scale-105 transition-transform origin-left">
                {formatCurrency(profile?.walletBalance || 0)}
              </h2>
           </div>
           <Link to="/dashboard/wallet" className="w-10 h-10 md:w-12 md:h-12 bg-slate-950 text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-brand-blue transition-all ml-auto md:ml-4">
              <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6" />
           </Link>
        </div>
      </div>

      {/* 3D Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Upload Music", icon: Plus, path: "/dashboard/upload", color: "bg-brand-blue shadow-blue-500/40" },
           { label: "My Releases", icon: Music, path: "/dashboard/releases", color: "bg-slate-900 shadow-slate-900/40" },
           { label: "Withdraw Funds", icon: Wallet, path: "/dashboard/wallet", color: "bg-emerald-500 shadow-emerald-500/40" },
           { label: "Artist Profile", icon: User, path: "/dashboard/artists", color: "bg-brand-purple shadow-purple-500/40" },
         ].map((btn, i) => (
           <Link 
             key={i} 
             to={btn.path}
             className={cn(
               "relative h-24 rounded-[2rem] flex items-center p-6 text-white font-black font-display tracking-wider uppercase text-xs overflow-hidden group transition-all transform hover:-translate-y-2 active:translate-y-0 shadow-lg group-hover:shadow-2xl",
               btn.color
             )}
           >
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform">
                 <btn.icon className="w-24 h-24" />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <btn.icon className="w-5 h-5" />
                 </div>
                 {btn.label}
              </div>
           </Link>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
         {/* Analytics Mini View */}
         <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-sm border border-slate-100 flex flex-col gap-6 md:gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-4">
                  <TrendingUp className="text-brand-blue w-6 h-6 md:w-8 md:h-8" /> EARNINGS TREND
               </h3>
               <div className="self-start sm:self-auto px-4 py-1.5 bg-emerald-100 rounded-full flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">+12.4% vs last mo</span>
               </div>
            </div>
            
            <div className="h-[220px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="miniChart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0066FF" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                    <YAxis hide domain={['dataMin', 'dataMax + 10']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 800, color: '#111' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={5} fillOpacity={1} fill="url(#miniChart)" animationDuration={2000} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className="pt-4 border-t border-slate-50">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 italic">Active Distribution Network</p>
               <div className="flex flex-wrap items-center gap-10">
                  {[
                    { name: "Spotify", logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" },
                    { name: "Apple Music", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Apple_Music_logo.svg" },
                    { name: "JioSaavn", logo: "https://upload.wikimedia.org/wikipedia/en/2/24/JioSaavn_Logo.png" },
                    { name: "Gaana", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Gaana_Logo.svg" },
                    { name: "YT Music", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg" },
                    { name: "Instagram", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" },
                    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" },
                    { name: "Wynk", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Wynk_Music_logo.png" },
                    { name: "Snapchat", logo: "https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg" },
                    { name: "FB", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" },
                  ].map((p, i) => (
                    <motion.img 
                      key={i}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      src={p.logo} 
                      alt={p.name}
                      title={p.name}
                      className="h-7 w-auto grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"
                      referrerPolicy="no-referrer"
                    />
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pt-6">
               {[
                 { label: "Live", count: stats.live, color: "bg-emerald-500" },
                 { label: "Pending", count: stats.pending, color: "bg-brand-blue" },
                 { label: "Rejected", count: stats.rejected, color: "bg-rose-500" },
               ].map((item, i) => (
                 <div key={i} className="p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-[2rem] flex flex-col gap-1 md:gap-2">
                    <div className={cn("w-2 h-2 rounded-full mb-1", item.color)}></div>
                    <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                    <p className="text-xl md:text-2xl font-black font-display">{item.count}</p>
                 </div>
               ))}
            </div>
         </div>

         {/* Recent Releases Visual List */}
         <div className="space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-2xl font-black font-display tracking-tight uppercase">Recent Releases</h3>
               <Link to="/dashboard/releases" className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue hover:underline">Full Catalog</Link>
            </div>

            <div className="space-y-6">
               {recentReleases.map((release, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 group hover:shadow-2xl transition-all"
                  >
                     <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:rotate-3 transition-transform">
                        <img src={release.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 tracking-tight truncate">{release.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{release.artist}</p>
                        <div className="flex items-center gap-2 mt-3">
                           <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              release.status === 'live' ? "bg-emerald-500" : "bg-amber-500"
                           )}></div>
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest",
                             release.status === 'live' ? "text-emerald-500" : "text-amber-500"
                           )}>{release.status}</span>
                        </div>
                     </div>
                     <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 hover:text-brand-blue transition-colors">
                        <ArrowUpRight className="w-5 h-5" />
                     </button>
                  </motion.div>
               ))}
               {recentReleases.length === 0 && (
                 <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <Music className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No music found.</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
