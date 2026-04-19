import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Mic2, Search, MoreVertical, Globe, Smartphone, CheckCircle, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AdminArtists() {
  const [artists, setArtists] = useState<any[]>([]);

  useEffect(() => {
    const fetchArtists = async () => {
      const q = query(collection(db, "artists"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setArtists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchArtists();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-5xl font-black font-display tracking-tight uppercase">Artist Index</h1>
           <p className="text-slate-400 font-medium">Verified artist identities and professional metadata profiles.</p>
        </div>
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
           <input 
             placeholder="Search artists..."
             className="bg-[#1E293B] border-slate-700 rounded-2xl py-4 pl-14 pr-8 text-sm focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium min-w-[300px]"
           />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         {artists.map((artist, i) => (
           <div key={i} className="bg-[#1E293B] p-10 rounded-[4rem] border border-slate-800 hover:border-brand-purple transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex items-center justify-between mb-8">
                 <div className="w-20 h-20 rounded-[2rem] bg-slate-800 flex items-center justify-center border-4 border-slate-900 group-hover:rotate-6 transition-transform shadow-2xl">
                    <Mic2 className="w-10 h-10 text-brand-purple" />
                 </div>
                 <button className="p-3 text-slate-600 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                 </button>
              </div>
              <div className="space-y-2 mb-8">
                 <h3 className="text-2xl font-black font-display text-white uppercase tracking-tight flex items-center gap-2">
                    {artist.name} <CheckCircle className="w-4 h-4 text-emerald-500" />
                 </h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Artist ID: {artist.id.slice(0, 10)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Total Tracks</p>
                    <p className="font-bold text-white uppercase text-xs">24 Records</p>
                 </div>
                 <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
                    <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Status</p>
                    <p className="font-bold text-emerald-500 uppercase text-xs">Verified</p>
                 </div>
              </div>
           </div>
         ))}
         {artists.length === 0 && (
           <div className="col-span-full py-20 text-center bg-[#1E293B]/50 rounded-[4rem] border-2 border-dashed border-slate-800">
              <Mic2 className="w-16 h-16 text-slate-700 mx-auto mb-6" />
              <p className="text-slate-500 font-bold uppercase tracking-widest">No verified artists found in directory.</p>
           </div>
         )}
      </div>
    </div>
  );
}
