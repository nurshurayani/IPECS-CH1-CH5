import React, { useState } from "react";
import { UserProfile, Budget } from "../types";
import { User, Mail, GraduationCap, Calendar, DollarSign, LogOut, Download, AlertTriangle, Settings, RefreshCw, Sparkles, BookOpen } from "lucide-react";

interface AccountViewProps {
  lang: "EN" | "BM";
  profile: UserProfile;
  budgets: Budget;
  onUpdateProfile: (updated: UserProfile) => void;
  onUpdateLang: (lang: "EN" | "BM") => void;
  onDownloadAll: () => void;
  onClearData: () => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  lang,
  profile,
  budgets,
  onUpdateProfile,
  onUpdateLang,
  onDownloadAll,
  onClearData,
  onResetData,
  onLogout,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState(profile.name);
  const [university, setUniversity] = useState(profile.university);
  const [studentId, setStudentId] = useState(profile.studentId);
  const [age, setAge] = useState(profile.age.toString());
  const [allowanceRange, setAllowanceRange] = useState(profile.allowanceRange);

  const [confirmClear, setConfirmClear] = useState(false);
  const [notification, setNotification] = useState("");

  const isBm = lang === "BM";

  const translateCategory = (cat: string) => {
    if (!isBm) return cat;
    switch (cat) {
      case "Food & Dining": return "Makanan & Minuman";
      case "Transport": return "Pengangkutan";
      case "Shopping": return "Membeli-belah";
      case "Bills": return "Bil & Utiliti";
      case "Entertainment": return "Hiburan";
      case "Other": return "Lain-lain";
      default: return cat;
    }
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return "AS";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      university,
      studentId,
      age: parseInt(age) || 21,
      allowanceRange,
    });
    setIsEditMode(false);
    setNotification(isBm ? "Profil berjaya dikemas kini!" : "Student profile details updated!");
    setTimeout(() => setNotification(""), 3000);
  };

  const handleClearTrigger = () => {
    if (confirmClear) {
      onClearData();
      setConfirmClear(false);
      setNotification(isBm ? "Semua rekod perbelanjaan dipadam." : "All ledger transactions deleted.");
      setTimeout(() => setNotification(""), 3000);
    } else {
      setConfirmClear(true);
    }
  };

  return (
    <div className="space-y-8 font-sans animate-fadeIn">
      {/* 1. Page Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>👤 {isBm ? "Akaun Pengguna" : "User Profile & Account"}</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {isBm
            ? "Urus tetapan peranti, pilihan bahasa, sifar pangkalan data, dan maklumat penyelidikan FYP."
            : "Review university credentials, manage language preferences, and handle localized database parameters."}
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Visual Student ID Badge Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col items-center text-center">
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full filter blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-teal-500/10 rounded-full filter blur-2xl"></div>

        {/* Profile Avatar */}
        <div className="relative z-10">
          <div className="w-20 h-20 bg-emerald-500 text-slate-950 font-black text-2xl rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
            {getInitials(profile.name)}
          </div>
        </div>

        <div className="relative z-10 mt-4 space-y-1">
          <h3 className="text-lg font-black text-white tracking-tight">{profile.name}</h3>
          <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
            <GraduationCap className="h-4.5 w-4.5" />
            <span>{profile.university}</span>
          </p>
          <div className="text-[10px] text-slate-400 font-mono tracking-wide pt-1 flex justify-center items-center gap-3">
            <span>ID: {profile.studentId}</span>
            <span className="text-slate-600">|</span>
            <span>{isBm ? "Umur" : "Age"}: {profile.age}</span>
          </div>
          <div className="pt-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full font-mono">
              <DollarSign className="h-3.5 w-3.5" />
              {isBm ? "Elaun" : "Allowance"}: {isBm ? (profile.allowanceRange.replace("Below", "Bawah").replace("Above", "Atas")) : profile.allowanceRange}
            </span>
          </div>
        </div>

        <div className="relative z-10 mt-6 flex justify-center">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="px-4 py-2 bg-[#020617]/80 hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {isEditMode ? (isBm ? "Tutup Borang" : "Close Form") : (isBm ? "✏️ Kemas Kini Profil Pelajar" : "✏️ Edit Student Info")}
          </button>
        </div>
      </div>

      {/* Edit form */}
      {isEditMode && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-xl mx-auto shadow-2xl">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-3 mb-4">
              {isBm ? "Kemas Kini Butiran Profil Pelajar" : "Update Student Profile details"}
            </h4>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                {isBm ? "Nama Penuh" : "Full Name"}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#020617]/60 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                {isBm ? "Universiti / Institusi" : "University / Institution"}
              </label>
              <input
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3 py-2 bg-[#020617]/60 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                  {isBm ? "ID Pelajar / Nombor Matrik" : "Student ID / Matrix Number"}
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#020617]/60 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                  {isBm ? "Umur" : "Age"}
                </label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 bg-[#020617]/60 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                {isBm ? "Elaun Bulanan / Julat Pendapatan" : "Monthly Allowance / Income Range"}
              </label>
              <select
                value={allowanceRange}
                onChange={(e) => setAllowanceRange(e.target.value)}
                className="w-full px-3 py-2 bg-[#020617]/60 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="Below RM500" className="bg-[#020617]">{isBm ? "Bawah RM500" : "Below RM500"}</option>
                <option value="RM500-RM1000" className="bg-[#020617]">RM500-RM1000</option>
                <option value="RM1000-RM2000" className="bg-[#020617]">RM1000-RM2000</option>
                <option value="Above RM2000" className="bg-[#020617]">{isBm ? "Atas RM2000" : "Above RM2000"}</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 bg-[#020617]/50 border border-white/10 hover:bg-white/5 text-slate-400 text-xs font-bold rounded-xl"
              >
                {isBm ? "Batal" : "Cancel"}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
              >
                {isBm ? "Simpan Perubahan" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Preferences & configuration sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preferences & Budgets preview */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
              <Settings className="h-4.5 w-4.5 text-emerald-400" />
              <span>{isBm ? "Pilihan Aplikasi" : "App Preferences"}</span>
            </h4>

            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block mb-2">
                {isBm ? "Pilihan Bahasa" : "Language Selection / Bahasa"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateLang("EN")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    lang === "EN"
                      ? "bg-emerald-500 border-emerald-500 text-slate-950"
                      : "bg-[#020617]/50 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  English (EN)
                </button>
                <button
                  onClick={() => onUpdateLang("BM")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    lang === "BM"
                      ? "bg-emerald-500 border-emerald-500 text-slate-950"
                      : "bg-[#020617]/50 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  Bahasa Melayu (BM)
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
              <BookOpen className="h-4.5 w-4.5 text-emerald-400" />
              <span>{isBm ? "Mengenai IPECS (Maklumat FYP)" : "About IPECS (FYP Info)"}</span>
            </h4>

            <div className="text-xs space-y-2 leading-relaxed text-slate-300">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-500">{isBm ? "Nama Aplikasi:" : "App Name:"}</span>
                <span className="font-bold text-white">IPECS - Intelligent Expense Categorization</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-500">{isBm ? "Versi:" : "Version:"}</span>
                <span className="font-bold text-white">1.0.0</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-500">{isBm ? "Dibangunkan Oleh:" : "Developed By:"}</span>
                <span className="font-bold text-white">Nurshurayani</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-500">{isBm ? "Institusi:" : "Institution:"}</span>
                <span className="font-bold text-white">Universiti Malaysia Sabah</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isBm ? "Kod FYP:" : "FYP Code:"}</span>
                <span className="font-bold text-white">KD34603 Project</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database control panel (Danger zone) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
            <AlertTriangle className="h-4.5 w-4.5 text-emerald-400" />
            <span>{isBm ? "Operasi & Pengurusan Data" : "Data Operations & Management"}</span>
          </h4>

          <div className="space-y-4">
            <button
              onClick={onDownloadAll}
              className="w-full px-4 py-3 bg-[#020617]/50 hover:bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>{isBm ? "Eksport rekod Ledger (CSV)" : "Export Ledger records (CSV)"}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-semibold">{isBm ? "SEMUA DATA" : "ALL DATA"}</span>
            </button>

            <button
              onClick={onResetData}
              className="w-full px-4 py-3 bg-[#020617]/50 hover:bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-emerald-400 group-hover:rotate-180 transition-all duration-500" />
                <span>{isBm ? "Set semula ke data sampel asal" : "Reset to original sample data"}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-semibold">{isBm ? "SAMPEL PEMBANGUN" : "DEVELOPER SAMPLE"}</span>
            </button>

            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                Danger Zone / Zon Bahaya
              </span>

              <button
                onClick={handleClearTrigger}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold text-left flex items-center justify-between border transition-all cursor-pointer ${
                  confirmClear
                    ? "bg-red-500 text-slate-950 border-red-500 animate-pulse"
                    : "bg-red-500/10 hover:bg-red-500/20 border-red-500/25 text-red-400"
                }`}
              >
                <span>
                  {confirmClear
                    ? isBm
                      ? "⚠️ Klik Lagi Untuk Sahkan Padam!"
                      : "⚠️ Click again to confirm wipe!"
                    : isBm
                    ? "🗑️ Padam Semua Transaksi"
                    : "🗑️ Wipe all local ledger logs"}
                </span>
                {confirmClear && (
                  <span className="text-[10px] font-extrabold uppercase">{isBm ? "PADAM SEGERA" : "IMMEDIATE WIPE"}</span>
                )}
              </button>

              {confirmClear && (
                <button
                  onClick={() => setConfirmClear(false)}
                  className="w-full py-2 bg-[#020617]/50 hover:bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  {isBm ? "Batal" : "Cancel"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Logout Session Action button */}
      <div className="pt-6 border-t border-white/5 flex justify-center">
        <button
          onClick={onLogout}
          className="px-8 py-3.5 bg-[#020617]/80 hover:bg-red-500/80 border-2 border-red-500/30 hover:border-red-500 text-red-400 hover:text-white font-extrabold rounded-2xl text-xs transition-all duration-300 tracking-wider flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
          <span>{isBm ? "LOG KELUAR SESI PELAJAR" : "TERMINATE STUDENT SESSION (LOGOUT)"}</span>
        </button>
      </div>
    </div>
  );
};

// Simple mock for CheckCircle because it's imported correctly or fallback can be used.
const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
  <span className={className}>✓</span>
);
