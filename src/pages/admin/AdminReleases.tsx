import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Music, Search, Filter, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

export default function AdminReleases() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchReleases = async () => {
      const q = query(collection(db, "releases"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setReleases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchReleases();
  }, []);

  const filtered = releases.filter(r => filter === "all" || r.status === filter);

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
        <div>
           <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight uppercase">Master Catalog</h1>
           <p className="text-xs md:text-sm text-slate-400 font-medium">Full repository of all assets submitted across the global network.</p>
        </div>
        <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide py-1">
           {["all", "pending", "approved", "rejected", "live"].map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                 filter === f ? "bg-brand-purple text-white shadow-xl shadow-purple-900/40" : "bg-slate-800 text-slate-500 hover:text-white"
               )}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl">
         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[1000px]">
            <thead>
               <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-12 py-8">Asset</th>
                  <th className="px-6 py-8">Primary Details</th>
                  <th className="px-6 py-8">Technical Credits</th>
                  <th className="px-6 py-8">Status</th>
                  <th className="px-6 py-8">Identifiers</th>
                  <th className="px-12 py-8 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
               {filtered.map((r, i) => (
                 <tr key={i} className="group hover:bg-slate-800/50 transition-colors">
                    <td className="px-12 py-8">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                             <img src={r.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                             <p className="font-bold text-white text-lg">{r.title || r.songName}</p>
                             <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">ID: {r.id.slice(0, 8)}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-8 text-sm">
                       <p className="font-bold text-white uppercase text-xs truncate max-w-[150px]">{r.artist || r.singerName}</p>
                       <p className="text-slate-500 mt-1 text-[10px] font-medium truncate max-w-[150px]">{r.labelName || r.label || "Independent"}</p>
                       <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[8px] font-black rounded uppercase">{r.language}</span>
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[8px] font-black rounded uppercase">{r.primaryGenre}</span>
                       </div>
                    </td>
                    <td className="px-6 py-8 text-[10px] font-medium text-slate-400 space-y-1">
                       <p className="truncate max-w-[150px]"><span className="text-slate-600 font-bold uppercase mr-1">Artist:</span> {r.artist || r.singerName}</p>
                       <p className="truncate max-w-[150px]"><span className="text-slate-600 font-bold uppercase mr-1">Lyricist:</span> {r.lyricist}</p>
                       <p className="truncate max-w-[150px]"><span className="text-slate-600 font-bold uppercase mr-1">Composer:</span> {r.composer}</p>
                       <p className="truncate max-w-[150px]"><span className="text-slate-600 font-bold uppercase mr-1">Producer:</span> {r.producer}</p>
                    </td>
                    <td className="px-6 py-8">
                       <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          r.status === 'live' ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/30" : 
                          r.status === 'pending' ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30" :
                          r.status === 'rejected' ? "bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/30" :
                          r.status === 'approved' ? "bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/30" :
                          "bg-slate-500/10 text-slate-500"
                       )}>
                          {r.status}
                       </span>
                    </td>
                    <td className="px-6 py-8 font-mono text-xs text-slate-500">
                       <p>ISRC: {r.isrc || "---"}</p>
                       <p>UPC: {r.upc || "---"}</p>
                    </td>
                    <td className="px-12 py-8 text-right">
                       <Link to={`/admin/review/${r.id}`} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-brand-purple transition-all inline-flex">
                          <ArrowRight className="w-5 h-5" />
                       </Link>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  </div>
);
}
