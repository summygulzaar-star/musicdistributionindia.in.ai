import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Fingerprint, Search, ShieldCheck, ShieldAlert, Clock, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AdminContentID() {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    const q = query(collection(db, "content_id_requests"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "content_id_requests", id), { status });
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      alert("Status update signal failed.");
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <div className="text-left">
            <h1 className="text-5xl font-black font-display tracking-tight uppercase">Content ID Guard</h1>
            <p className="text-slate-400 font-medium text-xs tracking-widest uppercase mt-2">Protect digital footprints and manage fingerprinting assets.</p>
         </div>
         <div className="bg-brand-blue/10 border border-brand-blue/20 px-6 py-2 rounded-2xl flex items-center gap-4">
            <span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse shadow-[0_0_10px_#0066FF]"></span>
            <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Master Watch Engine Active</span>
         </div>
      </div>

      <div className="bg-[#1E293B] rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl">
         <table className="w-full text-left">
            <thead>
               <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  <th className="px-12 py-8">Asset Fingerprint</th>
                  <th className="px-6 py-8">User Entity</th>
                  <th className="px-6 py-8">Target URL</th>
                  <th className="px-6 py-8">Status</th>
                  <th className="px-12 py-8 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
               {requests.map((r, i) => (
                 <tr key={i} className="group hover:bg-slate-800/50 transition-colors">
                    <td className="px-12 py-8">
                       <p className="font-bold text-white uppercase text-sm tracking-tight">{r.type || "Global Asset Scan"}</p>
                       <p className="text-[10px] text-slate-500 uppercase mt-1">Ref Hash: {r.id.slice(0, 16)}</p>
                    </td>
                    <td className="px-6 py-8 font-bold text-slate-400 text-[10px] uppercase">UID: {r.userId?.slice(0, 8)}</td>
                    <td className="px-6 py-8 text-xs font-bold text-brand-blue hover:underline cursor-pointer truncate max-w-[200px]">{r.youtubeUrl}</td>
                    <td className="px-6 py-8">
                       <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          r.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                       )}>
                          {r.status}
                       </span>
                    </td>
                    <td className="px-12 py-8 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => updateStatus(r.id, "completed")}
                            className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/20"
                          >
                             Approve
                          </button>
                          <button 
                            onClick={() => updateStatus(r.id, "rejected")}
                            className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/20"
                          >
                             Reject
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
               {requests.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-12 py-24 text-center">
                       <Fingerprint className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-20" />
                       <p className="text-slate-500 font-bold uppercase tracking-widest">No fingerprinting requests in queue.</p>
                    </td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
}
