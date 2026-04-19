import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Building, Search, MoreVertical, Globe, CheckCircle, ShieldCheck, Music, Users } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AdminLabels() {
  const [labels, setLabels] = useState<any[]>([]);

  useEffect(() => {
    const fetchLabels = async () => {
      const q = query(collection(db, "labels"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setLabels(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchLabels();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-5xl font-black font-display tracking-tight uppercase">Master Labels</h1>
           <p className="text-slate-400 font-medium">Manage distribution agreements and primary label entities.</p>
        </div>
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
           <input 
             placeholder="Search labels..."
             className="bg-[#1E293B] border-slate-700 rounded-2xl py-4 pl-14 pr-8 text-sm focus:ring-2 focus:ring-brand-purple/20 transition-all font-medium min-w-[300px]"
           />
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-[3.5rem] border border-slate-800 p-12">
         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {labels.map((label, i) => (
              <div key={i} className="p-8 bg-slate-900/50 rounded-[2.5rem] border border-slate-800 hover:border-brand-blue transition-all group">
                 <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-6 group-hover:rotate-12 transition-transform">
                    <Building className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-black font-display text-white uppercase mb-2 tracking-tight truncate">{label.name}</h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Group Entity: IND Global</p>
                 
                 <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                       <Music className="w-3 h-3" /> 140 Assets
                    </div>
                    <button className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline">Manage Account</button>
                 </div>
              </div>
            ))}
            {labels.length === 0 && (
              <div className="col-span-full py-20 text-center">
                 <Building className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-20" />
                 <p className="text-slate-500 font-bold uppercase tracking-widest">No label entities provisioned.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
