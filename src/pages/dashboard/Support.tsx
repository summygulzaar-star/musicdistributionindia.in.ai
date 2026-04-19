import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../App";
import { MessageSquare, Send, Clock, CheckCircle2, AlertCircle, HelpCircle, LifeBuoy } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function Support() {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("General Inquiry");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    if (!user) return;
    const q = query(collection(db, "support_tickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject || !message) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, "support_tickets"), {
        userId: user.uid,
        userName: profile?.displayName || "Artist",
        userEmail: user.email,
        subject,
        message,
        type,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setSubject("");
      setMessage("");
      fetchTickets();
      alert("Support ticket transmitted. Our task force will respond shortly.");
    } catch (err) {
      alert("Transmission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row gap-12">
         {/* New Ticket Form */}
         <div className="flex-1 space-y-8">
            <h1 className="text-5xl font-black font-display tracking-tight uppercase">Support <span className="text-brand-blue">Nexus</span></h1>
            <p className="text-slate-400 font-medium">Connect with our technical support team for priority assistance and issue resolution.</p>

            <div className="bg-white rounded-[4rem] p-10 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                        <MessageSquare className="w-8 h-8" />
                     </div>
                     <h3 className="text-2xl font-black font-display uppercase tracking-tight">Open New Ticket</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Subject</label>
                           <input 
                              required
                              value={subject}
                              onChange={e => setSubject(e.target.value)}
                              placeholder="Describe the issue in 5-6 words..."
                              className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-blue/10 transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category</label>
                           <select 
                              value={type}
                              onChange={e => setType(e.target.value)}
                              className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none appearance-none"
                           >
                              <option>General Inquiry</option>
                              <option>Technical Issue</option>
                              <option>Financial Tracking</option>
                              <option>Asset Discrepancy</option>
                              <option>Account Security</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Detailed Signal</label>
                        <textarea 
                           required
                           rows={5}
                           value={message}
                           onChange={e => setMessage(e.target.value)}
                           placeholder="Explain the technical situation in detail..."
                           className="w-full bg-slate-50 border-slate-100 rounded-3xl p-6 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-blue/10 transition-all leading-relaxed"
                        />
                     </div>
                     <button 
                        disabled={submitting}
                        className="w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-blue transition-all disabled:opacity-50 active:scale-95 shadow-2xl shadow-slate-900/20"
                     >
                        {submitting ? "TRANSMITTING DATA..." : "SUBMIT TICKET"}
                     </button>
                  </form>
               </div>
            </div>
         </div>

         {/* Ticket History */}
         <div className="w-full lg:w-[400px] space-y-8">
            <h2 className="text-2xl font-black font-display tracking-tight uppercase flex items-center gap-4">
               <Clock className="w-6 h-6 text-brand-blue" /> Support Log
            </h2>
            <div className="space-y-6">
               {tickets.map((t, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={t.id} 
                    className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-4 group hover:shadow-xl transition-all"
                  >
                     <div className="flex items-start justify-between">
                        <span className={cn(
                           "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                           t.status === 'resolved' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600"
                        )}>{t.status}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</span>
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-900 uppercase text-xs tracking-tight group-hover:text-brand-blue transition-colors">{t.subject}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">{t.type}</p>
                     </div>
                     <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 italic">"{t.message}"</p>
                  </motion.div>
               ))}
               {tickets.length === 0 && (
                  <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                     <LifeBuoy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No support transmissions documented</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
