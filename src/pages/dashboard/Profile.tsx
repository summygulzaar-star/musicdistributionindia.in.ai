import React, { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../App";
import { 
  User, 
  Phone, 
  Mail, 
  Shield, 
  LogOut, 
  Settings,
  Bell,
  Lock,
  ChevronRight,
  BadgeCheck,
  Zap,
  Camera,
  UploadCloud
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../../lib/cloudinary";

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    displayName: profile?.displayName || "", 
    phone: profile?.phone || "",
    photoURL: profile?.photoURL || ""
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      await updateDoc(doc(db, "users", user!.uid), { photoURL: url });
      setFormData(prev => ({ ...prev, photoURL: url }));
    } catch (err) {
      alert("Photo transmission failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Profile update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-center gap-10">
         <div className="relative group">
            <div className="w-48 h-48 rounded-[4rem] bg-slate-900 overflow-hidden border-8 border-white shadow-3xl">
               {formData.photoURL ? (
                  <img src={formData.photoURL} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10 uppercase font-black text-6xl italic">
                     {profile?.displayName?.charAt(0) || "U"}
                  </div>
               )}
               {uploading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center">
                     <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                  </div>
               )}
            </div>
            <div className="absolute -bottom-2 -right-2">
               <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
               <button className="w-14 h-14 bg-brand-blue text-white rounded-3xl flex items-center justify-center shadow-xl border-4 border-white hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
               </button>
            </div>
         </div>
         <div className="text-center md:text-left space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-4">
               <h1 className="text-5xl font-black font-display tracking-tight uppercase">{profile?.displayName}</h1>
               <BadgeCheck className="w-8 h-8 text-brand-blue fill-brand-blue/10" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
               <Zap className="w-4 h-4 text-brand-blue" /> Master Artist Profile
            </p>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
               <h3 className="text-2xl font-black font-display tracking-tight mb-10 flex items-center gap-4 uppercase">
                  <User className="w-8 h-8 text-brand-blue" /> Profile Configuration
               </h3>
               <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Authorized Name</label>
                        <div className="relative">
                           <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                           <input 
                              value={formData.displayName} 
                              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                              className="w-full bg-slate-50 border-none rounded-3xl p-5 pl-14 text-sm font-bold focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Communication Portal (Phone)</label>
                        <div className="relative">
                           <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                           <input 
                              value={formData.phone} 
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              className="w-full bg-slate-50 border-none rounded-3xl p-5 pl-14 text-sm font-bold focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                           />
                        </div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Master Email Interface (Immutable)</label>
                     <div className="relative opacity-60">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input value={profile?.email} disabled className="w-full bg-slate-100 border-none rounded-3xl p-5 pl-14 text-sm font-bold cursor-not-allowed" />
                     </div>
                  </div>

                  <button 
                    disabled={saving}
                    className="btn-premium btn-glow py-5 px-12 uppercase tracking-widest text-[10px] font-black flex items-center justify-center gap-3"
                  >
                     {saving ? "Transmitting Changes..." : success ? <>Signal Synced <BadgeCheck className="w-4 h-4" /></> : "Update Identity Manifest"}
                  </button>
               </form>
            </div>

            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100">
               <h3 className="text-2xl font-black font-display tracking-tight mb-8 uppercase flex items-center gap-4">
                  <Lock className="w-8 h-8 text-rose-500" /> Security Protocol
               </h3>
               <div className="space-y-4">
                  {[
                     { label: "Revoke Access Tokens", desc: "Instantly sign out from all unauthorized sessions.", btn: "Revoke all" },
                     { label: "Update Security Key", desc: "Synchronize a new master password for your account.", btn: "Configure" },
                  ].map((item, i) => (
                     <div key={i} className="p-6 bg-slate-50 rounded-[2.5rem] flex items-center justify-between group">
                        <div>
                           <h4 className="text-xs font-black uppercase tracking-tight text-slate-800">{item.label}</h4>
                           <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase leading-tight">{item.desc}</p>
                        </div>
                        <button className="px-6 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                           {item.btn}
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-8">
               <h3 className="text-xl font-black font-display tracking-tight uppercase flex items-center gap-3">
                  <Settings className="w-6 h-6 text-slate-400" /> System Params
               </h3>
               <div className="space-y-6">
                  {[
                     { icon: Bell, label: "Network Notifications", active: true },
                     { icon: Shield, label: "Biometric Integration", active: false },
                     { icon: Zap, label: "Alpha Feature Access", active: true },
                  ].map((setting, i) => (
                     <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <setting.icon className="w-5 h-5 text-slate-300" />
                           <span className="text-xs font-bold uppercase tracking-widest text-slate-600">{setting.label}</span>
                        </div>
                        <div className={cn("w-12 h-6 rounded-full p-1 transition-colors cursor-pointer", setting.active ? "bg-brand-blue" : "bg-slate-200")}>
                           <div className={cn("w-4 h-4 bg-white rounded-full transition-transform shadow-sm", setting.active ? "translate-x-6" : "translate-x-0")}></div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-8 bg-rose-50 text-rose-600 rounded-[3.5rem] border-2 border-rose-100 font-black font-display uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 hover:bg-rose-500 hover:text-white transition-all group"
            >
               <LogOut className="w-6 h-6 group-hover:-translate-x-2 transition-transform" /> TERMINATE SESSION
            </button>
         </div>
      </div>
    </div>
  );
}
