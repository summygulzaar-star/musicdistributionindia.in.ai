import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Music, Chrome, ArrowRight, User } from "lucide-react";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (signInErr: any) {
          if (signInErr.code === 'auth/user-not-found' && email.toLowerCase() === "musicdistributionindia.in@gmail.com") {
            setError("Admin account not initialized. Please use 'Create Account' with these credentials first.");
            return;
          }
          if (signInErr.code === 'auth/operation-not-allowed') {
            setError("Email/Password login is not enabled in Firebase Console. Please follow the instructions provided by the AI to enable it.");
            return;
          }
          throw signInErr;
        }
      }
      navigate("/dashboard");
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password login is not enabled in Firebase Console. Please follow the instructions provided by the AI to enable it.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light p-6 overflow-hidden relative">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-brand-blue/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 -right-20 w-[40rem] h-[40rem] bg-brand-purple/10 blur-[100px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass p-10 rounded-[4rem] relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center rotate-12 shadow-xl mb-6">
            <Music className="text-white w-8 h-8 -rotate-12" />
          </Link>
          <h2 className="font-display text-4xl font-bold tracking-tighter text-center">
            {mode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}
          </h2>
          <p className="text-brand-dark/50 text-sm mt-2">The future of distribution awaits you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-2"
              >
                <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/20" />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/50 border border-brand-dark/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-light"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/20" />
              <input 
                type="email" 
                placeholder="you@email.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/50 border border-brand-dark/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-light"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 ml-4">Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-dark/20" />
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 border border-brand-dark/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all font-light"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs ml-4">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-premium btn-glow py-4 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Sign Up"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-[1px] bg-brand-dark/5"></div>
          <span className="text-xs uppercase tracking-widest text-brand-dark/20 font-bold">Or continue with</span>
          <div className="flex-1 h-[1px] bg-brand-dark/5"></div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="w-full glass mt-6 py-4 flex items-center justify-center gap-3 hover:bg-brand-blue/5 transition-all rounded-3xl"
        >
          <Chrome className="w-5 h-5 text-brand-blue" />
          <span className="text-sm font-medium">Google Account</span>
        </button>

        <p className="text-center text-sm mt-8 text-brand-dark/40">
          {mode === "login" ? "New to IND?" : "Already have an account?"}
          <Link 
            to={mode === "login" ? "/auth?mode=signup" : "/auth?mode=login"}
            className="text-brand-blue font-bold ml-1 hover:underline"
          >
            {mode === "login" ? "Create Account" : "Sign In"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
