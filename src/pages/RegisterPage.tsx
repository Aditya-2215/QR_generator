import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { QrCode, User as UserIcon, Mail, Lock, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";

interface RegisterPageProps {
  onNavigate: (view: "landing" | "dashboard" | "login" | "register") => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      onNavigate("dashboard");
    } catch (err: any) {
      setLocalError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-24 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-indigo-200/30 dark:bg-indigo-950/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-purple-200/30 dark:bg-purple-950/10 blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            onClick={() => onNavigate("landing")}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-lg cursor-pointer transform hover:scale-105 transition-transform"
          >
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mt-2">
            Create an account
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign up to persist, favorite, and download your brand codes.
          </p>
        </div>

        {localError && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 text-red-500 dark:text-red-400 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-primary dark:focus:border-brand-accent focus:ring-1 focus:ring-brand-primary/20 dark:focus:ring-brand-accent/20 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-primary dark:focus:border-brand-accent focus:ring-1 focus:ring-brand-primary/20 dark:focus:ring-brand-accent/20 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-primary dark:focus:border-brand-accent focus:ring-1 focus:ring-brand-primary/20 dark:focus:ring-brand-accent/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-brand-primary dark:hover:bg-brand-primary text-white dark:text-slate-900 hover:text-white font-semibold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <hr className="border-slate-100 dark:border-slate-800/60" />

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <button
            onClick={() => onNavigate("login")}
            className="font-bold text-brand-primary dark:text-brand-accent hover:underline cursor-pointer"
          >
            Sign In Instead
          </button>
        </div>
      </div>
    </div>
  );
};
