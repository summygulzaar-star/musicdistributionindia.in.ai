import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../App";
import { 
  Building, 
  Trash2, 
  Edit, 
  X,
  Globe,
  Plus,
  Rocket
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

export default function Labels() {
  const { user } = useAuth();
  const [labels, setLabels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLabel, setEditingLabel] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", logoUrl: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData({ ...formData, logoUrl: url });
    } catch (err) {
      alert("Logo transmission failed");
    } finally {
      setUploading(false);
    }
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const snap = await getDocs(query(collection(db, "labels"), where("userId", "==", user.uid)));
    setLabels(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
      if (editingLabel) {
        await updateDoc(doc(db, "labels", editingLabel.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, "labels"), {
          ...formData,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      }
      setShowModal(false);
      setEditingLabel(null);
      setFormData({ name: "", logoUrl: "" });
      fetchData();
    } catch (err) {
      alert("Error saving label.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteDoc(doc(db, "labels", id));
      fetchData();
    }
  };

  if (loading) return <div className="p-10 animate-pulse text-slate-400">Loading Corporate Registry...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-5xl font-black font-display tracking-tight uppercase">Label <span className="text-brand-blue">Registry</span></h1>
            <p className="text-slate-400 font-medium tracking-tight">Corporate entities and distribution portals.</p>
         </div>
         <button 
           onClick={() => { setEditingLabel(null); setFormData({ name: "", logoUrl: "" }); setShowModal(true); }}
           className="btn-premium bg-slate-900 text-white py-4 px-10 flex items-center gap-2 hover:bg-brand-blue"
         >
            <Building className="w-5 h-5" /> Register Entity
         </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
         {labels.map((label, i) => (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               key={label.id} 
               className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden"
            >
               <div className="flex flex-col items-center gap-6 relative z-10 text-center">
                  <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center p-6 group-hover:scale-110 transition-transform">
                     {label.logoUrl ? (
                        <img src={label.logoUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                     ) : (
                        <Building className="w-12 h-12 text-slate-200" />
                     )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black font-display tracking-tight uppercase truncate max-w-[200px]">{label.name}</h3>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Active Entity</p>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                     <button onClick={() => { setEditingLabel(label); setFormData(label); setShowModal(true); }} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand-blue transition-all">
                        <Edit className="w-5 h-5" />
                     </button>
                     <button onClick={() => handleDelete(label.id)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                        <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </motion.div>
         ))}

         {labels.length === 0 && (
            <div className="col-span-full py-40 text-center bg-slate-100/50 rounded-[4rem] border-2 border-dashed border-slate-200">
               <Building className="w-16 h-16 mx-auto mb-6 text-slate-300" />
               <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">No registered entities detected.</p>
            </div>
         )}
      </div>

      <AnimatePresence>
         {showModal && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6"
            >
               <motion.div 
                  initial={{ scale: 0.8, y: 50, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  className="bg-white w-full max-w-md rounded-[3.5rem] p-12 relative shadow-2xl overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand-blue/5 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <button onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 transition-colors">
                     <X className="w-7 h-7" />
                  </button>

                  <div className="space-y-10 relative z-10">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl">
                           <Rocket className="w-8 h-8" />
                        </div>
                        <div>
                           <h2 className="text-3xl font-black font-display uppercase tracking-tight">{editingLabel ? "Modify" : "Establish"} Entity</h2>
                           <p className="text-slate-400 font-medium">Corporate Asset Control</p>
                        </div>
                     </div>

                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Corporate Name</label>
                           <input 
                             required
                             value={formData.name}
                             onChange={(e) => setFormData({...formData, name: e.target.value})}
                             className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all shadow-inner"
                             placeholder="Label Title"
                           />
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Corporate Branding</label>
                           <div className="flex items-center gap-6">
                              <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group relative">
                                 {formData.logoUrl ? (
                                   <img src={formData.logoUrl} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                                 ) : (
                                   <ImageIcon className="w-6 h-6 text-slate-200" />
                                 )}
                                 {uploading && (
                                   <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                      <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                                   </div>
                                 )}
                              </div>
                              <div className="flex-1 space-y-2">
                                 <div className="relative">
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                       <UploadCloud className="w-4 h-4" /> {uploading ? "Transmitting..." : "Upload Manifest"}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <button 
                           disabled={saving}
                           className="w-full py-6 bg-brand-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:shadow-2xl shadow-blue-500/20 transition-all disabled:opacity-50"
                        >
                           {saving ? "Transmitting..." : editingLabel ? "Update Asset" : "Establish Entity"}
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
