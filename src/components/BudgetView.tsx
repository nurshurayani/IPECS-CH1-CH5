import React, { useState } from "react";
import { Budget, Transaction } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { DollarSign, CheckCircle, AlertCircle, Save, TrendingUp } from "lucide-react";
import { CATEGORY_HISTORICAL, HISTORICAL_SPENDING } from "../data";

interface BudgetViewProps {
  lang: "EN" | "BM";
  budgets: Budget;
  transactions: Transaction[];
  onUpdateBudgets: (updatedBudgets: Budget) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  lang,
  budgets,
  transactions,
  onUpdateBudgets,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"current" | "history">("current");

  // Form states for budgets bulk editing
  const [formBudgets, setFormBudgets] = useState<Budget>({ ...budgets });

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

  const juneTransactions = transactions.filter((t) => t.date.startsWith("2025-06"));

  const handleSliderChange = (cat: string, val: number) => {
    setFormBudgets((prev) => ({
      ...prev,
      [cat]: val,
    }));
  };

  const handleSaveAllBudgets = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBudgets({ ...formBudgets });
    setNotification(
      isBm
        ? "Had bajet berjaya dikemas kini untuk semua kategori!"
        : "Budget limits successfully synchronized for all categories!"
    );
    setTimeout(() => setNotification(""), 3500);
  };

  return (
    <div className="space-y-8 font-sans animate-fadeIn">
      {/* 1. Title Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          {isBm ? "Siling & Tetapan Bajet" : "Budget Goal Management"}
        </h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {isBm
            ? "Urus had bulanan anda untuk mengelakkan perbelanjaan berlebihan dan menganalisis corak simpanan jangka panjang."
            : "Define smart thresholds to curb overspending and track historical student allowance margins."}
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Sub Tabs */}
      <div className="flex border-b border-slate-800 text-xs uppercase tracking-wider font-bold">
        <button
          onClick={() => setActiveSubTab("current")}
          className={`pb-3 px-4 transition-all ${
            activeSubTab === "current"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {isBm ? "Had Bulan Semasa (Jun)" : "Current Month Limits (June)"}
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          className={`pb-3 px-4 transition-all ${
            activeSubTab === "history"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {isBm ? "Analisis Sejarah Perbelanjaan" : "Historical Monthly Analysis"}
        </button>
      </div>

      {/* 3. Render Views */}
      {activeSubTab === "current" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Progress Indicators & Warnings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                {isBm ? "Status Siling Setiap Kategori" : "Threshold Health Check"}
              </h3>

              <div className="space-y-4">
                {(Object.entries(budgets) as [string, number][]).map(([category, limit]) => {
                  const actual = juneTransactions
                    .filter((t) => t.category === category)
                    .reduce((sum, t) => sum + t.amount, 0);
                  const usageRatio = limit > 0 ? actual / limit : 0;

                  let badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                  let statusText = isBm ? "Selamat" : "On Track";
                  if (usageRatio > 1) {
                    badgeColor = "text-red-400 bg-red-500/10 border-red-500/20";
                    statusText = isBm ? "Lebih Bajet!" : "Over Budget!";
                  } else if (usageRatio > 0.8) {
                    badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                    statusText = isBm ? "Amaran" : "At Risk";
                  }

                  return (
                    <div key={category} className="space-y-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-white font-bold">{translateCategory(category)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                          {statusText}
                        </span>
                      </div>
                      <div className="w-full bg-[#020617]/60 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            usageRatio > 1
                              ? "bg-red-500"
                              : usageRatio > 0.8
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(usageRatio * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>{isBm ? `Belanja: RM ${actual.toFixed(1)}` : `Spent: RM ${actual.toFixed(1)}`}</span>
                        <span>{isBm ? `Had: RM ${limit.toFixed(0)}` : `Limit: RM ${limit.toFixed(0)}`}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex gap-4 text-xs text-slate-400 shadow-xl">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-white mb-0.5">
                  {isBm ? "Bagaimana had mempengaruhi sistem amaran" : "How limits affect warning systems"}
                </p>
                <p className="leading-relaxed text-[11px]">
                  {isBm
                    ? "Apabila perbelanjaan menghampiri 80% siling, modul kecerdasan buatan akan mencetuskan Amaran Anomali dalam tab amaran."
                    : "Once spending exceeds 80% of any category's designated limit, our background AI loops will fire automated warning callouts."}
                </p>
              </div>
            </div>
          </div>

          {/* Bulk Sliders form */}
          <div className="lg:col-span-7">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <form onSubmit={handleSaveAllBudgets} className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {isBm ? "Edit Had Siling Berkelompok" : "Adjust Allocations (Bulk Editor)"}
                  </h3>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isBm ? "Simpan Semua" : "Save All Budgets"}</span>
                  </button>
                </div>

                <div className="space-y-5">
                  {(Object.entries(formBudgets) as [string, number][]).map(([category, value]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{translateCategory(category)}</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          RM {value}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="10"
                          value={value}
                          onChange={(e) => handleSliderChange(category, parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 h-1 bg-[#020617] rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => handleSliderChange(category, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-[#020617]/50 border border-white/10 rounded-lg text-xs font-bold text-center text-white outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* History spending vs actual graphs */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HISTORICAL_SPENDING.map((hist) => (
              <div key={hist.month} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center shadow-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  {hist.month} Spending
                </span>
                <span className="text-2xl font-black text-white block">
                  RM {hist.actual.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Budget ceiling: RM {hist.budget}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {isBm ? "Carta Had Sejarah vs Perbelanjaan Sebenar" : "Historical Multi-Month Category Analytics"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isBm
                  ? "Bandingkan perbelanjaan April, Mei, dan Jun dengan siling had sasaran anda untuk mengesan arah aliran."
                  : "Track your actual performance against your allocated limits for April, May, and June."}
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={CATEGORY_HISTORICAL}
                  margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value) => [`RM ${value}`, ""]}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10, pt: 10 }} />
                  <Bar dataKey="April" fill="#14b8a6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="May" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="June" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="limit" fill="rgba(255, 255, 255, 0.1)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
