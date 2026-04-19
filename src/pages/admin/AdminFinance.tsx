import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, where, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, FileText, Plus, Search } from "lucide-react";
import { formatCurrency, cn } from "../../lib/utils";
import { motion } from "motion/react";

export default function AdminFinance() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayouts: 0,
    pendingWithdrawals: 0,
    lastMonthGrowth: 0
  });
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchFinanceData = async () => {
      // Fetch stats from transactions (completed ones)
      const tSnap = await getDocs(collection(db, "transactions"));
      const tData = tSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      const rev = tData.filter(t => t.type === 'earning').reduce((sum, t) => sum + (t.amount || 0), 0);
      const payouts = tData.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((sum, t) => sum + (t.amount || 0), 0);

      // Fetch pending withdrawals from dedicated collection
      const wSnap = await getDocs(query(collection(db, "withdrawals"), where("status", "==", "pending")));
      const pendingData = wSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setStats({
        totalRevenue: rev,
        totalPayouts: payouts,
        pendingWithdrawals: pendingData.length,
        lastMonthGrowth: 0
      });

      setPendingWithdrawals(pendingData);
      
      const recent = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(6));
      const recentSnap = await getDocs(recent);
      setRecentTransactions(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchFinanceData();
  }, []);

  const approveWithdrawal = async (w: any) => {
    if (!confirm(`Approve liquidation of ${formatCurrency(w.amount)}?`)) return;
    try {
      // 1. Get user document
      const uRef = doc(db, "users", w.userId);
      const uSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", w.userId)));
      const userData = uSnap.docs[0]?.data();
      
      if (!userData || userData.walletBalance < w.amount) {
        alert("Integrity Failure: User balance insufficient for liquidation.");
        return;
      }

      // 2. Transact (In production this would use Firebase Functions for atomicity)
      await updateDoc(uRef, { walletBalance: userData.walletBalance - w.amount });
      await updateDoc(doc(db, "withdrawals", w.id), { status: 'completed', processedAt: new Date().toISOString() });
      await addDoc(collection(db, "transactions"), {
        userId: w.userId,
        amount: w.amount,
        type: 'withdrawal',
        status: 'completed',
        createdAt: new Date().toISOString()
      });

      alert("Liquidity successfully disbursed.");
      window.location.reload();
    } catch (err) {
      alert("Transmission Error");
    }
  };

  const [showUpload, setShowUpload] = useState(false);
  const [royaltyData, setRoyaltyData] = useState({ userId: "", amount: "", period: "" });

  const handleRoyaltyUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uRef = doc(db, "users", royaltyData.userId);
      const uSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", royaltyData.userId)));
      const userData = uSnap.docs[0]?.data();
      
      if (!userData) {
        alert("Target Identity Not Found");
        return;
      }

      const amt = parseFloat(royaltyData.amount);
      await updateDoc(uRef, { walletBalance: (userData.walletBalance || 0) + amt });
      await addDoc(collection(db, "royalty_reports"), {
        ...royaltyData,
        amount: amt,
        createdAt: new Date().toISOString()
      });
      await addDoc(collection(db, "transactions"), {
        userId: royaltyData.userId,
        amount: amt,
        type: 'earning',
        status: 'completed',
        createdAt: new Date().toISOString()
      });

      alert("Royalties successfully credited.");
      setShowUpload(false);
      window.location.reload();
    } catch (err) {
      alert("Credit Failure");
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
            <h1 className="text-5xl font-black font-display tracking-tight uppercase text-left">Finance Treasury</h1>
            <p className="text-slate-400 font-medium text-left text-xs uppercase tracking-widest mt-2">Global royalty oversight, payout processing, and financial forensics.</p>
         </div>
         <button 
           onClick={() => setShowUpload(true)}
           className="btn-premium bg-emerald-500 text-white py-4 px-10 flex items-center gap-3 shadow-emerald-900/40"
         >
            <Plus className="w-5 h-5" /> BULK ROYALTY IMPORT
         </button>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-6">
           <div className="bg-[#1E293B] w-full max-w-xl rounded-[4rem] p-12 border border-slate-800 shadow-3xl">
              <h2 className="text-3xl font-black font-display uppercase text-white mb-10">Inject <span className="text-emerald-500">Royalties</span></h2>
              <form onSubmit={handleRoyaltyUpload} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Target User UID</label>
                    <input required value={royaltyData.userId} onChange={e => setRoyaltyData({...royaltyData, userId: e.target.value})} className="w-full bg-slate-900 border-slate-700 p-5 rounded-3xl text-sm font-bold text-white" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Volume (INR)</label>
                    <input required type="number" value={royaltyData.amount} onChange={e => setRoyaltyData({...royaltyData, amount: e.target.value})} className="w-full bg-slate-900 border-slate-700 p-5 rounded-3xl text-3xl font-black text-emerald-500" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Cycle (e.g. MARCH 2024)</label>
                    <input required value={royaltyData.period} onChange={e => setRoyaltyData({...royaltyData, period: e.target.value})} className="w-full bg-slate-900 border-slate-700 p-5 rounded-3xl text-sm font-bold text-white" />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowUpload(false)} className="flex-1 py-5 bg-slate-800 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest">Cancel</button>
                    <button type="submit" className="flex-1 py-5 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest">Deploy Credits</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
         {[
           { label: "Gross Platform Revenue", val: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
           { label: "Artist Payouts Distributed", val: formatCurrency(stats.totalPayouts), icon: ArrowUpRight, color: "text-brand-blue", bg: "bg-brand-blue/10" },
           { label: "In-Transit Liquidations", val: stats.pendingWithdrawals, icon: Wallet, color: "text-amber-500", bg: "bg-amber-500/10" },
           { label: "Quarterly Delta", val: "+" + stats.lastMonthGrowth + "%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
         ].map((s, i) => (
           <div key={i} className="bg-[#1E293B] p-10 rounded-[3rem] border border-slate-800 transition-all hover:bg-slate-800/50">
             <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", s.bg)}>
               <s.icon className={cn("w-7 h-7", s.color)} />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 truncate">{s.label}</p>
             <h3 className="text-3xl font-black font-display tracking-tighter text-white">{s.val}</h3>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-[#1E293B] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 p-8 md:p-12 space-y-6 md:space-y-8 shadow-2xl">
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-4 uppercase">
               <ArrowDownLeft className="text-amber-500 w-6 h-6 md:w-8 md:h-8" /> Pending Liquidations
            </h3>
            <div className="space-y-4">
               {pendingWithdrawals.map((w, i) => (
                 <div key={i} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-4 text-left">
                       <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-brand-purple">W</div>
                       <div>
                          <p className="font-bold text-white uppercase text-xs tracking-wider">Withdrawal Request</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase truncate max-w-[150px]">{w.paymentMethod || 'BANK TRANSFER'}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black font-display text-white">{formatCurrency(w.amount)}</p>
                       <button 
                         onClick={() => approveWithdrawal(w)}
                         className="text-[9px] font-black text-brand-purple uppercase tracking-widest mt-2 hover:underline"
                       >
                         PROCESS NOW
                       </button>
                    </div>
                 </div>
               ))}
               {pendingWithdrawals.length === 0 && (
                 <p className="text-slate-500 text-xs font-black uppercase tracking-widest py-10 text-center italic">No pending requests.</p>
               )}
            </div>
         </div>

         <div className="bg-[#1E293B] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-800 p-8 md:p-12 space-y-6 md:space-y-8 shadow-2xl">
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-4 uppercase">
               <FileText className="text-brand-blue w-6 h-6 md:w-8 md:h-8" /> Recent Transactions
            </h3>
            <div className="space-y-4">
               {recentTransactions.map((t, i) => (
                 <div key={i} className="px-6 py-4 rounded-2xl border-b border-white/5 flex items-center justify-between last:border-0 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span className={t.type === 'earning' ? "text-emerald-500" : "text-rose-500"}>{t.type === 'earning' ? 'CREDIT' : 'DEBIT'}</span>
                       <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                       <span className="truncate max-w-[120px]">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={cn("text-sm font-black text-white", t.type === 'earning' ? "text-emerald-500" : "text-white")}>
                      {t.type === 'earning' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                 </div>
               ))}
               {recentTransactions.length === 0 && (
                 <p className="text-slate-500 text-xs font-black uppercase tracking-widest py-10 text-center italic">No transactions found.</p>
               )}
            </div>
            <button className="w-full py-5 bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-700 transition-colors">View All Ledger Logs</button>
         </div>
      </div>
    </div>
  );
}
