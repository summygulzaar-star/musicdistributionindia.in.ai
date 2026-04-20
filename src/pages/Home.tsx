import React from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Globe, 
  Music, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Play,
  Instagram,
  Youtube,
  Apple
} from "lucide-react";
import { cn } from "../lib/utils";

const PLATFORMS = [
  { name: "Spotify", color: "text-[#1DB954]" },
  { name: "Apple Music", color: "text-[#FC3C44]" },
  { name: "YouTube", color: "text-[#FF0000]" },
  { name: "Instagram", color: "text-[#E4405F]" },
  { name: "Amazon", color: "text-[#FF9900]" },
  { name: "JioSaavn", color: "text-[#00B0F0]" }
];

export default function Home() {
  const { scrollYProgress } = useScroll();
  const yTranslate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="min-h-screen bg-brand-light font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between glass mt-4 mx-auto max-w-7xl rounded-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center rotate-12 shadow-lg">
            <Music className="text-white w-6 h-6 -rotate-12" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tighter">IND<span className="text-brand-blue">.</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-brand-dark/60">
          <Link to="/features" className="hover:text-brand-blue transition-colors">Features</Link>
          <a href="#pricing" className="hover:text-brand-blue transition-colors">Pricing</a>
          <a href="#platforms" className="hover:text-brand-blue transition-colors">Platforms</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/auth?mode=login" className="text-sm font-medium hover:text-brand-blue">Login</Link>
          <Link to="/auth?mode=signup" className="btn-premium btn-glow text-sm">Join IND</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-6">
              DISTRIBUTE YOUR <br />
              <span className="text-gradient">MUSIC WORLDWIDE</span> <br />
              LIKE A PRO
            </h1>
            <p className="text-xl text-brand-dark/60 max-w-lg mb-10 leading-relaxed font-light">
              The ultimate platform for independent artists. Get your music on 250+ stores, manage royalties, and track analytics with an ultra-premium experience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/auth?mode=signup" className="btn-premium btn-glow flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="btn-premium glass flex items-center gap-2 bg-white/50">
                <Play className="w-4 h-4 fill-brand-dark" /> Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* 3D Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-20 -left-10 glass p-6 rounded-3xl z-10 shadow-2xl"
            >
              <BarChart3 className="text-brand-blue w-8 h-8" />
              <div className="mt-2 font-display text-sm font-bold">+142% Growth</div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-10 -right-5 glass p-6 rounded-3xl z-10 shadow-2xl"
            >
              <ShieldCheck className="text-brand-purple w-8 h-8" />
              <div className="mt-2 font-display text-sm font-bold">100% Verified</div>
            </motion.div>

            <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,102,255,0.15)] group/record bg-linear-to-br from-brand-blue/20 to-brand-purple/20 flex items-center justify-center transition-all duration-1000 hover:scale-105 hover:shadow-[0_0_150px_rgba(0,102,255,0.3)]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="w-2/3 h-2/3 border-[1px] border-brand-blue/30 rounded-full flex items-center justify-center p-8"
              >
                <div className="w-full h-full bg-linear-to-br from-brand-blue to-brand-purple rounded-full p-1 shadow-2xl">
                   <div className="w-full h-full bg-brand-dark rounded-full flex items-center justify-center relative overflow-hidden group">
                      <Music className="text-white/20 w-32 h-32 absolute animate-pulse" />
                      <div className="absolute inset-0 bg-[repeating-radial-gradient(circle,_transparent_0px,_transparent_2px,_rgba(255,255,255,0.02)_2px,_rgba(255,255,255,0.02)_3px)] opacity-60"></div>
                       <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent opacity-40 blur-[2px]"></div>
                       <div className="absolute inset-0 bg-radial-gradient from-transparent to-brand-dark/95"></div>
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center relative overflow-hidden">
                        <div className="w-12 h-12 bg-linear-to-br from-brand-blue to-brand-purple rounded-full opacity-50 absolute animate-pulse"></div>
                        <div className="w-4 h-4 bg-brand-dark rounded-full border border-white/10 relative z-10 shadow-inner"></div>
                        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent shadow-[inset_0_0_20px_rgba(255,255,255,0.15)]"></div>
                      </div>
                   </div>
                </div>
              </motion.div>
              <Globe className="absolute w-20 h-20 text-brand-blue opacity-20 pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners/Platforms */}
      <section id="platforms" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-brand-dark/40 mb-12">Distribute to all major platforms</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {PLATFORMS.map((p) => (
              <div key={p.name} className={cn("flex flex-col items-center gap-2 group cursor-pointer", p.color)}>
                 <div className="h-10 opacity-50 contrast-0 grayscale group-hover:grayscale-0 group-hover:contrast-100 group-hover:opacity-100 transition-all duration-500">
                    <span className="font-display font-bold text-2xl">{p.name}</span>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-6">ALL YOU NEED IN <span className="text-gradient">ONE PLATFORM</span></h2>
            <p className="text-brand-dark/60 max-w-2xl mx-auto">Everything from worldwide distribution to advanced financial tracking and OAC requests.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "250+ Stores", desc: "Global distribution to Spotify, Apple, TikTok & more.", icon: Globe, color: "bg-blue-500" },
              { title: "Fast Approval", desc: "Expert content managers review your music within 24 hours.", icon: Zap, color: "bg-amber-500" },
              { title: "Royalty System", desc: "Detailed reports and instant withdrawals via UPI/Bank.", icon: BarChart3, color: "bg-purple-500" }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="p-10 rounded-[3rem] glass flex flex-col items-start gap-6 group border-none"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", f.color)}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold font-display">{f.title}</h3>
                <p className="text-brand-dark/60 leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-brand-dark text-brand-light relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-brand-blue/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
             <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-6">CHOOSE YOUR <span className="text-brand-blue">PATH</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Artist", price: "299", features: ["Single Artist", "Unlimited Uploads", "85% Royalties", "15 Days Support"], popular: false },
              { name: "Pro Label", price: "999", features: ["10 Artists", "Priority Support", "90% Royalties", "Vevo Channel & OAC", "Youtube Content ID"], popular: true },
              { name: "Enterprise", price: "2499", features: ["Unlimited Artists", "Dedicated Account Manager", "95% Royalties", "Custom UPC/ISRC", "Direct Pitching"], popular: false }
            ].map((p, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-10 rounded-[4rem] flex flex-col items-center text-center transition-all duration-500",
                  p.popular ? "bg-brand-blue scale-105 shadow-2xl relative" : "bg-white/5 backdrop-blur-xl border border-white/10"
                )}
              >
                {p.popular && <span className="absolute -top-5 bg-white text-brand-blue font-bold px-6 py-2 rounded-full text-xs uppercase tracking-widest">Recommended</span>}
                <h3 className="text-2xl font-bold font-display mb-2">{p.name}</h3>
                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-black">₹{p.price}</span>
                  <span className="opacity-50 text-sm ml-1">/ year</span>
                </div>
                <ul className="space-y-4 mb-10 text-sm font-light opacity-80">
                  {p.features.map(f => <li key={f} className="flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4" /> {f}</li>)}
                </ul>
                <Link to="/auth?mode=signup" className={cn("btn-premium w-full text-center", p.popular ? "bg-white text-brand-blue" : "btn-glow")}>Get Plan</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-brand-dark/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center rotate-12 shadow-lg">
                <Music className="text-white w-6 h-6 -rotate-12" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tighter">IND Distribution</span>
            </div>
            <p className="text-brand-dark/50 max-w-sm font-light">Join the revolution of music distribution. Empowering 50k+ independent artists across Asia.</p>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-brand-dark/50 font-light">
               <li><Link to="/features" className="hover:text-brand-blue">Features</Link></li>
               <li><a href="#distribution" className="hover:text-brand-blue">Distribution</a></li>
               <li><a href="#" className="hover:text-brand-blue">Marketing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6">Connect</h4>
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all cursor-pointer"><Instagram className="w-5 h-5" /></div>
               <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all cursor-pointer"><Youtube className="w-5 h-5" /></div>
               <div className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all cursor-pointer"><Apple className="w-5 h-5" /></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-brand-dark/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-widest uppercase font-bold text-brand-dark/30">
          <p>© 2026 IND Distribution BY SK JI. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
