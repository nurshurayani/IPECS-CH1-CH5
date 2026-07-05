import React, { useState } from "react";
import { ShieldAlert, ArrowLeft, Lock, Sparkles } from "lucide-react";

interface AdminLoginProps {
  lang: "EN" | "BM";
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ lang, onLoginSuccess, onBack }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isBm = lang === "BM";

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      onLoginSuccess();
    } else {
      setError(
        isBm
          ? "Kata laluan pentadbir salah! Sila gunakan 'admin123'."
          : "Incorrect admin password! Please use 'admin123'."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Red accent glow for Admin Section */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-red-500/5 rounded-full filter blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-rose-500/5 rounded-full filter blur-[120px] animate-pulse delay-75"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-rose-950/20 relative z-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs mb-8 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          {isBm ? "Kembali ke Log Masuk" : "Back to Student Login"}
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl mb-4">
            <ShieldAlert className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-display">
            {isBm ? "Portal Pentadbir" : "Admin Dashboard Portal"}
          </h1>
          <p className="text-slate-400 mt-2 text-xs max-w-xs mx-auto">
            {isBm
              ? "Akses keselamatan tinggi untuk pengurusan pangkalan data & pemantauan perbelanjaan pelajar."
              : "High-security access for database management & multi-user expense auditing."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs leading-relaxed animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {isBm ? "Kata Laluan Pentadbir" : "Admin Password"}
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
                className="w-full pl-11 pr-4 py-3.5 bg-slate-850/50 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-2xl text-white text-sm transition-all outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 tracking-wide transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isBm ? "Sahkan Log Masuk Pentadbir" : "Authenticate Admin Session"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <span className="opacity-80">{isBm ? "Petunjuk Kata Laluan: " : "Password Hint: "}</span>
          <code className="text-red-400/90 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10 font-mono">
            admin123
          </code>
        </div>
      </div>
    </div>
  );
};
