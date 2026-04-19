import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard,
  Users, 
  Music, 
  Wallet, 
  Mic2,
  Building,
  Youtube,
  Fingerprint,
  Zap,
  Globe,
  Bell,
  Ticket,
  FileText,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
  ArrowLeft,
  Search,
  Menu,
  X
} from "lucide-react";
import { auth } from "../lib/firebase";
import { useAuth } from "../App";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

const ADMIN_NAV = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "Releases", icon: Music, path: "/admin/releases" },
  { label: "Finance", icon: Wallet, path: "/admin/finance" },
  { label: "Artists", icon: Mic2, path: "/admin/artists" },
  { label: "Labels", icon: Building, path: "/admin/labels" },
  { label: "OAC Requests", icon: Youtube, path: "/admin/oac" },
  { label: "Content ID", icon: Fingerprint, path: "/admin/content-id" },
  { label: "Plans", icon: Zap, path: "/admin/plans" },
  { label: "Platforms", icon: Globe, path: "/admin/platforms" },
  { label: "Notifications", icon: Bell, path: "/admin/notifications" },
  { label: "Support Tickets", icon: Ticket, path: "/admin/support" },
  { label: "CMS", icon: FileText, path: "/admin/cms" },
  { label: "Reports", icon: BarChart3, path: "/admin/reports" },
  { label: "Security Logs", icon: ShieldAlert, path: "/admin/logs" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-[#0F172A] text-slate-100 overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 h-full border-r border-slate-800 bg-[#1E293B] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] lg:relative transform shadow-2xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2 text-left">
              <div className="w-10 h-10 bg-brand-purple rounded-2xl flex items-center justify-center rotate-12 shadow-lg shadow-purple-900/20">
                <Zap className="text-white w-6 h-6 -rotate-12" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tighter">IND<span className="text-brand-purple"> ADMIN</span></span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left">Enterprise Control</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {ADMIN_NAV.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.label}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 font-bold text-[11px] uppercase tracking-wider",
                  isActive 
                    ? "bg-brand-purple text-white shadow-xl shadow-purple-900/20 border-r-4 border-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800 flex flex-col gap-4">
          <Link 
            to="/dashboard"
            onClick={() => {
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className="flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Artist Dashboard
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-4 text-slate-500 hover:text-red-400 transition-colors text-sm font-bold"
          >
            <LogOut className="w-5 h-5" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Topbar */}
        <header className="h-20 bg-[#1E293B]/80 backdrop-blur-xl border-b border-slate-800 px-4 lg:px-10 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4 lg:gap-8 flex-1">
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className={cn(
                  "p-3 bg-slate-800 rounded-xl text-slate-400 lg:hidden hover:text-white transition-all",
                  isSidebarOpen ? "hidden" : "block"
                )}
             >
                <Menu className="w-6 h-6" />
             </button>
             <div className="relative max-w-md w-full hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Seach users, releases, ISRC..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-full py-2.5 pl-12 pr-6 text-xs focus:ring-2 focus:ring-brand-purple transition-all outline-none"
                />
             </div>
             <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden lg:flex items-center gap-3">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
               Grid Status: Secure
             </h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-800"></span>
            </button>
            <div className="flex items-center gap-4 px-4 py-2 bg-slate-800/50 rounded-[1.2rem] border border-slate-700/50 group hover:border-brand-purple transition-all cursor-pointer">
               <div className="text-right">
                  <p className="text-xs font-black text-white leading-none uppercase tracking-tighter">{profile?.displayName}</p>
                  <p className="text-[9px] font-bold text-brand-purple uppercase mt-1">Super Admin</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:rotate-6 transition-transform">
                  {profile?.displayName?.[0] || "A"}
               </div>
            </div>
          </div>
        </header>

        {/* Admin Scrollable Viewport */}
        <section className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-[#0F172A] custom-scrollbar">
          <div className="max-w-7xl mx-auto">
             <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}
