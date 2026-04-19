import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../App";
import { 
  Youtube, 
  UserCheck, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Info,
  BadgeCheck,
  Zap
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";

export default function OACRequest() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ artistId: "", channelUrl: "", topicUrl: "", vevoUrl: "" });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    const aSnap = await getDocs(query(collection(db, "artists"), where("userId", "==", user.uid)));
    setArtists(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const qSnap = await getDocs(query(collection(db, "oac_requests"), where("userId", "==", user.uid), orderBy("createdAt", "desc")));
    setRequests(qSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.artistId || !formData.channelUrl) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "oac_requests"), {
        ...formData,
        userId: user.uid,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setFormData({ artistId: "", channelUrl: "", topicUrl: "", vevoUrl: "" });
      fetchData();
      alert("OAC upgrade request submitted.");
    } catch (err) {
      alert("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 animate-pulse text-slate-400">Syncing Verifications...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-4xl mx-auto space-y-12">
         <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue/10 rounded-full text-[10px] font-black text-brand-blue uppercase tracking-widest border border-brand-blue/10">
               <Zap className="w-3 h-3" /> Digital Identity Upgrade
            </div>
            <h1 className="text-6xl font-black font-display tracking-tight uppercase">OFFICIAL <span className="text-brand-blue">ARTIST</span> CHANNEL</h1>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">Consolidate your YouTube footprint into a single, verified master channel with the music note badge.</p>
         </div>

         <div className="grid md:grid-cols-3 gap-8">
            {[
               { icon: BadgeCheck, title: "Verified Badge", desc: "Get the prestigious music note identity marker." },
               { icon: Youtube, title: "Consolidated View", desc: "Merge your personal and topic channels." },
               { icon: Zap, title: "Priority Support", desc: "Higher visibility in the YouTube Music algorithm." }
            ].map((feature, i) => (
               <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-slate-50 shadow-sm text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-50 text-brand-blue rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                     <feature.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-black font-display uppercase tracking-tight">{feature.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">{feature.desc}</p>
               </div>
            ))}
         </div>

         <div className="bg-brand-dark rounded-[4rem] p-16 text-white relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-brand-blue/20 to-brand-purple/20 opacity-30"></div>
            <div className="relative z-10 space-y-12">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/20">
                     <Youtube className="w-8 h-8 text-white fill-white" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black font-display uppercase tracking-tight text-left">Upgrade Manifest</h2>
                     <p className="text-white/40 font-medium text-left">Ensure you have 3+ official releases via IND Distribution.</p>
                  </div>
               </div>

               <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Select Registered Artist</label>
                     <select 
                       required
                       value={formData.artistId}
                       onChange={(e) => setFormData({...formData, artistId: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm font-bold text-white outline-none focus:border-brand-blue transition-all appearance-none"
                     >
                        <option value="" className="bg-brand-dark">Select Artist</option>
                        {artists.map(a => <option key={a.id} value={a.id} className="bg-brand-dark">{a.name}</option>)}
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Personal Channel URI</label>
                     <input 
                        required
                        value={formData.channelUrl}
                        onChange={(e) => setFormData({...formData, channelUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm font-bold text-white outline-none focus:border-brand-blue transition-all"
                        placeholder="youtube.com/@username"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Topic Channel URI (Optional)</label>
                     <input 
                        value={formData.topicUrl}
                        onChange={(e) => setFormData({...formData, topicUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm font-bold text-white outline-none focus:border-brand-blue transition-all"
                        placeholder="youtube.com/channel/..."
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Vevo Channel URI (If any)</label>
                     <input 
                        value={formData.vevoUrl}
                        onChange={(e) => setFormData({...formData, vevoUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm font-bold text-white outline-none focus:border-brand-blue transition-all"
                        placeholder="youtube.com/@ArtistVEVO"
                     />
                  </div>
                  <button 
                    disabled={submitting}
                    className="md:col-span-2 py-6 bg-brand-blue text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
                  >
                     {submitting ? "Initiating Upgrade..." : "Request OAC Integration"}
                  </button>
               </form>

               <div className="pt-8 border-t border-white/5 flex items-start gap-4 text-white/40">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <p className="text-[10px] font-medium leading-relaxed italic">By submitting this request, you authorize IND Distribution to interact with YouTube Content ID and Artist interfaces on your behalf for the purpose of identity consolidation.</p>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <h3 className="text-3xl font-black font-display tracking-tight uppercase flex items-center gap-4">
               <Clock className="w-8 h-8 text-brand-blue" /> Request Catalog
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
               {requests.map((r, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={r.id} 
                    className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col gap-4 group"
                  >
                     <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-slate-50 text-brand-blue rounded-2xl flex items-center justify-center">
                           <Youtube className="w-6 h-6 fill-brand-blue" />
                        </div>
                        <span className={cn(
                           "text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border",
                           r.status === 'approved' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                           r.status === 'pending' ? "bg-brand-blue/5 border-brand-blue/10 text-brand-blue" : "bg-rose-50 border-rose-100 text-rose-600"
                        )}>{r.status}</span>
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">OAC Upgrade Signal</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</p>
                     </div>
                     <div className="pt-4 border-t border-slate-50">
                        <a href={r.channelUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-[10px] font-black uppercase text-brand-blue tracking-[0.2em] group-hover:underline">
                           View Manifest <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                     </div>
                  </motion.div>
               ))}
            </div>
            {requests.length === 0 && (
              <div className="py-20 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                 <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No upgrade signals detected</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
