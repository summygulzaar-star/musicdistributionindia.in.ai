import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../App";
import { 
  Youtube, 
  ShieldCheck, 
  AlertCircle, 
  Plus, 
  Music,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";

export default function ContentID() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ releaseId: "", youtubeUrl: "", type: "whitelist" as const });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    const rSnap = await getDocs(query(collection(db, "releases"), where("userId", "==", user.uid), where("status", "==", "live")));
    setReleases(rSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const qSnap = await getDocs(query(collection(db, "content_id_requests"), where("userId", "==", user.uid), orderBy("createdAt", "desc")));
    setRequests(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.releaseId || !formData.youtubeUrl) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "content_id_requests"), {
        ...formData,
        userId: user.uid,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setFormData({ releaseId: "", youtubeUrl: "", type: "whitelist" });
      fetchData();
      alert("Content ID request submitted.");
    } catch (err) {
      alert("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 animate-pulse text-slate-400">Loading Content Controls...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-8">
            <h1 className="text-5xl font-black font-display tracking-tight uppercase"><span className="text-brand-blue">YouTube</span> Content ID</h1>
            <p className="text-slate-400 font-medium">Protect your intellectual property and manage digital rights across the YouTube ecosystem.</p>
            
            <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40">
                        <Youtube className="w-6 h-6 fill-white" />
                     </div>
                     <h3 className="text-xl font-bold uppercase tracking-tight">Rights Activation Port</h3>
                  </div>
                  <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">Select Live Track</label>
                        <select 
                          required
                          value={formData.releaseId}
                          onChange={(e) => setFormData({...formData, releaseId: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-red-500 transition-all appearance-none"
                        >
                           <option value="" className="bg-slate-900">Select Track</option>
                           {releases.map(r => <option key={r.id} value={r.id} className="bg-slate-900">{r.title}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-4">YouTube URL / Link</label>
                        <input 
                           required
                           value={formData.youtubeUrl}
                           onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-red-500 transition-all"
                           placeholder="https://youtube.com/watch?v=..."
                        />
                     </div>
                     <div className="col-span-2 flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, type: 'whitelist'})}
                          className={cn("flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all", formData.type === 'whitelist' ? "bg-red-600 border-red-600 text-white shadow-xl shadow-red-900/40" : "bg-white/5 border-white/10 text-white/40 hover:text-white")}
                        >
                           Whitelist Channel
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, type: 'removal'})}
                          className={cn("flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all", formData.type === 'removal' ? "bg-red-600 border-red-600 text-white shadow-xl shadow-red-900/40" : "bg-white/5 border-white/10 text-white/40 hover:text-white")}
                        >
                           Claim Removal
                        </button>
                     </div>
                     <button 
                       disabled={submitting}
                       className="col-span-2 py-5 bg-white text-slate-950 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                     >
                        {submitting ? "Transmitting Signal..." : "Transmit Control Request"}
                     </button>
                  </form>
               </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-[2.5rem] p-8 flex items-start gap-6">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-blue shadow-lg">
                  <Info className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="font-black text-brand-blue uppercase text-sm tracking-tight mb-2">Network Knowledge</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">YouTube Content ID requests typically propagate within 48-72 standard business rotations. Ensure the target URL is accurate to prevent processing rejection.</p>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-6">
            <h3 className="text-2xl font-black font-display tracking-tight uppercase flex items-center gap-3">
               <Clock className="w-6 h-6 text-brand-blue" /> Request Log
            </h3>
            <div className="space-y-4">
               {requests.map((r, i) => (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={r.id} 
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col gap-4"
                  >
                     <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                           <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", r.type === 'whitelist' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                              {r.type === 'whitelist' ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{r.type}</span>
                        </div>
                        <span className={cn(
                           "text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                           r.status === 'completed' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                           r.status === 'pending' ? "bg-brand-blue/5 border-brand-blue/10 text-brand-blue" : "bg-rose-50 border-rose-100 text-rose-600"
                        )}>{r.status}</span>
                     </div>
                     <p className="text-[11px] font-bold text-slate-500 truncate">{r.youtubeUrl}</p>
                     <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</span>
                        <a href={r.youtubeUrl} target="_blank" rel="noreferrer" className="text-brand-blue hover:scale-110 transition-transform"><ExternalLink className="w-4 h-4" /></a>
                     </div>
                  </motion.div>
               ))}
               {requests.length === 0 && (
                 <div className="p-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 italic text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                   No signals transmitted
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
