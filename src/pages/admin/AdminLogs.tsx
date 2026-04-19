import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Terminal, Shield, User, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      // Aggregate logs from multiple collections to show activity
      const rSnap = await getDocs(query(collection(db, "releases"), orderBy("createdAt", "desc"), limit(10)));
      const uSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(10)));
      const oSnap = await getDocs(query(collection(db, "oac_requests"), orderBy("createdAt", "desc"), limit(10)));

      const combined = [
        ...rSnap.docs.map(d => ({ ...d.data(), id: d.id, logType: 'release', time: d.data().createdAt })),
        ...uSnap.docs.map(d => ({ ...d.data(), id: d.id, logType: 'user', time: d.data().createdAt })),
        ...oSnap.docs.map(d => ({ ...d.data(), id: d.id, logType: 'oac', time: d.data().createdAt }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20);

      setLogs(combined);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
         <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight uppercase">Security Logs</h1>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-2">Real-time surveillance of network signals and administrative changes.</p>
         </div>
         <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Security Core Nominal</span>
         </div>
      </div>

      <div className="bg-slate-950 rounded-[3rem] border border-slate-900 p-8 md:p-12 font-mono relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
         
         <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-900">
            <Terminal className="w-6 h-6 text-brand-blue" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Live Transaction Stream</span>
         </div>

         <div className="space-y-4">
            {logs.map((log, i) => (
               <div key={i} className="flex gap-6 p-4 hover:bg-white/5 rounded-xl transition-colors group">
                  <span className="text-[10px] text-slate-700 mt-1 whitespace-nowrap">{(new Date(log.time)).toLocaleTimeString()}</span>
                  <div className="flex-1 flex gap-4">
                     <span className={cn(
                        "text-[10px] uppercase px-3 py-1 rounded h-fit font-black",
                        log.logType === "release" ? "bg-brand-blue/10 text-brand-blue" :
                        log.logType === "user" ? "bg-amber-500/10 text-amber-500" : "bg-brand-purple/10 text-brand-purple"
                     )}>
                        {log.logType}
                     </span>
                     <div>
                        <p className="text-xs text-slate-300 font-bold">
                           {log.logType === 'release' ? `New transmission initiated: ${log.title}` :
                            log.logType === 'user' ? `User entity authenticated: ${log.email}` :
                            `OAC verification request logged for user ${log.userId?.slice(0, 8)}`}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1">Transaction Hash: {log.id}</p>
                     </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-500/40 group-hover:text-emerald-500 transition-colors shrink-0" />
               </div>
            ))}

            {loading && (
               <div className="py-20 text-center text-slate-700 animate-pulse">Syncing with encrypted storage chains...</div>
            )}
         </div>

         <div className="mt-12 pt-12 border-t border-slate-900 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-700">
            <span>Protocol v4.0.2</span>
            <span className="text-blue-500/50">Listening on port 3000</span>
         </div>
      </div>
    </div>
  );
}
