import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  ArrowLeft, 
  Music, 
  Globe, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function AssetView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [release, setRelease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelease = async () => {
      if (!id) return;
      const d = await getDoc(doc(db, "releases", id));
      if (d.exists()) {
        setRelease({ id: d.id, ...d.data() });
      }
      setLoading(false);
    };
    fetchRelease();
  }, [id]);

  if (loading) return <div className="p-10 text-slate-400 animate-pulse uppercase font-black tracking-widest">Retrieving Digital Asset...</div>;
  if (!release) return <div className="p-10 text-slate-400 uppercase font-black tracking-widest">Asset not found.</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 pb-32 space-y-12">
      <div className="flex items-center gap-6">
        <button onClick={() => navigate("/dashboard/releases")} className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-4xl font-black font-display uppercase tracking-tight">{release.songName}</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Status: {release.status}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="space-y-8">
           <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
              <img src={release.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
           </div>
           
           <div className={cn(
             "p-8 rounded-[2.5rem] flex items-center gap-4 border-2",
             release.status === 'live' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
             release.status === 'pending' ? "bg-amber-50 border-amber-100 text-amber-600" :
             "bg-rose-50 border-rose-100 text-rose-600"
           )}>
              {release.status === 'live' ? <CheckCircle2 className="w-8 h-8" /> : 
               release.status === 'pending' ? <Clock className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Distribution Status</p>
                 <p className="text-lg font-black font-display uppercase tracking-tight">{release.status}</p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-12">
           <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-50 space-y-10 text-left">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                 <ShieldCheck className="w-8 h-8 text-brand-blue" />
                 <h3 className="text-2xl font-black font-display uppercase tracking-tight">Verified Metadata</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                 {[
                   { label: "Artist", val: release.singerName },
                   { label: "Label", val: release.labelName },
                   { label: "Composer", val: release.composer },
                   { label: "Lyricist", val: release.lyricist },
                   { label: "Genre", val: `${release.primaryGenre} / ${release.secondaryGenre}` },
                   { label: "Language", val: release.language },
                   { label: "ISRC", val: release.isrc || "Assigned during live" },
                   { label: "UPC", val: release.upc || "Assigned during live" },
                 ].map(f => (
                   <div key={f.label}>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{f.label}</p>
                      <p className="font-bold text-slate-800">{f.val}</p>
                   </div>
                 ))}
              </div>
           </div>

           {release.status === 'live' && release.platformLinks && (
             <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-50 space-y-8">
                <div className="flex items-center gap-4">
                   <Globe className="w-8 h-8 text-emerald-500" />
                   <h3 className="text-2xl font-black font-display uppercase tracking-tight">Live Distribution Links</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {Object.entries(release.platformLinks).map(([p, link]) => (
                     <a key={p} href={link as string} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-slate-950 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/40">{p}</span>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-white" />
                     </a>
                   ))}
                </div>
             </div>
           )}
           
           {release.status === 'rejected' && (
             <div className="bg-rose-50 border-2 border-rose-100 p-10 rounded-[3rem] space-y-4">
                <div className="flex items-center gap-4 text-rose-500">
                   <AlertCircle className="w-8 h-8" />
                   <h3 className="text-xl font-black font-display uppercase">Administrative Termination</h3>
                </div>
                <p className="text-sm font-bold text-slate-600 leading-relaxed italic pr-4">" {release.adminNotes || "Metadata discrepancy or audio quality violation."} "</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Please audit your assets and deploy a new release.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
