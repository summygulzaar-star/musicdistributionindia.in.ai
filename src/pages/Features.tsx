import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Globe, 
  Music, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Youtube,
  CheckCircle2,
  MessageSquare,
  Phone,
  Mail,
  PieChart,
  Layout,
  MessageCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Features() {
  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white font-sans selection:bg-electric-blue/30 overflow-x-hidden">
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/917742789827" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform active:scale-90 group"
      >
        <MessageCircle className="w-8 h-8 fill-white text-white group-hover:animate-pulse" />
      </a>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between glass-dark mt-4 mx-auto max-w-7xl left-0 right-0 rounded-full border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center rotate-12 shadow-lg">
            <Music className="text-white w-6 h-6 -rotate-12" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tighter">IND<span className="text-electric-blue">.</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-white/60">
          <Link to="/" className="hover:text-electric-blue transition-colors">Home</Link>
          <a href="#distribution" className="hover:text-electric-blue transition-colors">Distribution</a>
          <a href="#royalties" className="hover:text-electric-blue transition-colors">Royalties</a>
          <a href="#youtube" className="hover:text-electric-blue transition-colors">YouTube ID</a>
          <Link to="/auth?mode=signup" className="hover:text-electric-blue transition-colors">Join</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/auth?mode=login" className="text-sm font-medium hover:text-electric-blue">Login</Link>
          <Link to="/auth?mode=signup" className="px-6 py-2.5 bg-electric-blue text-[#0D1B2A] rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all">Start Now</Link>
        </div>
      </nav>

      {/* SECTION 1: HERO HEADER */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-blue/30 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-neon-purple/20 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-electric-blue font-black uppercase tracking-[0.4em] text-[10px] mb-6 block drop-shadow-[0_0_10px_rgba(0,212,255,0.5)] italic">Unleash Your Sound</span>
            <h1 className="font-display text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 uppercase">
              Powerful Features to Grow <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-electric-blue via-neon-purple to-soft-orange">Your Music Career</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
              Everything you need to distribute, monetize, and manage your music globally — all in one place.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link to="/auth?mode=signup" className="px-10 py-5 bg-electric-blue text-[#0D1B2A] rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_20px_50px_rgba(0,212,255,0.3)] hover:-translate-y-2 transition-all">
                Start Distributing Now
              </Link>
              <Link to="/#pricing" className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Animated Waveform mockup */}
        <div className="mt-32 max-w-7xl mx-auto relative h-24 flex items-center justify-center gap-1">
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: [20, Math.random() * 80 + 20, 20],
                opacity: [0.1, 0.4, 0.1]
              }}
              transition={{ 
                duration: 1.5 + Math.random(), 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-1.5 md:w-2 bg-electric-blue rounded-full"
            />
          ))}
        </div>
      </section>

      {/* SECTION 2: MUSIC DISTRIBUTION */}
      <section id="distribution" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-electric-blue/10 border border-electric-blue/20 rounded-full text-electric-blue text-[10px] font-black uppercase tracking-widest">
              <Globe className="w-3 h-3" /> Worldwide Reach
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-display tracking-tight uppercase leading-tight">
              Global Music <br /> <span className="text-electric-blue">Distribution</span>
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Distribute your music to 250+ digital streaming platforms worldwide including Spotify, Apple Music, JioSaavn, YouTube Music, Instagram, Facebook, Amazon Music, and more.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                "Worldwide reach in 100+ countries",
                "Fast release delivery",
                "Platform-specific optimization",
                "Release scheduling system"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-electric-blue flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#0D1B2A]" />
                  </div>
                  <span className="text-sm font-bold text-white/80">{feature}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-linear-to-r from-electric-blue/20 to-transparent border-l-4 border-electric-blue rounded-r-2xl">
               <p className="italic font-bold text-electric-blue uppercase tracking-widest text-xs">“Reach millions of listeners globally”</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-video glass-dark rounded-[3rem] overflow-hidden border border-white/5 flex items-center justify-center group shadow-2xl">
               <div className="absolute inset-0 bg-linear-to-br from-electric-blue/5 to-transparent"></div>
               <Music className="w-32 h-32 text-electric-blue opacity-10 blur-xl absolute" />
               <div className="grid grid-cols-4 gap-4 p-8">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-full aspect-square rounded-2xl bg-white/5 border border-white/5 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                  ))}
               </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-10 -right-10 px-6 py-4 bg-brand-blue rounded-3xl shadow-2xl font-bold text-xs uppercase tracking-widest">
               250+ Stores
            </div>
            <div className="absolute -bottom-6 -left-6 px-6 py-4 bg-neon-purple rounded-3xl shadow-2xl font-bold text-xs uppercase tracking-widest">
               Fast Delivery
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: ROYALTY COLLECTION */}
      <section id="royalties" className="py-32 px-6 relative bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
             <h2 className="text-4xl md:text-6xl font-black font-display tracking-tight uppercase underline decoration-electric-blue underline-offset-8">Transparent Royalty Collection</h2>
             <p className="text-white/60 max-w-2xl mx-auto font-light">Earn money every time your music is streamed or downloaded. Track everything in real-time.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { title: "Real-time Dashboard", desc: "Track earnings as they happen with precision.", icon: Layout, color: "text-electric-blue" },
               { title: "Detailed Reports", desc: "Monthly & quarterly financial statements.", icon: BarChart3, color: "text-neon-purple" },
               { title: "Withdrawals", desc: "Easy withdrawal system via UPI or Bank Transfer.", icon: ShieldCheck, color: "text-emerald-400" },
               { title: "Full Transparency", desc: "No hidden fees. You see exactly what you earn.", icon: CheckCircle2, color: "text-soft-orange" }
             ].map((item, i) => (
               <motion.div
                 key={i}
                 whileHover={{ y: -10 }}
                 className="p-10 glass-dark rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all group"
               >
                 <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6", item.color)}>
                    <item.icon className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{item.title}</h3>
                 <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
               </motion.div>
             ))}
          </div>

          {/* Visual Graph Mock */}
          <div className="mt-20 glass-dark rounded-[3.5rem] p-8 md:p-12 border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
             <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Portfolio Performance</p>
                  <h4 className="text-3xl font-black font-display uppercase tracking-tight">Total Revenue: <span className="text-emerald-400">₹8,42,120</span></h4>
                </div>
                <div className="flex gap-4">
                   <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">Weekly</div>
                   <div className="px-4 py-2 bg-emerald-500 text-[#0D1B2A] rounded-xl font-black text-[10px] uppercase tracking-widest">Monthly</div>
                </div>
             </div>
             <div className="h-64 flex items-end gap-3 md:gap-6">
                {[40, 70, 45, 90, 65, 80, 100, 85, 75, 95, 60, 110].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    className="flex-1 bg-linear-to-t from-emerald-500/20 to-emerald-500 rounded-t-xl"
                  />
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: YOUTUBE CONTENT ID */}
      <section id="youtube" className="py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
             <div className="relative aspect-square glass-dark rounded-full p-20 flex items-center justify-center border-white/5 group overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-rose-500/10 to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[10%] bg-rose-500/20 blur-[50px] rotate-45 group-hover:rotate-0 transition-transform duration-1000"></div>
                <div className="w-48 h-48 bg-rose-600 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(225,29,72,0.4)] group-hover:scale-110 transition-transform">
                   <Youtube className="w-24 h-24 text-white" />
                </div>
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Automatic Protection
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-display tracking-tight uppercase leading-tight">
              YouTube Content ID <br /> <span className="text-rose-500">Protection</span>
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Protect your music and monetize user-generated content across YouTube automatically. Turn every use of your music into income.
            </p>
            
            <div className="space-y-4">
              {[
                "Auto claim unauthorized usage",
                "Monetize videos using your music",
                "Claim management system",
                "Revenue tracking"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-rose-500" />
                  </div>
                  <span className="text-sm font-bold text-white/80 uppercase tracking-wide">{feature}</span>
                </div>
              ))}
            </div>

            <p className="text-rose-400 font-black italic uppercase tracking-widest text-[10px]">“Turn every use of your music into income”</p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: OFFICIAL ARTIST CHANNEL (OAC) */}
      <section className="py-32 px-6 relative">
         <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-dark p-12 md:p-20 rounded-[4rem] text-center space-y-8 border-white/5 relative overflow-hidden"
            >
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-electric-blue/10 blur-[100px] -translate-y-1/2"></div>
               <div className="w-20 h-20 bg-electric-blue text-[#0D1B2A] rounded-3xl flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(0,212,255,0.3)] rotate-6">
                  <CheckCircle2 className="w-10 h-10" />
               </div>
               <h2 className="text-4xl md:text-6xl font-black font-display tracking-tight uppercase">Official Artist <br /> <span className="text-electric-blue">Channel (OAC)</span></h2>
               <p className="text-white/60 text-lg font-light max-w-2xl mx-auto">Get your official YouTube artist channel and unify all your content in one place. Upgrade your brand identity instantly.</p>
               
               <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    "Verification Support",
                    "Subscriber Merge",
                    "Brand Identity",
                    "Eligibility Help"
                  ].map((f, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/80">
                      {f}
                    </div>
                  ))}
               </div>
            </motion.div>
         </div>
      </section>

      {/* SECTION 6: USER DASHBOARD MOCK */}
      <section className="py-32 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto text-center space-y-20">
           <div className="space-y-6">
              <h2 className="text-4xl md:text-7xl font-black font-display tracking-tight uppercase">Smart Artist <span className="text-electric-blue">Dashboard</span></h2>
              <div className="flex flex-wrap justify-center gap-6">
                 {["Upload Music", "Track Earnings", "Manage Labels", "Request Takedown", "Download Reports"].map((tab, i) => (
                   <span key={i} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-electric-blue cursor-pointer transition-colors px-4 py-2 border border-white/5 rounded-xl hover:bg-white/5">{tab}</span>
                 ))}
              </div>
           </div>

           <motion.div
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative max-w-6xl mx-auto"
           >
              <div className="glass-dark rounded-[4rem] p-4 md:p-8 border-white/10 shadow-2xl relative z-10 overflow-hidden">
                 <div className="bg-[#0D1B2A] rounded-[3rem] border border-white/5 aspect-video md:aspect-[21/9] flex items-stretch overflow-hidden">
                    {/* Mock Sidebar */}
                    <div className="w-16 md:w-24 bg-white/5 border-r border-white/5 flex flex-col items-center py-10 gap-8">
                       <Layout className="w-6 h-6 text-electric-blue" />
                       <PieChart className="w-6 h-6 text-white/20" />
                       <Music className="w-6 h-6 text-white/20" />
                       <MessageSquare className="w-6 h-6 text-white/20" />
                    </div>
                    {/* Mock Content */}
                    <div className="flex-1 p-8 text-left space-y-8">
                       <div className="flex items-center justify-between">
                          <h5 className="font-black uppercase tracking-tight text-xl">Overview</h5>
                          <div className="w-10 h-10 rounded-full bg-white/10"></div>
                       </div>
                       <div className="grid grid-cols-3 gap-6">
                          <div className="h-32 rounded-3xl bg-white/5 animate-pulse"></div>
                          <div className="h-32 rounded-3xl bg-white/5 animate-pulse" style={{ animationDelay: '100ms' }}></div>
                          <div className="h-32 rounded-3xl bg-electric-blue/10 border border-electric-blue/20 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                       </div>
                       <div className="h-48 rounded-[2rem] bg-white/5 border border-white/5 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                 </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-electric-blue/20 blur-[60px] rounded-full"></div>
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-neon-purple/20 blur-[80px] rounded-full"></div>
           </motion.div>
        </div>
      </section>

      {/* SECTION 7 & 8: SUPPORT & CONTACT */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
           <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-black font-display tracking-tight uppercase">We’re Here to <span className="text-soft-orange">Help You</span></h2>
              <p className="text-white/60 max-w-2xl mx-auto font-light">Join a network where support is a priority, not an afterthought.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Email Support", desc: "Fast response for technical issues.", icon: Mail, contact: "musicdistributionindia.in@gmail.com" },
                { title: "Phone Support", desc: "Direct assistance for priority artists.", icon: Phone, contact: "011-69652811" },
                { title: "WhatsApp Support", desc: "Chat with us anytime for quick help.", icon: MessageCircle, contact: "+91 7742789827" },
              ].map((item, i) => (
                <div key={i} className="p-10 glass-dark rounded-[3rem] border-white/5 hover:bg-white/5 transition-all text-center space-y-6">
                   <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-soft-orange">
                      <item.icon className="w-8 h-8" />
                   </div>
                   <h3 className="text-xl font-bold uppercase tracking-tight">{item.title}</h3>
                   <p className="text-white/40 text-sm">{item.desc}</p>
                   <p className="text-xs font-black text-soft-orange transition-all break-all">{item.contact}</p>
                </div>
              ))}
           </div>

           {/* Contact Detail Integrated Card */}
           <div className="max-w-3xl mx-auto text-center glass-dark p-12 md:p-16 rounded-[4rem] border-white/10 space-y-8">
              <h3 className="text-3xl font-black font-display uppercase tracking-tight">Need Immediate Signal?</h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                 <a 
                   href="mailto:musicdistributionindia.in@gmail.com"
                   className="flex items-center gap-3 px-8 py-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all font-bold text-xs uppercase"
                 >
                    <Mail className="w-4 h-4 text-electric-blue" /> Email Now
                 </a>
                 <a 
                   href="https://wa.me/917742789827"
                   className="flex items-center gap-3 px-8 py-4 bg-[#25D366]/20 rounded-2xl border border-[#25D366]/20 hover:bg-[#25D366]/30 transition-all font-bold text-xs uppercase text-[#25D366]"
                 >
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                 </a>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 10: FINAL CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
         <div className="absolute inset-0 bg-linear-to-r from-electric-blue via-neon-purple to-soft-orange opacity-10 blur-3xl rounded-full scale-110"></div>
         <div className="max-w-5xl mx-auto relative z-10 glass-dark p-12 md:p-32 rounded-[5rem] text-center space-y-12 border-white/10">
            <h2 className="text-4xl md:text-8xl font-black font-display tracking-tight uppercase leading-[0.85]">Ready to Share Your Music <span className="text-electric-blue">with the World?</span></h2>
            <p className="text-lg md:text-2xl text-white/60 font-light max-w-3xl mx-auto">Join thousands of artists already growing with IND Distribution.</p>
            <Link to="/auth?mode=signup" className="inline-flex items-center gap-4 px-12 py-6 bg-electric-blue text-[#0D1B2A] rounded-3xl font-black text-lg uppercase tracking-[0.2em] shadow-[0_30px_60px_rgba(0,212,255,0.4)] hover:-translate-y-3 transition-all group">
               Get Started Now <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 border-t border-white/5 bg-[#081320]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center rotate-12 shadow-lg">
                <Music className="text-white w-6 h-6 -rotate-12" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tighter">IND Distribution</span>
            </div>
            <p className="text-white/40 max-w-sm font-light leading-relaxed">The ultimate ecosystem for independent music creators and labels. Direct to 250+ stores.</p>
            <div className="flex gap-4">
               {[Mail, Youtube, Layout].map((Icon, i) => (
                 <div key={i} className="w-12 h-12 rounded-full glass-dark flex items-center justify-center border-white/10 hover:bg-electric-blue hover:text-[#0D1B2A] transition-all cursor-pointer">
                    <Icon className="w-5 h-5" />
                 </div>
               ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-black uppercase tracking-widest text-[10px] text-white/40 mb-8 italic">Navigation</h4>
            <ul className="space-y-4 text-xs font-bold text-white/60 uppercase tracking-widest">
               <li><Link to="/features" className="hover:text-electric-blue">Features</Link></li>
               <li><a href="/#pricing" className="hover:text-electric-blue">Pricing</a></li>
               <li><Link to="/auth?mode=signup" className="hover:text-electric-blue">Join Network</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-black uppercase tracking-widest text-[10px] text-white/40 mb-8 italic">Company</h4>
            <ul className="space-y-4 text-xs font-bold text-white/60 uppercase tracking-widest">
               <li><Link to="/auth?mode=login" className="hover:text-electric-blue">Artist Login</Link></li>
               <li><a href="mailto:musicdistributionindia.in@gmail.com" className="hover:text-electric-blue">Contact Us</a></li>
               <li><a href="#" className="hover:text-electric-blue">Privacy Legal</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          <p>© {new Date().getFullYear()} IND Distribution. POWERED BY AI STUDIO.</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> Asia / India / Global</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
