import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../App";
import { 
  Music, 
  Search, 
  ExternalLink,
  ChevronRight,
  Filter,
  MoreVertical,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  FileText,
  ArrowRight
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

const STATUSES = [
  { id: 'all', label: 'All Releases' },
  { id: 'pending', label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border border-amber-500/20' },
  { id: 'approved', label: 'Approved', color: 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' },
  { id: 'live', label: 'Live', color: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' },
  { id: 'action_required', label: 'Action Required', color: 'bg-rose-500/10 text-rose-600 border border-rose-500/20' },
  { id: 'rejected', label: 'Rejected', color: 'bg-rose-500/10 text-rose-600 border border-rose-500/20' },
  { id: 'takedown', label: 'Takedown Requested', color: 'bg-slate-500/10 text-slate-600 border border-slate-500/20' },
  { id: 'completed', label: 'Completed', color: 'bg-slate-900 text-white' },
];

export default function MyReleases() {
  const { user } = useAuth();
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMyReleases = async () => {
      if (!user) return;
      const q = query(
        collection(db, "releases"), 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setReleases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchMyReleases();
  }, [user]);

  const filteredReleases = releases.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = r.title?.toLowerCase().includes(search.toLowerCase()) || 
                          r.artist?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-24">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div>
           <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight uppercase">Discography</h1>
           <p className="text-xs md:text-sm text-slate-400 font-medium">Manage and track your global catalog in high definition.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 pl-4 md:pl-6 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-50 w-full lg:w-auto">
           <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-300" />
           <input 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search releases..."
             className="bg-transparent border-none focus:ring-0 text-xs md:text-sm font-bold flex-1 md:min-w-[200px]"
           />
           <button className="w-10 h-10 md:w-12 md:h-12 bg-slate-950 text-white rounded-[1.2rem] md:rounded-3xl flex items-center justify-center hover:bg-brand-blue transition-colors">
              <Filter className="w-4 h-4 md:w-5 md:h-5" />
           </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide py-2">
         {STATUSES.map((s) => (
            <button 
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={cn(
                "px-6 md:px-8 py-2.5 md:py-3.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                filter === s.id ? "bg-brand-blue text-white shadow-2xl shadow-blue-500/30 -translate-y-1" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
              )}
            >
               {s.label}
            </button>
         ))}
      </div>

      {/* Releases Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
         <AnimatePresence mode="popLayout">
            {filteredReleases.map((release, i) => (
               <motion.div 
                 key={release.id}
                 layout
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 transition={{ delay: i * 0.05 }}
                 className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[4rem] shadow-sm border border-slate-100 group hover:shadow-3xl transition-all duration-700 relative flex flex-col"
               >
                  {/* Status Indicator */}
                  <div className="absolute top-6 right-6 md:top-10 md:right-10 z-20">
                     <span className={cn(
                        "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] shadow-sm backdrop-blur-md",
                        STATUSES.find(s => s.id === release.status)?.color || "bg-slate-100 text-slate-500"
                     )}>
                        {release.status?.replace("_", " ")}
                     </span>
                  </div>

                  {/* Artwork Section */}
                  <div className="relative aspect-square rounded-[1.5rem] md:rounded-[3rem] overflow-hidden mb-6 md:mb-8 shadow-2xl bg-slate-100">
                     <img 
                       src={release.coverUrl} 
                       className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                       referrerPolicy="no-referrer" 
                     />
                     <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 gap-4">
                        <Link 
                          to={`/dashboard/releases/${release.id}`}
                          className="w-full py-4 bg-white rounded-2xl text-slate-950 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-blue hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
                        >
                           Track Assets <ChevronRight className="w-4 h-4" />
                        </Link>
                        <div className="flex gap-3 transform translate-y-8 group-hover:translate-y-0 transition-transform delay-75">
                           <button className="flex-1 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all">Edit</button>
                           <button className="flex-1 py-3 bg-rose-500/80 backdrop-blur-md text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all">Takedown</button>
                        </div>
                     </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 space-y-6">
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{release.releaseType || "Single"}</p>
                           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(release.createdAt).toLocaleDateString()}</p>
                        </div>
                        <h3 className="text-2xl font-black font-display tracking-tight text-slate-800 line-clamp-1 group-hover:text-brand-blue transition-colors">
                           {release.title}
                        </h3>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                           {release.artist}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                           <span className="text-[8px] font-black uppercase px-2 py-1 bg-slate-50 text-slate-400 rounded-lg border border-slate-100">Lang: {release.language}</span>
                           <span className="text-[8px] font-black uppercase px-2 py-1 bg-slate-50 text-slate-400 rounded-lg border border-slate-100">Genre: {release.primaryGenre}</span>
                           <span className="text-[8px] font-black uppercase px-2 py-1 bg-slate-50 text-slate-400 rounded-lg border border-slate-100">Label: {release.labelName}</span>
                        </div>
                        <div className="mt-4 space-y-1">
                           <p className="text-[9px] font-medium text-slate-400 italic">Lyricist: {release.lyricist}</p>
                           <p className="text-[9px] font-medium text-slate-400 italic">Composer: {release.composer}</p>
                           <p className="text-[9px] font-medium text-slate-400 italic">Producer: {release.producer}</p>
                           <p className="text-[9px] font-medium text-slate-400 leading-tight line-clamp-2 mt-1">Lyrics: {release.lyrics}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                        <div>
                           <p className="text-[8px] uppercase font-black text-slate-300 tracking-[0.2em] mb-1">ISRC</p>
                           <p className="text-[10px] font-mono font-black text-slate-800 truncate">
                              {release.isrc || "TBD"}
                           </p>
                        </div>
                        <div>
                           <p className="text-[8px] uppercase font-black text-slate-300 tracking-[0.2em] mb-1">UPC</p>
                           <p className="text-[10px] font-mono font-black text-slate-800 truncate">
                              {release.upc || "TBD"}
                           </p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status Sync</span>
                        </div>
                        <div className="flex gap-2">
                           <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                             <Music className="w-4 h-4" />
                           </div>
                           <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300">
                             <FileText className="w-4 h-4" />
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            ))}
         </AnimatePresence>

         {filteredReleases.length === 0 && !loading && (
           <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 text-center mx-10">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border-2 border-slate-100">
                 <Music className="w-12 h-12" />
              </div>
              <h3 className="font-black font-display text-4xl uppercase tracking-tighter mb-4 text-slate-800">No signals detected</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed mb-10">Your catalog is currently void of activity. Start your legacy by deploying your first master recording.</p>
              <Link to="/dashboard/upload" className="btn-premium btn-glow flex items-center gap-3 py-4 px-10">
                 Upload New Release <ArrowRight className="w-5 h-5" />
              </Link>
           </div>
         )}
      </div>
    </div>
  );
}
