import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Bell, Send, Trash2, Clock, Globe, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"info" | "warning" | "urgent">("info");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const q = query(collection(db, "system_notifications"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !title) return;
    
    setIsSending(true);
    try {
      await addDoc(collection(db, "system_notifications"), {
        title,
        message,
        type,
        createdAt: new Date().toISOString(),
      });
      setTitle("");
      setMessage("");
      fetchNotifications();
    } catch (err) {
      alert("Failed to deploy notification.");
    } finally {
      setIsSending(false);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm("Deactivate this transmission?")) return;
    try {
      await deleteDoc(doc(db, "system_notifications", id));
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      alert("Deletion failure.");
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight uppercase">Broadcast Hub</h1>
            <p className="text-slate-400 font-medium text-[10px] md:text-xs uppercase tracking-widest mt-2 px-4 md:px-0">Manage global system announcements and security alerts.</p>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
         {/* Broadcast Form */}
         <div className="bg-[#1E293B] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 p-8 md:p-12 space-y-8 shadow-2xl">
            <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-4 uppercase">
               <Send className="text-brand-blue w-8 h-8" /> New Transmission
            </h3>
            
            <form onSubmit={sendNotification} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Notification Title</label>
                  <input 
                    required 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. System Maintenance Scheduled"
                    className="w-full bg-slate-900 border-slate-700 p-5 rounded-3xl text-sm font-bold text-white focus:ring-2 focus:ring-brand-blue/20" 
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Transmission Type</label>
                  <div className="grid grid-cols-3 gap-4">
                     {[
                       { id: 'info', icon: Globe, color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/20' },
                       { id: 'warning', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                       { id: 'urgent', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
                     ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setType(t.id as any)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                            type === t.id ? t.border + " " + t.bg : "border-slate-800 bg-slate-900/50 opacity-40"
                          )}
                        >
                           <t.icon className={cn("w-5 h-5", t.color)} />
                           <span className={cn("text-[9px] font-black uppercase tracking-widest", t.color)}>{t.id}</span>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Message Payload</label>
                  <textarea 
                    required 
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe the bulletin details..."
                    className="w-full bg-slate-900 border-slate-700 p-6 rounded-[2rem] text-sm font-black text-white leading-relaxed focus:ring-2 focus:ring-brand-blue/20" 
                  />
               </div>

               <button 
                 type="submit" 
                 disabled={isSending}
                 className="w-full py-5 bg-brand-blue text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
               >
                 {isSending ? "ENCRYPTING DATA..." : "DEPLOY BROADCAST"}
               </button>
            </form>
         </div>

         {/* Active Transmissions */}
         <div className="bg-[#1E293B] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 p-8 md:p-12 space-y-8 shadow-2xl relative overflow-hidden">
            <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-4 uppercase">
               <Bell className="text-amber-500 w-8 h-8" /> Active Bulletins
            </h3>

            <div className="space-y-6 max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
               {notifications.map((n) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={n.id} 
                    className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 relative group"
                  >
                     <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                           <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center",
                             n.type === 'urgent' ? 'bg-rose-500/10 text-rose-500' : 
                             n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-brand-blue/10 text-brand-blue'
                           )}>
                              {n.type === 'urgent' ? <ShieldAlert className="w-5 h-5" /> : 
                               n.type === 'warning' ? <Bell className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                           </div>
                           <div>
                              <p className="font-black text-white text-xs uppercase tracking-wider">{n.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <Clock className="w-3 h-3 text-slate-600" />
                                 <span className="text-[9px] font-bold text-slate-600 uppercase">{new Date(n.createdAt).toLocaleString()}</span>
                              </div>
                           </div>
                        </div>
                        <button 
                          onClick={() => deleteNotification(n.id)}
                          className="p-2 text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed">{n.message}</p>
                  </motion.div>
               ))}

               {notifications.length === 0 && (
                  <div className="py-20 text-center flex flex-col items-center gap-4 opacity-20">
                     <Send className="w-16 h-16 text-slate-500" />
                     <p className="text-sm font-black uppercase tracking-widest text-slate-500">No active transmissions</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
