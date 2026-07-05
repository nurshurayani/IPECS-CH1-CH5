import React, { useState } from "react";
import { Lock, User, Sparkles, HelpCircle } from "lucide-react";

interface LoginScreenProps {
  lang: "EN" | "BM";
  onLogin: (username: string) => void;
  onAdminGate: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ lang, onLogin, onAdminGate }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isBm = lang === "BM";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === "amirul" && password === "ipecs2026") {
      onLogin("Amirul Syafiq");
    } else {
      setError(
        isBm
          ? "Nama pengguna atau kata laluan salah! Sila gunakan amirul / ipecs2026."
          : "Incorrect username or password! Please use amirul / ipecs2026."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients for Glassmorphism */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full filter blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full filter blur-[120px] animate-pulse delay-75"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-emerald-500/5 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mb-4 relative">
            <Sparkles className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display">
            IPECS
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-xs mx-auto">
            {isBm
              ? "Sistem Klasifikasi Perbelanjaan Peribadi Pintar"
              : "Intelligent Personal Expense Categorization System"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs leading-relaxed animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {isBm ? "Nama Pengguna" : "Username"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. amirul"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-800/40 border border-slate-700/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl text-white text-sm transition-all outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {isBm ? "Kata Laluan" : "Password"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-800/40 border border-slate-700/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl text-white text-sm transition-all outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-905 font-bold rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 tracking-wide transform hover:-translate-y-0.5 active:translate-y-0 text-slate-950"
          >
            {isBm ? "Log Masuk Pelajar" : "Student Login"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={onAdminGate}
            className="hover:text-emerald-400 font-medium transition-colors"
          >
            {isBm ? "Portal Pentadbir (Admin)" : "Admin Portal"}
          </button>
          <div className="flex items-center gap-1.5 opacity-70">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>amirul / ipecs2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
