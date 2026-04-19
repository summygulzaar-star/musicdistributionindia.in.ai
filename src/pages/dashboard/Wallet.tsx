import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, orderBy, limit } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../App";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  Building,
  Smartphone,
  ChevronRight,
  ArrowDownWideNarrow
} from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function Wallet() {
  const { user, profile } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"UPI" | "Bank">("UPI");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState({ account: "", ifsc: "", name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    // Fetch Withdrawals
    const wSnap = await getDocs(query(
      collection(db, "withdrawals"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    ));
    setWithdrawals(wSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    // Fetch Recent Earnings (mocked as royalty reports in real scenario)
    const tSnap = await getDocs(query(
      collection(db, "royalty_reports"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    ));
    setRecentTransactions(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amount = parseFloat(withdrawAmount);

    if (amount < 500) {
      setError("Minimum withdrawal amount is ₹500");
      return;
    }
    if (amount > (profile?.walletBalance || 0)) {
      setError("Insufficient balance in your treasury");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "withdrawals"), {
        userId: user.uid,
        amount,
        method: withdrawMethod,
        details: withdrawMethod === "UPI" ? { upiId } : bankDetails,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      fetchData();
      alert("Withdrawal request transmitted to finance board.");
    } catch (err) {
      setError("Failed to process request. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 animate-pulse text-slate-400">Syncing Ledger...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row justify-between gap-10">
         <div className="flex-1 space-y-8">
            <h1 className="text-5xl font-black font-display tracking-tight uppercase">TREASURY <span className="text-brand-blue">DASHBOARD</span></h1>
            
            {/* Balance Card - Premium Glass */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative p-12 rounded-[4rem] bg-brand-dark overflow-hidden group shadow-2xl"
            >
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-blue/20 blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
               <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Consolidated Assets</p>
                     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                        <WalletIcon className="w-6 h-6 text-brand-blue" />
                     </div>
                  </div>
                  <h2 className="text-7xl font-black font-display tracking-tighter text-white">
                     {formatCurrency(profile?.walletBalance || 0)}
                  </h2>
                  <div className="flex items-center gap-6 mt-4">
                     <button 
                       onClick={() => setShowWithdrawModal(true)}
                       className="px-10 py-4 bg-brand-blue text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
                     >
                        Request Withdrawal
                     </button>
                     <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">+4.2% Growth</span>
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* Quick Wallet Stats */}
            <div className="grid grid-cols-2 gap-6">
               <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Revenue Generated</p>
                  <p className="text-3xl font-black font-display">{formatCurrency(profile?.walletBalance || 0)}</p>
               </div>
               <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pending Withdrawals</p>
                  <p className="text-3xl font-black font-display">
                     {formatCurrency(withdrawals.filter(w => w.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0))}
                  </p>
               </div>
            </div>
         </div>

         <div className="w-full lg:w-96 space-y-6">
            <h3 className="text-xl font-black font-display tracking-tight uppercase flex items-center gap-3">
               <Clock className="w-5 h-5 text-brand-blue" /> Audit Timeline
            </h3>
            <div className="space-y-4">
               {recentTransactions.map((t, i) => (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={t.id} 
                    className="p-5 bg-white rounded-3xl border border-slate-50 flex items-center gap-4 group"
                  >
                     <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <ArrowDownLeft className="w-5 h-5" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tight">Royalty Credit: {t.period}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</p>
                     </div>
                     <p className="font-black text-emerald-600 text-sm">+{formatCurrency(t.amount)}</p>
                  </motion.div>
               ))}
               {recentTransactions.length === 0 && (
                 <div className="p-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                   No Recent Inflow
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Withdrawal Requests Table */}
      <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100">
         <h3 className="text-2xl font-black font-display tracking-tight mb-8 uppercase flex items-center gap-4">
            <ArrowDownWideNarrow className="w-8 h-8 text-rose-500" /> Withdrawal History
         </h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-50">
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Target</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Requested On</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Volume</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Security Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-6">
                          <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{w.method === 'UPI' ? w.details.upiId : w.details.account}</p>
                       </td>
                       <td className="py-6">
                          <div className="flex items-center gap-2">
                             {w.method === 'UPI' ? <Smartphone className="w-3.5 h-3.5 text-brand-blue" /> : <Building className="w-3.5 h-3.5 text-slate-400" />}
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{w.method}</span>
                          </div>
                       </td>
                       <td className="py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(w.createdAt).toLocaleDateString()}
                       </td>
                       <td className="py-6 text-right">
                          <p className="font-black text-slate-900">{formatCurrency(w.amount)}</p>
                       </td>
                       <td className="py-6 text-right">
                          <span className={cn(
                             "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                             w.status === 'completed' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
                             w.status === 'pending' ? "bg-brand-blue/5 border-brand-blue/10 text-brand-blue" : 
                             "bg-rose-50 border-rose-100 text-rose-600"
                          )}>
                             <div className={cn("w-1.5 h-1.5 rounded-full", 
                                w.status === 'completed' ? "bg-emerald-500" : 
                                w.status === 'pending' ? "bg-brand-blue" : "bg-rose-500"
                             )}></div>
                             {w.status}
                          </span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
            {withdrawals.length === 0 && (
              <div className="p-20 text-center">
                 <p className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">Liquid Assets Undisbursed</p>
              </div>
            )}
         </div>
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ y: 100, scale: 0.9, opacity: 0 }}
               animate={{ y: 0, scale: 1, opacity: 1 }}
               className="bg-white max-w-xl w-full rounded-[4rem] p-12 relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]"
             >
                <div className="absolute top-0 left-0 w-full h-[6px] bg-linear-to-r from-brand-blue to-emerald-500"></div>
                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                   <CheckCircle2 className="w-5 h-5 rotate-45" />
                </button>

                <div className="space-y-10">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-brand-blue rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
                         <CreditCard className="w-8 h-8" />
                      </div>
                      <div>
                         <h3 className="text-3xl font-black font-display uppercase tracking-tight">Withdraw <span className="text-brand-blue">Capital</span></h3>
                         <p className="text-slate-400 font-medium">Available: {formatCurrency(profile?.walletBalance || 0)}</p>
                      </div>
                   </div>

                   <form onSubmit={handleWithdraw} className="space-y-8">
                      {error && (
                        <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className="p-4 bg-rose-50 rounded-2xl flex items-center gap-3 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">
                           <AlertCircle className="w-4 h-4" /> {error}
                        </motion.div>
                      )}

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Amount (Min ₹500)</label>
                         <div className="relative">
                            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₹</span>
                            <input 
                              type="number"
                              required
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              className="w-full bg-slate-50 border-none rounded-[2rem] p-6 pl-14 text-2xl font-black text-slate-800 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all"
                              placeholder="0.00"
                            />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <button 
                           type="button" 
                           onClick={() => setWithdrawMethod("UPI")}
                           className={cn(
                             "p-6 rounded-3xl border-2 flex items-center gap-4 transition-all",
                             withdrawMethod === "UPI" ? "border-brand-blue bg-brand-blue/5" : "border-slate-100 bg-slate-50 opacity-60"
                           )}
                         >
                            <Smartphone className="w-5 h-5 text-brand-blue" />
                            <span className="text-xs font-black uppercase tracking-widest">PhonePe / UPI</span>
                         </button>
                         <button 
                           type="button" 
                           onClick={() => setWithdrawMethod("Bank")}
                           className={cn(
                             "p-6 rounded-3xl border-2 flex items-center gap-4 transition-all",
                             withdrawMethod === "Bank" ? "border-brand-blue bg-brand-blue/5" : "border-slate-100 bg-slate-50 opacity-60"
                           )}
                         >
                            <Building className="w-5 h-5 text-slate-600" />
                            <span className="text-xs font-black uppercase tracking-widest">Bank Direct</span>
                         </button>
                      </div>

                      <AnimatePresence mode="wait">
                         {withdrawMethod === "UPI" ? (
                           <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">UPI VPA Address</label>
                              <input 
                                required
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-3xl p-5 text-sm font-bold tracking-widest"
                                placeholder="username@bank"
                              />
                           </motion.div>
                         ) : (
                           <motion.div key="bank" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Account Number</label>
                                 <input required value={bankDetails.account} onChange={(e) => setBankDetails({...bankDetails, account: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">IFSC Code</label>
                                    <input required value={bankDetails.ifsc} onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-mono font-bold tracking-widest" />
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Holder Name</label>
                                    <input required value={bankDetails.name} onChange={(e) => setBankDetails({...bankDetails, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" />
                                 </div>
                              </div>
                           </motion.div>
                         )}
                      </AnimatePresence>

                      <button 
                        disabled={submitting}
                        className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-brand-blue transition-all disabled:opacity-50"
                      >
                         {submitting ? "Initiating Transmission..." : <>Deploy Fund Request <ChevronRight className="w-4 h-4" /></>}
                      </button>
                      <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">Funds typically reflect within 3-5 standard business rotations</p>
                   </form>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
