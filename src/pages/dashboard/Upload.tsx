import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "motion/react";
import { db, storage } from "../../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../../App";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { 
  Music, 
  Upload as UploadIcon, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  X,
  FileMusic,
  Image as ImageIcon,
  Check,
  Disc,
  Mic2,
  Calendar,
  Building,
  Globe,
  Youtube,
  Search,
  CheckCircle,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  UserPlus
} from "lucide-react";
import { cn } from "../../lib/utils";

const schema = z.object({
  releaseType: z.enum(["Single", "Album", "EP"]),
  songName: z.string().min(1, "Song Name is required"),
  singerName: z.string().min(1, "Singer Name is required"),
  lyricist: z.string().min(1, "Lyricist Name is required"),
  instagramId: z.string().optional(),
  lyrics: z.string().min(1, "Lyrics are required"),
  composer: z.string().min(1, "Composer is required"),
  producer: z.string().min(1, "Producer is required"),
  copyright: z.string().min(1, "Copyright is required"),
  publisher: z.string().min(1, "Publisher is required"),
  language: z.string().min(1, "Language is required"),
  primaryGenre: z.string().min(1, "Primary Genre is required"),
  secondaryGenre: z.string().min(1, "Secondary Genre is required"),
  isrc: z.string().optional(),
  upc: z.string().optional(),
  releaseDate: z.string().min(1, "Release Date is required"),
  releaseTime: z.string().optional(),
  labelName: z.string().min(1, "Label is required"),
});

const STEPS = [
  "Release Type", 
  "Details", 
  "Timeline", 
  "Label", 
  "Audio", 
  "Artwork", 
  "Platforms", 
  "Review"
];

const LANGUAGES = ["Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Maithili", "Sanskrit", "English"];
const GENRES = ["Pop", "HipHop", "Classical", "Folk", "EDM", "Jazz", "Rock", "Devotional", "Bollywood", "Lo-Fi", "Indie"];
const PLATFORMS = [
  { name: "Spotify", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1024px-Spotify_logo_without_text.svg.png" },
  { name: "Apple Music", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Apple_Music_logo.svg/1024px-Apple_Music_logo.svg.png" },
  { name: "YouTube Music", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Youtube_Music_icon.svg/1024px-Youtube_Music_icon.svg.png" },
  { name: "Instagram", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/1024px-Instagram_logo_2016.svg.png" },
  { name: "JioSaavn", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/JioSaavn_Logo.svg/1024px-JioSaavn_Logo.svg.png" },
  { name: "Gaana", logo: "https://upload.wikimedia.org/wikipedia/en/c/ca/Gaana_Logo.png" },
  { name: "Facebook", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png" },
  { name: "Snapchat", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/Snapchat_logo.svg/1024px-Snapchat_logo.svg.png" },
  { name: "Amazon Music", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Amazon_Music_logo.svg/1024px-Amazon_Music_logo.svg.png" },
  { name: "Wynk Music", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Wynk_Music_Logo.png/1024px-Wynk_Music_Logo.png" },
];

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, fileName: "" });
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(PLATFORMS.map(p => p.name));
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // New states for selection
  const [userArtists, setUserArtists] = useState<any[]>([]);
  const [userLabels, setUserLabels] = useState<any[]>([]);
  const [showQuickArtist, setShowQuickArtist] = useState(false);
  const [showQuickLabel, setShowQuickLabel] = useState(false);
  const [quickArtistName, setQuickArtistName] = useState("");
  const [quickLabelName, setQuickLabelName] = useState("");

  const fetchData = async () => {
    if (!user) return;
    const artistsSnap = await getDocs(query(collection(db, "artists"), where("userId", "==", user.uid)));
    setUserArtists(artistsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    
    const labelsSnap = await getDocs(query(collection(db, "labels"), where("userId", "==", user.uid)));
    setUserLabels(labelsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      releaseType: "Single",
      songName: "",
      singerName: "",
      lyricist: "",
      instagramId: "",
      lyrics: "",
      composer: "",
      producer: "",
      copyright: "© 2023 IND Records",
      publisher: "IND Publishing",
      language: "Hindi",
      primaryGenre: "Pop",
      secondaryGenre: "HipHop",
      isrc: "",
      upc: "",
      releaseDate: "",
      releaseTime: "00:00",
      labelName: ""
    }
  });

  const watchAll = watch();

  const handleQuickArtist = async () => {
    if (!user || !quickArtistName) return;
    try {
      const docRef = await addDoc(collection(db, "artists"), {
        name: quickArtistName,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setValue("singerName", quickArtistName);
      setShowQuickArtist(false);
      setQuickArtistName("");
      fetchData();
    } catch (err) {
      alert("Error creating artist");
    }
  };

  const handleQuickLabel = async () => {
    if (!user || !quickLabelName) return;
    try {
      const docRef = await addDoc(collection(db, "labels"), {
        name: quickLabelName,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setValue("labelName", quickLabelName);
      setShowQuickLabel(false);
      setQuickLabelName("");
      fetchData();
    } catch (err) {
      alert("Error creating label");
    }
  };

  const onError = (errors: any) => {
    console.error(errors);
    const firstError = Object.values(errors)[0] as any;
    setFormError(`Validation Error: ${firstError?.message || 'Please check all fields'}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadFileWithProgress = (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ 
            ...prev, 
            current: progress,
            fileName: file.name
          }));
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const onSubmit = async (data: any) => {
    setFormError(null);
    if (!audioFile) {
      setFormError("Please upload an audio file first.");
      setStep(4);
      return;
    }
    if (!coverFile) {
      setFormError("Please upload cover art first.");
      setStep(5);
      return;
    }
    if (!user) return;
    
    setIsUploading(true);
    try {
      // 1. Upload Cover to Cloudinary
      const coverUrl = await uploadToCloudinary(coverFile, (progress) => {
        setUploadProgress({ current: progress, total: 100, fileName: "Cover Art" });
      });

      // 2. Upload Audio to Cloudinary
      const audioUrl = await uploadToCloudinary(audioFile, (progress) => {
        setUploadProgress({ current: progress, total: 100, fileName: "Master Audio" });
      });

      // 3. Save to Firestore
      await addDoc(collection(db, "releases"), {
        userId: user.uid,
        title: data.songName,
        artist: data.singerName,
        genre: data.primaryGenre, // Match blueprint
        secondaryGenre: data.secondaryGenre,
        language: data.language,
        copyright: data.copyright,
        label: data.labelName, // Match blueprint
        releaseDate: data.releaseDate,
        releaseTime: data.releaseTime,
        audioUrl,
        coverUrl,
        status: "pending",
        platforms: selectedPlatforms,
        // Keep original data for reference
        metadata: data,
        createdAt: new Date().toISOString()
      });

      setStep(8); // Finished
    } catch (err: any) {
      console.error(err);
      let errorMessage = "An unexpected error occurred during upload.";
      if (err.code === 'storage/unauthorized') {
        errorMessage = "Permission denied to Firebase Storage. Please ensure you are logged in and authorized.";
      } else if (err.code === 'storage/quota-exceeded') {
        errorMessage = "Storage quota exceeded on the server. Please try again later.";
      } else if (err.code === 'storage/retry-limit-exceeded') {
        errorMessage = "Upload timed out. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setFormError(`Critical Upload Failure: ${errorMessage}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0, fileName: "" });
    }
  };

  const nextStep = () => {
    // Basic validation for current step
    if (step === 1) {
      const required = ["songName", "singerName", "lyricist", "composer", "producer", "copyright", "publisher", "lyrics"];
      for (const field of required) {
        if (!watchAll[field as keyof typeof watchAll]) {
          alert(`Please fill the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
          return;
        }
      }
    }
    if (step === 2 && !watchAll.releaseDate) {
      alert("Please select a release date.");
      return;
    }
    if (step === 3 && !watchAll.labelName) {
      alert("Please select a label.");
      return;
    }
    if (step === 4 && !audioFile) {
      alert("Please upload your master audio file.");
      return;
    }
    if (step === 5 && !coverFile) {
      alert("Please upload your artwork.");
      return;
    }
    if (step === 6 && selectedPlatforms.length === 0) {
      alert("Please select at least one distribution platform.");
      return;
    }
    setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="max-w-6xl mx-auto py-10 pb-32">
      {/* Heavy Stepper - Responsive */}
      <div className="flex items-center justify-between mb-12 md:mb-20 relative px-4 md:px-10 overflow-x-auto scrollbar-hide">
         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-100 -translate-y-1/2 hidden md:block"></div>
         {STEPS.map((s, i) => (
            <div key={s} className={cn(
              "relative z-10 flex flex-col items-center gap-2 md:gap-4 shrink-0",
              step === i ? "opacity-100" : "opacity-40 md:opacity-100"
            )}>
               <motion.div 
                 animate={{ 
                   scale: step === i ? 1.1 : 1,
                   backgroundColor: step >= i ? "#0066FF" : "#FFFFFF",
                   borderColor: step >= i ? "#0066FF" : "#F1F5F9",
                   color: step >= i ? "#FFFFFF" : "#94A3B8"
                 }}
                 className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-black font-display text-[10px] md:text-xs shadow-xl transition-all"
               >
                 {step > i ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : i + 1}
               </motion.div>
               <span className={cn(
                 "text-[7px] md:text-[9px] font-black uppercase tracking-widest md:tracking-[0.2em]",
                 step >= i ? "text-brand-blue" : "text-slate-300",
                 step !== i && "hidden md:block"
               )}>{s}</span>
            </div>
         ))}
      </div>

      {/* Form Error Message */}
      <AnimatePresence>
        {formError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-6 bg-rose-50 border-2 border-rose-100 rounded-[2rem] flex items-center gap-4 text-rose-600"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-[1rem] flex items-center justify-center shrink-0">
               <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1">
               <p className="text-xs font-black uppercase tracking-widest mb-1">Transmission Error</p>
               <p className="text-[11px] font-bold opacity-80">{formError}</p>
            </div>
            <button onClick={() => setFormError(null)} className="p-2 hover:bg-rose-200 rounded-full transition-colors">
               <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl p-8 md:p-16 border border-slate-50 relative overflow-hidden">
        {isUploading && (
           <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center p-12 gap-10">
              <div className="relative group">
                 <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="w-40 h-40 border-[6px] border-slate-100 border-t-brand-blue rounded-full shadow-2xl"
                 ></motion.div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <UploadIcon className="w-12 h-12 text-brand-blue animate-bounce" />
                 </div>
              </div>

              <div className="w-full max-w-md space-y-6">
                 <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Transmitting: <span className="text-slate-800">{uploadProgress.fileName}</span></span>
                    <span className="text-brand-blue">{Math.round(uploadProgress.current)}%</span>
                 </div>
                 <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress.current}%` }}
                      className="h-full bg-linear-to-r from-brand-blue to-cyan-400 rounded-full shadow-lg shadow-blue-500/20"
                    />
                 </div>
                 <div className="text-center">
                    <p className="font-display font-black text-3xl text-slate-800 tracking-tighter uppercase mb-2">Transmitting Audio Assets</p>
                    <p className="text-slate-400 font-medium tracking-widest text-[10px] uppercase">Integrating Creative Data with Global Metadata Mesh</p>
                 </div>
              </div>
           </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <AnimatePresence mode="wait">
             {/* STEP 1: RELEASE TYPE */}
             {step === 0 && (
                <motion.div key="s1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-12">
                   <div className="text-center max-w-2xl mx-auto space-y-4">
                      <h2 className="text-5xl font-black font-display tracking-tight uppercase">Select <span className="text-brand-blue">Release Core</span></h2>
                      <p className="text-slate-400 font-medium">Define the architectural scope of your project.</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                      {["Single", "EP", "Album"].map((type) => (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => { setValue("releaseType", type as any); nextStep(); }}
                          className={cn(
                            "group p-12 rounded-[3.5rem] border-2 flex flex-col items-center gap-6 transition-all transform hover:-translate-y-4",
                            watchAll.releaseType === type ? "border-brand-blue bg-brand-blue/5 shadow-2xl" : "border-slate-100 hover:border-brand-blue bg-slate-50 shadow-sm"
                          )}
                        >
                           <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center text-brand-blue transition-transform group-hover:rotate-12">
                              {type === 'Single' && <Music className="w-10 h-10" />}
                              {type === 'EP' && <Disc className="w-10 h-10" />}
                              {type === 'Album' && <Disc className="w-12 h-12" />}
                           </div>
                           <h4 className="text-2xl font-black font-display uppercase tracking-tight">{type}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             {type === 'Single' && "One Master Track"}
                             {type === 'EP' && "2-6 Master Tracks"}
                             {type === 'Album' && "7+ Master Tracks"}
                           </p>
                        </button>
                      ))}
                   </div>
                </motion.div>
             )}

             {/* STEP 2: DETAILS */}
             {step === 1 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-12">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-brand-blue text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                         <Music className="w-7 h-7" />
                      </div>
                      <div>
                         <h2 className="text-4xl font-black font-display tracking-tight uppercase">Metadata Blueprint</h2>
                         <p className="text-slate-400 font-medium">Inject your creative identity into the global catalog.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Song Name</label>
                         <input {...register("songName")} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-brand-blue/10 transition-all" placeholder="Track Title" />
                      </div>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between px-4">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Primary Singer / Artist</label>
                            <button type="button" onClick={() => setShowQuickArtist(true)} className="text-[10px] font-black uppercase text-brand-blue flex items-center gap-1 hover:underline">
                               <Plus className="w-3 h-3" /> Create New
                            </button>
                         </div>
                         <div className="relative">
                            <Mic2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <select {...register("singerName")} className="w-full p-5 pl-16 bg-slate-50 border-none rounded-3xl text-sm font-bold appearance-none">
                               <option value="">Select Artist</option>
                               {userArtists.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                            </select>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Instagram ID (Optional)</label>
                         <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black">@</span>
                            <input {...register("instagramId")} className="w-full p-5 pl-12 bg-slate-50 border-none rounded-3xl text-sm font-bold" placeholder="username" />
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Language</label>
                         <select {...register("language")} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold appearance-none">
                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                         </select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Lyricist Name</label>
                         <input {...register("lyricist")} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold" placeholder="Lyricist / Writer Name" />
                      </div>
                      <div className="col-span-2 space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Master Lyrics</label>
                         <textarea {...register("lyrics")} rows={5} className="w-full p-8 bg-slate-50 border-none rounded-[2.5rem] text-sm font-bold leading-relaxed" placeholder="Place your lyrics here..." />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Composer</label>
                         <input {...register("composer")} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold" placeholder="Original Composer" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Producer</label>
                         <input {...register("producer")} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold" placeholder="Music Producer" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Copyright Holder</label>
                         <input {...register("copyright")} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Publisher</label>
                         <input {...register("publisher")} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Primary Genre</label>
                         <select {...register("primaryGenre")} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold appearance-none">
                            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                         </select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">Secondary Genre</label>
                         <select {...register("secondaryGenre")} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold appearance-none">
                            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                         </select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">ISRC (Optional)</label>
                         <input {...register("isrc")} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-mono font-bold tracking-widest text-brand-blue" placeholder="IN-XXX-00-00000" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-4">UPC (Optional)</label>
                         <input {...register("upc")} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-mono font-bold tracking-widest text-brand-blue" placeholder="190000000000" />
                      </div>
                   </div>
                   <div className="flex justify-end pt-12">
                      <button type="button" onClick={nextStep} className="btn-premium btn-glow py-5 px-12 group">
                        Next Mission Stage <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </button>
                   </div>
                </motion.div>
             )}

             {/* STEP 3: RELEASE DATE */}
             {step === 2 && (
                <motion.div key="s3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 text-center max-w-2xl mx-auto">
                   <div className="space-y-4">
                      <h2 className="text-5xl font-black font-display tracking-tight uppercase">Launch <span className="text-brand-purple">Window</span></h2>
                      <p className="text-slate-400 font-medium leading-relaxed">Schedule your release across the digital universe. Global delivery remains optimal with a 14-day lead time.</p>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3 text-left">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Release Date</label>
                         <div className="relative">
                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input {...register("releaseDate")} type="date" min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} className="w-full p-5 pl-16 bg-slate-50 border-none rounded-3xl text-sm font-bold" />
                         </div>
                      </div>
                      <div className="space-y-3 text-left">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Time (Optional)</label>
                         <input {...register("releaseTime")} type="time" className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold" />
                      </div>
                   </div>
                   <div className="pt-12 flex justify-center gap-6">
                      <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500">Back</button>
                      <button type="button" onClick={nextStep} className="btn-premium btn-glow py-5 px-12">Confirm Schedule</button>
                   </div>
                </motion.div>
             )}

             {/* STEP 4: LABEL INFO */}
             {step === 3 && (
                <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                   <div className="text-center space-y-4">
                      <h2 className="text-5xl font-black font-display tracking-tight uppercase">Corporate <span className="text-brand-blue">Identity</span></h2>
                      <p className="text-slate-400 font-medium">Link this project to a master distribution label.</p>
                   </div>
                   <div className="max-w-xl mx-auto space-y-8">
                      <div className="grid grid-cols-2 gap-6">
                         <button type="button" className={cn(
                           "p-10 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 transition-all",
                           watchAll.labelName ? "bg-brand-blue/5 border-brand-blue shadow-xl" : "bg-slate-50 border-slate-100 opacity-60"
                         )}>
                            <Building className="w-10 h-10 text-brand-blue" />
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue">Select Entity</span>
                         </button>
                         <button type="button" onClick={() => setShowQuickLabel(true)} className="p-10 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 hover:border-brand-purple hover:bg-brand-purple/5 transition-all flex flex-col items-center gap-4">
                            <Plus className="w-10 h-10 text-brand-purple" />
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">Register New</span>
                         </button>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Select Label</label>
                         <select {...register("labelName")} className="w-full p-6 bg-slate-50 border-none rounded-3xl text-sm font-bold appearance-none">
                            <option value="">Select Label</option>
                            <option value="IND Records">IND Records (System Default)</option>
                            {userLabels.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                         </select>
                      </div>
                      <div className="pt-8 flex justify-center gap-6">
                        <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500">Back</button>
                        <button type="button" onClick={nextStep} className="btn-premium btn-glow py-5 px-12">Proceed to Assets</button>
                      </div>
                   </div>
                </motion.div>
             )}

             {/* STEP 5: AUDIO UPLOAD */}
             {step === 4 && (
                <motion.div key="s5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                   <div className="text-center space-y-4">
                      <h2 className="text-5xl font-black font-display tracking-tight uppercase">Master <span className="text-emerald-500">Audio</span></h2>
                      <p className="text-slate-400 font-medium">Transmit your high-fidelity master recording.</p>
                   </div>
                   <div className="max-w-2xl mx-auto">
                      <div className="relative group">
                         <input type="file" accept=".mp3,.wav" onChange={e => setAudioFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                         <div className={cn(
                           "w-full aspect-[21/9] rounded-[4rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all",
                           audioFile ? "border-emerald-500 bg-emerald-50 shadow-2xl shadow-emerald-500/10" : "border-slate-200 bg-slate-50 hover:border-brand-blue hover:bg-slate-100 shadow-sm"
                         )}>
                            {audioFile ? <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" /> : <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center text-brand-blue"><FileMusic className="w-8 h-8" /></div>}
                            <div className="text-center px-8">
                               <p className="text-lg font-black font-display uppercase tracking-tight">{audioFile ? audioFile.name : "Drag & Drop Studio WAV"}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Compatible formats: WAV • MP3 (320kbps)</p>
                            </div>
                         </div>
                      </div>
                      {audioFile && (
                        <div className="mt-8 p-6 bg-slate-900 rounded-3xl flex items-center justify-between shadow-2xl">
                           <div className="flex items-center gap-4">
                              <button type="button" className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white"><Youtube className="w-5 h-5 fill-white" /></button>
                              <span className="text-xs font-bold text-white uppercase tracking-widest">Audio Loaded Successfully</span>
                           </div>
                           <button type="button" onClick={() => setAudioFile(null)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                      )}
                      <div className="pt-12 flex justify-center gap-6">
                        <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500">Back</button>
                        <button type="button" disabled={!audioFile} onClick={nextStep} className="btn-premium btn-glow py-5 px-12 disabled:opacity-50">Upload & Continue</button>
                      </div>
                   </div>
                </motion.div>
             )}

             {/* STEP 6: COVER ART */}
             {step === 5 && (
                <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                   <div className="text-center space-y-4">
                      <h2 className="text-5xl font-black font-display tracking-tight uppercase">Visual <span className="text-brand-purple">Anchor</span></h2>
                      <p className="text-slate-400 font-medium">Capture the soul of your era with high-definition artwork.</p>
                   </div>
                   <div className="max-w-xl mx-auto space-y-8">
                      <div className="relative group aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-4 border-slate-50">
                         <input type="file" accept="image/jpeg,image/png" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                         {coverFile ? (
                           <img src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                         ) : (
                           <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-6">
                              <div className="w-20 h-20 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center text-brand-purple">
                                 <ImageIcon className="w-10 h-10" />
                              </div>
                              <div className="text-center">
                                 <p className="text-sm font-black font-display uppercase tracking-widest">Transmit Image Data</p>
                                 <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">3000 x 3000 • 1:1 • JPG/PNG</p>
                              </div>
                           </div>
                         )}
                      </div>
                      <div className="pt-8 flex justify-center gap-6">
                        <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500">Back</button>
                        <button type="button" disabled={!coverFile} onClick={nextStep} className="btn-premium btn-glow py-5 px-12 disabled:opacity-50">Confirm Canvas</button>
                      </div>
                   </div>
                </motion.div>
             )}

             {/* STEP 7: PLATFORMS */}
             {step === 6 && (
                <motion.div key="s7" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
                   <div className="text-center space-y-4">
                      <h2 className="text-5xl font-black font-display tracking-tight uppercase">Global <span className="text-brand-blue">Footprint</span></h2>
                      <p className="text-slate-400 font-medium tracking-wide">Command distribution across 250+ master music gateways.</p>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                      {PLATFORMS.map((p) => (
                        <button 
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setSelectedPlatforms(prev => prev.includes(p.name) ? prev.filter(i => i !== p.name) : [...prev, p.name]);
                          }}
                          className={cn(
                            "p-8 rounded-[3rem] border-2 flex flex-col items-center gap-4 transition-all group relative",
                            selectedPlatforms.includes(p.name) ? "border-brand-blue bg-brand-blue/5 shadow-2xl" : "border-slate-100 bg-white opacity-40 grayscale group-hover:grayscale-0"
                          )}
                        >
                           <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-xl flex items-center justify-center p-3 relative z-10">
                              <img src={p.logo} alt={p.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-brand-blue transition-colors">{p.name}</span>
                           <div className={cn("absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all", selectedPlatforms.includes(p.name) ? "bg-brand-blue text-white" : "bg-slate-100 text-slate-300")}>
                              <Check className="w-3 h-3" />
                           </div>
                        </button>
                      ))}
                      <button 
                        type="button" 
                        onClick={() => {
                          if (selectedPlatforms.length === PLATFORMS.length) {
                            setSelectedPlatforms([]);
                          } else {
                            setSelectedPlatforms(PLATFORMS.map(p => p.name));
                          }
                        }}
                        className="p-8 rounded-[3.5rem] bg-brand-dark text-white flex flex-col items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all group"
                      >
                         <span className="text-xs font-black uppercase tracking-widest">
                           {selectedPlatforms.length === PLATFORMS.length ? "Deselect All" : "Select All"}
                         </span>
                         <span className="text-[9px] font-bold text-white/40 uppercase">250+ Stores</span>
                      </button>
                   </div>
                   <div className="pt-12 flex justify-center gap-6">
                      <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500">Back</button>
                      <button type="button" disabled={selectedPlatforms.length === 0} onClick={nextStep} className="btn-premium btn-glow py-5 px-12 disabled:opacity-50">Activate Routes</button>
                   </div>
                </motion.div>
             )}

             {/* STEP 8: REVIEW */}
             {step === 7 && (
                <motion.div key="s8" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
                   <div className="flex items-center justify-between border-b border-slate-100 pb-10">
                      <div>
                        <h2 className="text-4xl font-black font-display tracking-tight uppercase">Master <span className="text-brand-blue">Review</span></h2>
                        <p className="text-slate-400 font-medium">Verify your digital artifact before final transmission.</p>
                      </div>
                      <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white">
                         {coverFile && <img src={URL.createObjectURL(coverFile)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                      </div>
                   </div>

                   <div className="grid md:grid-cols-3 gap-12">
                      <div className="space-y-8">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-blue mb-4">Core Metadata</p>
                            <div className="bg-slate-50 p-8 rounded-[3rem] space-y-4">
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Title</p><p className="font-black text-slate-800">{watchAll.songName}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Singer</p><p className="font-bold text-slate-600">{watchAll.singerName}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Label</p><p className="font-bold text-slate-600">{watchAll.labelName}</p></div>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-8">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-purple mb-4">Copyright & Tech</p>
                            <div className="bg-slate-50 p-8 rounded-[3rem] space-y-4">
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Copyright</p><p className="font-bold text-slate-600">{watchAll.copyright}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Genres</p><p className="font-bold text-slate-600">{watchAll.primaryGenre} / {watchAll.secondaryGenre}</p></div>
                               <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Launch Date</p><p className="font-black text-brand-purple">{watchAll.releaseDate}</p></div>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-8">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4">Distribution Gate</p>
                            <div className="bg-slate-50 p-8 rounded-[3.5rem] grid grid-cols-3 gap-3">
                               {selectedPlatforms.slice(0, 6).map(p => {
                                  const pf = PLATFORMS.find(item => item.name === p);
                                  return pf ? <div key={p} className="aspect-square bg-white rounded-2xl p-2 flex items-center justify-center shadow-sm"><img src={pf.logo} className="w-full h-full object-contain opacity-40" referrerPolicy="no-referrer" /></div> : null;
                               })}
                               <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">+{selectedPlatforms.length > 6 ? selectedPlatforms.length - 6 : 0} More</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-10 rounded-[3rem] border-2 border-slate-100 space-y-6">
                      <div className="flex items-center gap-4">
                        <input required type="checkbox" className="w-6 h-6 rounded-lg text-brand-blue focus:ring-brand-blue border-slate-200" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">I Hereby certify that I own 100% of the Master Recording and Publishing rights for this digital artifact.</span>
                      </div>
                   </div>

                   <div className="pt-12 flex justify-center gap-6">
                      <button type="button" onClick={prevStep} className="btn-premium glass text-slate-500 py-6 px-12">Return to Edit</button>
                      <button type="submit" className="btn-premium btn-glow py-6 px-24 text-lg font-black tracking-tighter shadow-2xl animate-pulse">DEPLOY MASTER RELEASE</button>
                   </div>
                </motion.div>
             )}

             {/* SUCCESS STEP */}
             {step === 8 && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-20 gap-10">
                   <div className="relative">
                      <div className="w-40 h-40 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10 animate-[bounce_2s_infinite]">
                         <CheckCircle className="text-white w-20 h-20" />
                      </div>
                      <div className="absolute -inset-10 bg-emerald-500/10 blur-[60px] rounded-full animate-pulse"></div>
                   </div>
                   <div className="space-y-4">
                      <h2 className="text-6xl font-black font-display tracking-tighter uppercase">Mission <span className="text-emerald-500">Accomplished</span></h2>
                      <p className="text-slate-400 max-w-lg mx-auto font-medium text-lg leading-relaxed">Your release has entered the global distribution pipeline. Our content review board will verify metadata within 24 hours.</p>
                   </div>
                   <div className="flex gap-6">
                      <button type="button" onClick={() => navigate("/dashboard")} className="btn-premium bg-slate-900 text-white rounded-3xl py-5 px-10 shadow-2xl">Return to Overview</button>
                      <button type="button" onClick={() => { setStep(0); setAudioFile(null); setCoverFile(null); }} className="btn-premium glass text-slate-600 rounded-3xl py-5 px-10">Deploy New Asset</button>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
        </form>
      </div>

      {/* Quick Artist Modal */}
      <AnimatePresence>
        {showQuickArtist && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-12 rounded-[3.5rem] shadow-3xl max-w-md w-full space-y-8 border border-slate-100">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-linear-to-br from-brand-blue to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <UserPlus className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-black font-display tracking-tight uppercase">Quick Artist</h3>
                  </div>
                  <button onClick={() => setShowQuickArtist(false)} className="text-slate-300 hover:text-slate-900"><X className="w-6 h-6" /></button>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Authorized Artist Name</label>
                  <input value={quickArtistName} onChange={e => setQuickArtistName(e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold" placeholder="Legal or Stage Name" />
               </div>
               <button onClick={handleQuickArtist} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-blue transition-all shadow-2xl">Initialize Artist Profile</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Label Modal */}
      <AnimatePresence>
        {showQuickLabel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-12 rounded-[3.5rem] shadow-3xl max-w-md w-full space-y-8 border border-slate-100">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-linear-to-br from-brand-purple to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                        <Building className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-black font-display tracking-tight uppercase">Quick Label</h3>
                  </div>
                  <button onClick={() => setShowQuickLabel(false)} className="text-slate-300 hover:text-slate-900"><X className="w-6 h-6" /></button>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Corporate Label Name</label>
                  <input value={quickLabelName} onChange={e => setQuickLabelName(e.target.value)} className="w-full p-5 bg-slate-50 border-none rounded-3xl text-sm font-bold" placeholder="Production / Label Name" />
               </div>
               <button onClick={handleQuickLabel} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brand-purple transition-all shadow-2xl">Register Infrastructure</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
