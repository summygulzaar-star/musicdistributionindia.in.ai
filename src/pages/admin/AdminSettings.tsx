import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Settings, Shield, Globe, Database, Save, Zap, Music, Smartphone, Bell } from "lucide-react";
import { cn } from "../../lib/utils";

export default function AdminSettings() {
  const [config, setConfig] = useState<any>({
    siteName: "IND Distribution",
    maintenanceMode: false,
    platformFee: 15,
    minimumWithdrawal: 1000,
    supportedPlatforms: ["Spotify", "Apple Music", "JioSaavn", "Gaana", "YT Music", "Instagram", "Amazon", "Wynk", "Snapchat", "Facebook"]
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const docSnap = await getDoc(doc(db, "system", "config"));
      if (docSnap.exists()) {
        setConfig({ ...config, ...docSnap.data() });
      }
    };
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "system", "config"), config);
      alert("System configuration synchronized successfully.");
    } catch (err) {
      alert("Failed to synchronize system configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight uppercase">Core Configuration</h1>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-2 px-4 md:px-0">Manage global system parameters and platform behaviors.</p>
         </div>
         <button 
           onClick={saveConfig}
           disabled={saving}
           className="px-10 py-5 bg-brand-blue text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
         >
            <Save className="w-5 h-5" /> 
            {saving ? "SYNCHRONIZING..." : "SAVE ALL CHANGES"}
         </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-10">
            {/* General Settings */}
            <div className="bg-[#1E293B] p-10 rounded-[3rem] border border-slate-800 space-y-10 shadow-2xl">
               <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-4 uppercase">
                  <Globe className="text-brand-blue w-8 h-8" /> General Parameters
               </h3>
               
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Network Title</label>
                     <input 
                       value={config.siteName}
                       onChange={e => setConfig({...config, siteName: e.target.value})}
                       className="w-full bg-slate-900 border-slate-700 p-6 rounded-3xl font-bold text-white focus:ring-2 focus:ring-brand-blue/20"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Platform Revenue Fee (%)</label>
                     <input 
                       type="number"
                       value={config.platformFee}
                       onChange={e => setConfig({...config, platformFee: parseInt(e.target.value)})}
                       className="w-full bg-slate-900 border-slate-700 p-6 rounded-3xl font-bold text-white focus:ring-2 focus:ring-brand-blue/20"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 italic">Minimum Withdrawal (INR)</label>
                     <input 
                       type="number"
                       value={config.minimumWithdrawal}
                       onChange={e => setConfig({...config, minimumWithdrawal: parseInt(e.target.value)})}
                       className="w-full bg-slate-900 border-slate-700 p-6 rounded-3xl font-bold text-white focus:ring-2 focus:ring-brand-blue/20"
                     />
                  </div>
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
                     <div>
                        <p className="text-xs font-black text-white uppercase tracking-tight">Maintenance Mode</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Restrict external access</p>
                     </div>
                     <button 
                       onClick={() => setConfig({...config, maintenanceMode: !config.maintenanceMode})}
                       className={cn(
                         "w-14 h-8 rounded-full relative transition-all",
                         config.maintenanceMode ? "bg-rose-500" : "bg-slate-800"
                       )}
                     >
                        <div className={cn("absolute top-1 w-6 h-6 bg-white rounded-full transition-all", config.maintenanceMode ? "right-1" : "left-1")}></div>
                     </button>
                  </div>
               </div>
            </div>

            {/* Platform Controls */}
            <div className="bg-[#1E293B] p-10 rounded-[3rem] border border-slate-800 space-y-10 shadow-2xl">
               <h3 className="text-2xl font-black font-display tracking-tight flex items-center gap-4 uppercase">
                  <Smartphone className="text-brand-purple w-8 h-8" /> Distribution Network
               </h3>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {["Spotify", "Apple Music", "JioSaavn", "Gaana", "YT Music", "Instagram", "Amazon", "Wynk", "Snapchat", "Facebook", "TikTok", "Deezer", "Tidal", "Pandora"].map(p => (
                     <button
                       key={p}
                       onClick={() => {
                          const exists = config.supportedPlatforms.includes(p);
                          if (exists) {
                             setConfig({...config, supportedPlatforms: config.supportedPlatforms.filter((item: string) => item !== p)});
                          } else {
                             setConfig({...config, supportedPlatforms: [...config.supportedPlatforms, p]});
                          }
                       }}
                       className={cn(
                         "p-4 rounded-2xl border-2 font-black text-[9px] uppercase tracking-widest transition-all",
                         config.supportedPlatforms.includes(p) ? "bg-brand-purple/10 border-brand-purple text-brand-purple" : "bg-slate-900 border-slate-800 text-slate-500 opacity-60"
                       )}
                     >
                        {p}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-10">
            <div className="bg-slate-950 p-10 rounded-[3rem] text-white space-y-10 shadow-2xl border border-slate-800">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                     <Shield className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-black font-display uppercase tracking-tight">Security Core</h4>
               </div>
               
               <div className="space-y-6">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Strict 2FA Enforcement</span>
                     <div className="w-10 h-6 bg-brand-blue rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/60">API Key Encryption</span>
                     <div className="w-10 h-6 bg-brand-blue rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                  </div>
               </div>

               <div className="pt-10 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 italic">Security Level: Enterprise</p>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full w-full bg-linear-to-r from-brand-blue to-cyan-400 rounded-full"></div>
                  </div>
               </div>
            </div>

            <div className="bg-[#1E293B] p-10 rounded-[3rem] border border-slate-800 space-y-6 shadow-2xl">
               <h4 className="text-lg font-black font-display uppercase tracking-tight flex items-center gap-3">
                  <Database className="w-5 h-5 text-slate-500" /> Infrastructure
               </h4>
               <div className="space-y-4">
                  {[
                     { label: "Database Instances", val: "Cloud Firestore v2" },
                     { label: "Storage Engine", val: "Cloudinary (Optimized)" },
                     { label: "Identity Core", val: "Firebase Auth" },
                     { label: "CDN Protocol", val: "Edge Global" }
                  ].map((item, i) => (
                     <div key={i} className="flex flex-col gap-1 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                        <span className="text-xs font-bold text-slate-300">{item.val}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
