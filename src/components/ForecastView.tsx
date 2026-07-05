import React, { useState } from "react";
import { Alert, Budget, Transaction } from "../types";
import { AlertCircle, Trash2, HelpCircle, RefreshCw, Star, HelpCircle as TipIcon, Sparkles } from "lucide-react";

interface ForecastViewProps {
  lang: "EN" | "BM";
  alerts: Alert[];
  budgets: Budget;
  transactions: Transaction[];
  onDismissAlert: (id: string) => void;
  onReviewAlert: () => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  lang,
  alerts,
  budgets,
  transactions,
  onDismissAlert,
  onReviewAlert,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFc, setActiveFc] = useState<any | null>(null);

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

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  const handleRefreshForecast = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Calculate total limits and totals to give realistic forecast numbers
      const totalBudget = (Object.values(budgets) as number[]).reduce((sum, b) => sum + b, 0);
      const totalActualJune = transactions
        .filter((t) => t.date.startsWith("2025-06"))
        .reduce((sum, t) => sum + t.amount, 0);

      // Simulated Gemini JSON response structure as parsed in gemini_helper.py
      const mockResult = {
        projected_total: totalActualJune > 0 ? totalActualJune * 1.35 : 595.0,
        confidence: isBm ? "Tinggi" : "High",
        tip: isBm
          ? "Sesi kedai Mamak berharga RM15! Tetapkan had maksimum dua kali seminggu, kawan. Tambah kekunci rahsia GEMINI_API_KEY di panel Secrets untuk ramalan aktif."
          : "Mamak sessions cost RM15! Set limit to maximum twice a week, buddy. Add GEMINI_API_KEY secret for active forecasts.",
        by_category: {
          "Food & Dining": (budgets["Food & Dining"] || 300) * 0.92,
          Transport: (budgets["Transport"] || 100) * 0.95,
          Shopping: (budgets["Shopping"] || 150) * 0.88,
          Bills: budgets["Bills"] || 60,
          Entertainment: (budgets["Entertainment"] || 80) * 1.05, // Slight spike warning
          Other: budgets["Other"] || 50,
        },
      };

      setActiveFc(mockResult);
      setIsRefreshing(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 font-sans animate-fadeIn">
      {/* 1. Header Title */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          {isBm ? "Ramalan AI & Amaran Anomali" : "AI Spending Forecast & Alerts"}
        </h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {isBm
            ? "Menganalisis perbelanjaan ganjil dan menjana ramalan 30 hari akan datang menggunakan Google Gemini."
            : "Investigate odd transaction spikes and load AI prediction caps based on 90 days of patterns."}
        </p>
      </div>

      {/* 2. Active Anomaly Alerts List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {isBm ? "⚠️ Amaran Anomali Aktif" : "⚠️ Active Anomaly Alarms"}
        </h3>

        {activeAlerts.length === 0 ? (
          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-center text-xs text-slate-500 italic flex flex-col items-center gap-2 shadow-xl">
            <span className="text-2xl">🎉</span>
            <span>
              {isBm
                ? "Tiada amaran anomali aktif dikesan bulan ini!"
                : "No active anomalies detected this month! Keep it up!"}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => {
              const isHigh = alert.severity === "High";
              const calloutStyle = isHigh
                ? "bg-red-500/10 border-red-500/25 text-red-400"
                : "bg-amber-500/10 border-amber-500/25 text-amber-400";

              return (
                <div key={alert.id} className={`p-5 rounded-2xl border ${calloutStyle} space-y-4`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold block text-sm">
                              {isBm ? `${alert.type === "Spike" ? "Lonjakan" : alert.type} Amaran` : `${alert.type} Warning`} ({isBm ? (alert.severity === "High" ? "Keterukan Tinggi" : "Keterukan Sederhana") : `${alert.severity} Severity`})
                            </span>
                            <p className="text-xs mt-1 leading-relaxed text-slate-300">
                              {isBm ? (
                                <>
                                  Membelanjakan <strong className="text-white">RM {alert.amount.toFixed(2)}</strong> untuk <strong className="text-white">{translateCategory(alert.category)}</strong> pada {alert.date}. Ini melebihi had sejarah standard untuk profil pelajar kolej.
                                </>
                              ) : (
                                <>
                                  Spent <strong className="text-white">RM {alert.amount.toFixed(2)}</strong> on{" "}
                                  <strong className="text-white">{alert.category}</strong> on {alert.date}.
                                  This exceeds standard historical limits for college student profiles.
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                  {/* Buttons corresponding exactly to Bahasa Melayu "Abai" / "Semak" and English "Dismiss" / "Review" */}
                  <div className="flex gap-2.5 pt-2 border-t border-slate-800/20">
                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="px-4 py-2 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <span>{isBm ? "Abai" : "Dismiss"}</span>
                    </button>
                    <button
                      onClick={onReviewAlert}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <span>{isBm ? "Semak" : "Review Transaction"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. AI Forecast prediction panel */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {isBm ? "🤖 Ramalan Perbelanjaan AI" : "🤖 AI Spending Projections"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBm
                ? "Berdasarkan sejarah corak transaksi perbelanjaan 90 hari terkini."
                : "Based on your last 90 days of spending patterns. Click Refresh to query Gemini."}
            </p>
          </div>

          <button
            onClick={handleRefreshForecast}
            disabled={isRefreshing}
            className="px-5 py-3 bg-[#020617]/80 hover:bg-white/5 border border-white/10 text-xs font-extrabold text-white rounded-2xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? (isBm ? "Menjana Ramalan..." : "Querying Gemini...") : (isBm ? "Segarkan Ramalan" : "Refresh Forecast")}</span>
          </button>
        </div>

        {isRefreshing && (
          <div className="py-20 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-xs text-slate-400 animate-pulse">
              {isBm
                ? "Model Gemini sedang menganalisis kadar perbelanjaan berbanding belanjawan diperuntukkan..."
                : "Gemini model analyzing spend rates against allocated budgets..."}
            </p>
          </div>
        )}

        {!isRefreshing && !activeFc && (
          <div className="py-12 text-center text-slate-500 italic text-xs">
            {isBm
              ? "Ketik 'Segarkan Ramalan' untuk membolehkan enjin AI IPECS memproses corak perbelanjaan anda."
              : "Click 'Refresh Forecast' to query Gemini AI model and unlock multi-category outlook charts."}
          </div>
        )}

        {!isRefreshing && activeFc && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#020617]/50 p-5 border border-white/5 rounded-2xl">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  {isBm ? "Anggaran Perbelanjaan AI (30 Hari Seterusnya)" : "AI Projected Spend (Next 30 Days)"}
                </span>
                <span className="text-3xl font-black text-emerald-400 font-mono">
                  RM {activeFc.projected_total.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  {isBm ? "Tahap Keyakinan Model AI" : "Model Confidence Rating"}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg font-mono">
                    <Star className="h-3.5 w-3.5 fill-emerald-400 stroke-none" />
                    {activeFc.confidence}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Suggestion Tip with Malaysian slang */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex gap-3.5 text-xs">
              <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-white block">
                  {isBm ? "✨ Cadangan Pembantu Kewangan Peribadi AI" : "✨ AI Personal Finance Assistant Suggestion"}
                </span>
                <p className="text-slate-300 leading-relaxed mt-1 italic">
                  &quot;{activeFc.tip}&quot;
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {isBm ? "Anggaran Had Kategori Untuk Aktiviti Hari Esok:" : "Projected Category Caps For Tomorrow's Outings:"}
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(activeFc.by_category).map(([category, amount]: any) => {
                  const limit = budgets[category] || 0;
                  const percentOfLimit = limit > 0 ? (amount / limit) * 100 : 0;
                  return (
                    <div
                      key={category}
                      className="p-3 bg-[#020617]/30 border border-white/5 rounded-xl space-y-2 text-center"
                    >
                      <span className="text-[10px] font-bold text-slate-400 truncate block">
                        {translateCategory(category)}
                      </span>
                      <div className="text-sm font-extrabold text-white font-mono">
                        RM {amount.toFixed(0)}
                      </div>
                      <div className="text-[9px] text-slate-500 border-t border-white/5 pt-1">
                        {isBm ? "Had" : "Limit"}: RM {limit.toFixed(0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
