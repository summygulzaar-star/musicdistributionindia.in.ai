import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../App";
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Mic2, 
  Instagram, 
  Music,
  Plus,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { Camera, UploadCloud } from "lucide-react";

export default function Artists() {
  const { user } = useAuth();
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", instagramId: "", bio: "", imageUrl: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData({ ...formData, imageUrl: url });
    } catch (err) {
      alert("Image upload failure");
    } finally {
      setUploading(false);
    }
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const snap = await getDocs(query(collection(db, "artists"), where("userId", "==", user.uid)));
    setArtists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (editingArtist) {
        await updateDoc(doc(db, "artists", editingArtist.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, "artists"), {
          ...formData,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      }
      setShowModal(false);
      setEditingArtist(null);
      setFormData({ name: "", instagramId: "", bio: "", imageUrl: "" });
      fetchData();
    } catch (err) {
      alert("Error saving artist profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will remove the artist profile from your catalog.")) {
      await deleteDoc(doc(db, "artists", id));
      fetchData();
    }
  };

  if (loading) return <div className="p-10 animate-pulse text-slate-400">Loading Artists...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-5xl font-black font-display tracking-tight uppercase">Artist <span className="text-brand-blue">Roster</span></h1>
            <p className="text-slate-400 font-medium">Manage your creative identities and digital personas.</p>
         </div>
         <button 
           onClick={() => { setEditingArtist(null); setFormData({ name: "", instagramId: "", bio: "", imageUrl: "" }); setShowModal(true); }}
           className="btn-premium btn-glow py-4 px-10 flex items-center gap-2"
         >
            <UserPlus className="w-5 h-5" /> Register Artist
         </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         {artists.map((artist, i) => (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               key={artist.id} 
               className="bg-white rounded-[3.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-bl-[4rem] group-hover:scale-150 transition-transform"></div>
               
               <div className="flex items-start justify-between relative z-10">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-50 border-4 border-white shadow-xl group-hover:rotate-3 transition-transform">
                     {artist.imageUrl ? (
                        <img src={artist.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                           <Mic2 className="w-10 h-10" />
                        </div>
                     )}
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => { setEditingArtist(artist); setFormData(artist); setShowModal(true); }} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-white transition-all">
                        <Edit className="w-4 h-4" />
                     </button>
                     <button onClick={() => handleDelete(artist.id)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-all">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               <div className="mt-8 space-y-4 relative z-10">
                  <h3 className="text-2xl font-black font-display tracking-tight uppercase truncate">{artist.name}</h3>
                  <div className="flex items-center gap-3">
                     <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        verified
                     </div>
                     {artist.instagramId && (
                       <a href={`https://instagram.com/${artist.instagramId}`} target="_blank" rel="noreferrer" className="text-rose-500 hover:scale-110 transition-transform">
                          <Instagram className="w-4 h-4" />
                       </a>
                     )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-2 h-8">
                     {artist.bio || "No biography provided for this creative asset."}
                  </p>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-slate-400">
                        <Music className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Active Catalog</span>
                     </div>
                     <span className="font-black text-brand-blue">View Releases</span>
                  </div>
               </div>
            </motion.div>
         ))}

         {artists.length === 0 && (
            <div className="col-span-full py-40 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-100">
               <UserPlus className="w-16 h-16 mx-auto mb-6 text-slate-200" />
               <p className="text-sm font-black text-slate-300 uppercase tracking-widest leading-relaxed px-12">
                  No artist identities registered in this mission.<br/>Deploy one to begin distribution.
               </p>
            </div>
         )}
      </div>

      {/* Modern Modal */}
      <AnimatePresence>
         {showModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[200] flex items-center justify-center p-6"
            >
               <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white w-full max-w-lg rounded-[4rem] p-12 relative shadow-3xl border border-white"
               >
                  <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
                     <X className="w-8 h-8" />
                  </button>

                  <div className="space-y-10">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-brand-blue rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
                           <UserPlus className="w-8 h-8" />
                        </div>
                        <div>
                           <h2 className="text-3xl font-black font-display uppercase tracking-tight">{editingArtist ? "Edit" : "Register"} Profile</h2>
                           <p className="text-slate-400 font-medium">Digital Identity Configuration</p>
                        </div>
                     </div>

                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Artist Name</label>
                           <input 
                             required
                             value={formData.name}
                             onChange={(e) => setFormData({...formData, name: e.target.value})}
                             className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                             placeholder="Stage Name"
                           />
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Instagram Username</label>
                           <div className="relative">
                              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">@</span>
                              <input 
                                value={formData.instagramId}
                                onChange={(e) => setFormData({...formData, instagramId: e.target.value})}
                                className="w-full bg-slate-50 border-none rounded-3xl p-5 pl-12 text-sm font-bold focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                                placeholder="handle"
                              />
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Profile Image</label>
                           <div className="flex items-center gap-6">
                              <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group relative">
                                 {formData.imageUrl ? (
                                   <img src={formData.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                 ) : (
                                   <Camera className="w-8 h-8 text-slate-200" />
                                 )}
                                 {uploading && (
                                   <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                      <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                                   </div>
                                 )}
                              </div>
                              <div className="flex-1 space-y-2">
                                 <div className="relative">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                       <UploadCloud className="w-4 h-4" /> {uploading ? "Uploading..." : "Transmit Face Data"}
                                    </div>
                                 </div>
                                 <input 
                                   value={formData.imageUrl}
                                   onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                   className="w-full bg-transparent border-none text-[8px] font-mono text-slate-300 truncate tracking-tight"
                                   placeholder="or paste URL"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Master Bio</label>
                           <textarea 
                             value={formData.bio}
                             onChange={(e) => setFormData({...formData, bio: e.target.value})}
                             rows={4}
                             className="w-full bg-slate-50 border-none rounded-[2rem] p-6 text-sm font-bold focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all leading-relaxed"
                             placeholder="Describe the creative vision..."
                           />
                        </div>

                        <button 
                           disabled={saving}
                           className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-brand-blue transition-all disabled:opacity-50 shadow-2xl"
                        >
                           {saving ? "Transmitting..." : editingArtist ? "Update Manifest" : "Register Profile"}
                        </button>
                     </form>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
