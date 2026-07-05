import React from "react";
import { Transaction, Budget, Alert } from "../types";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, AlertTriangle, CreditCard, Coins, ArrowUpRight, Sparkles } from "lucide-react";

interface DashboardViewProps {
  lang: "EN" | "BM";
  transactions: Transaction[];
  budgets: Budget;
  alerts: Alert[];
  onNavigate: (page: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lang,
  transactions,
  budgets,
  alerts,
  onNavigate,
}) => {
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

  // Calculate current month's transactions (June 2025 based on the datasets)
  const juneTransactions = transactions.filter((t) => t.date.startsWith("2025-06"));
  const totalSpent = juneTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Total budget limit
  const totalBudget = (Object.values(budgets) as number[]).reduce((sum, b) => sum + b, 0);

  // Remaining budget
  const remainingBudget = totalBudget - totalSpent;
  const percentUsed = (totalSpent / totalBudget) * 100;

  // Active anomaly alerts count
  const activeAlertsCount = alerts.filter((a) => !a.dismissed).length;

  // Recent transactions (last 4)
  const recentTx = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  // Weekly transactions count (mocking 'this week')
  const weeklyTxCount = juneTransactions.length;

  // Chart 1: Spending by Category data preparation
  const categorySpending: { [cat: string]: number } = {};
  // Seed with all current categories to ensure they render nicely even if 0
  Object.keys(budgets).forEach((cat) => {
    categorySpending[cat] = 0;
  });
  juneTransactions.forEach((t) => {
    if (categorySpending[t.category] !== undefined) {
      categorySpending[t.category] += t.amount;
    } else {
      categorySpending[t.category] = t.amount;
    }
  });

  const pieData = Object.entries(categorySpending)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name: translateCategory(name), value: parseFloat(value.toFixed(2)) }));

  // Colors aligned with the design system
  const COLORS = {
    "Food & Dining": "#10b981", // Emerald
    "Makanan & Minuman": "#10b981",
    Transport: "#3b82f6", // Blue
    Pengangkutan: "#3b82f6",
    Shopping: "#8b5cf6", // Purple
    "Membeli-belah": "#8b5cf6",
    Bills: "#f59e0b", // Amber
    "Bil & Utiliti": "#f59e0b",
    Entertainment: "#ec4899", // Pink
    Hiburan: "#ec4899",
    Other: "#64748b", // Slate
    "Lain-lain": "#64748b",
  };

  const getCatColor = (name: string) => {
    return COLORS[name as keyof typeof COLORS] || "#64748b";
  };

  // Chart 2: Category budget vs actual spending data
  const spentKey = isBm ? "Dibelanjakan" : "Spent";
  const limitKey = isBm ? "Had" : "Limit";
  const barData = Object.entries(budgets).map(([category, limit]) => {
    const actual = categorySpending[category] || 0;
    return {
      category: translateCategory(category),
      [limitKey]: limit,
      [spentKey]: parseFloat(actual.toFixed(2)),
    };
  });

  return (
    <div className="space-y-8 font-sans animate-fadeIn">
      {/* 1. Welcoming Hero Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-emerald-500/5">
        {/* Abstract vector backgrounds */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-teal-500/5 rounded-full filter blur-2xl"></div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isBm ? "Pratonton FYP Dipertingkatkan" : "Enhanced FYP UI Preview"}</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isBm ? "Salam Sejahtera, Amirul!" : "Welcome back, Amirul!"}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            {isBm
              ? "IPECS menjejak & mengkategorikan bil perbelanjaan universiti anda secara automatik menggunakan model AI Gemini Vision."
              : "IPECS manages, visualizes, and predicts your university budgets in real-time using custom Gemini Vision OCR integrations."}
          </p>
        </div>

        <div className="flex gap-3 relative z-10 self-start md:self-center">
          <button
            onClick={() => onNavigate("Receipt & Transaction Entry")}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 tracking-wide flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{isBm ? "Imbas Resit" : "Scan Receipt"}</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Total Spent */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {isBm ? "Jumlah Belanja" : "Total Spent (June)"}
            </span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-light text-white tracking-tight font-display">
              RM {totalSpent.toFixed(2)}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>{isBm ? "Daripada bajet" : "Of limit"}</span>
              <span className="font-semibold text-slate-400">RM {totalBudget.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentUsed > 100
                  ? "bg-red-500"
                  : percentUsed > 80
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* KPI 2: Remaining Budget */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {isBm ? "Baki Bajet" : "Remaining Budget"}
            </span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-light text-white tracking-tight font-display">
              RM {remainingBudget.toFixed(2)}
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">{isBm ? "Status Kawalan:" : "Status Check:"}</span>
              <span
                className={`font-semibold ${
                  percentUsed > 100
                    ? "text-red-400"
                    : percentUsed > 80
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {percentUsed > 100
                  ? isBm
                    ? "Lebih Had"
                    : "Over Budget"
                  : percentUsed > 80
                  ? isBm
                    ? "Berisiko"
                    : "At Risk"
                  : isBm
                  ? "Sempurna"
                  : "On Track"}
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>{percentUsed.toFixed(0)}% {isBm ? "DIGUNAKAN" : "USED"}</span>
            <span>{(100 - percentUsed).toFixed(0)}% {isBm ? "BAKI" : "FREE"}</span>
          </div>
        </div>

        {/* KPI 3: Active Alerts */}
        <div
          onClick={() => onNavigate("AI Forecast & Alerts")}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-white/20 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {isBm ? "Amaran Anomali" : "Active AI Alerts"}
            </span>
            <div
              className={`p-2.5 rounded-xl transition-all ${
                activeAlertsCount > 0 ? "bg-red-500/10 text-red-400 animate-pulse" : "bg-slate-800/50 text-slate-400"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-light text-white tracking-tight font-display">
              {activeAlertsCount}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              {activeAlertsCount > 0 ? (
                <span className="text-red-400/90 font-medium">
                  {isBm ? "Tindakan segera diperlukan" : "Requires attention!"}
                </span>
              ) : (
                <span>{isBm ? "Tiada anomali dikesan" : "System secure & normal"}</span>
              )}
            </div>
          </div>
          <div className="mt-4 text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
            <span>{isBm ? "Lihat Amaran" : "View Warnings"}</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>

        {/* KPI 4: Weekly Transactions */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {isBm ? "Bilangan Log" : "Total Logged (June)"}
            </span>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-light text-white tracking-tight font-display">
              {weeklyTxCount}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>{isBm ? "Entri terkumpul bulan ini" : "Total items captured"}</span>
            </div>
          </div>
          <div className="mt-4 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <span>OCR: {juneTransactions.filter((t) => t.source === "ocr").length} {isBm ? "entri" : "entries"}</span>
            <span className="text-slate-600">•</span>
            <span>Manual: {juneTransactions.filter((t) => t.source === "manual").length}</span>
          </div>
        </div>
      </div>

      {/* 3. Visual Interactive Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (Donut Pie Chart) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:col-span-5 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide mb-1">
              {isBm ? "Pecahan Perbelanjaan" : "Category Allocation Percentage"}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {isBm ? "Komposisi perbelanjaan semasa mengikut kategori." : "Distribution of current month actual spending."}
            </p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCatColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value) => [`RM ${value}`, isBm ? "Dibelanjakan" : "Spent"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 italic">{isBm ? "Tiada transaksi direkodkan bulan ini." : "No transactions captured this month."}</div>
            )}
            <div className="absolute text-center flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{isBm ? "JUMLAH BELANJA" : "TOTAL SPENT"}</span>
              <span className="text-xl font-bold text-white font-display">RM {totalSpent.toFixed(0)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] font-medium text-slate-400">
            {Object.keys(budgets).map((category) => {
              const spent = categorySpending[category] || 0;
              if (spent === 0) return null;
              return (
                <div key={category} className="flex items-center gap-1.5 bg-white/5 border border-white/5 p-1.5 rounded-lg">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: getCatColor(category) }}
                  ></span>
                  <span className="truncate">{translateCategory(category)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget vs Actual Category Progress Bar Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:col-span-7 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide mb-1">
              {isBm ? "Perbandingan Perbelanjaan vs Had Bajet" : "Spending vs Limit Comparison"}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {isBm
                ? "Bandingkan jumlah sebenar yang dibelanjakan (RM) dengan sasaran had anda."
                : "Analyze where you are spending close to or over your limits per category."}
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="category"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  formatter={(value) => [`RM ${value}`, ""]}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, pt: 10 }} />
                <Bar dataKey={spentKey} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey={limitKey} fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Recent Transactions Overview */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {isBm ? "Log Transaksi Terkini" : "Recent Transactions History"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBm ? "Senarai empat entri perbelanjaan terbaharu." : "Overview of the last four logged expenditures."}
            </p>
          </div>
          <button
            onClick={() => onNavigate("Transaction & Category Management")}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors group"
          >
            <span>{isBm ? "Urus Semua" : "View & Edit Spreadsheet"}</span>
            <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">{isBm ? "Tarikh" : "Date"}</th>
                <th className="py-3 px-4">{isBm ? "Peniaga / Kedai" : "Merchant"}</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">{isBm ? "Sumber" : "Source"}</th>
                <th className="py-3 px-4 text-right">{isBm ? "Amaun" : "Amount"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {recentTx.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-800/20 transition-all duration-150 group"
                >
                  <td className="py-3.5 px-4 font-mono text-xs">{tx.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {tx.merchant}
                    {tx.notes && (
                      <span className="block text-[10px] text-slate-500 font-normal mt-0.5 truncate max-w-xs">
                        {tx.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                      style={{
                        borderColor: `${getCatColor(tx.category)}33`,
                        backgroundColor: `${getCatColor(tx.category)}11`,
                        color: getCatColor(tx.category),
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: getCatColor(tx.category) }}
                      ></span>
                      {translateCategory(tx.category)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold">
                    {tx.source === "ocr" ? (
                      <span className="text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md text-[10px]">
                        GEMINI AI OCR
                      </span>
                    ) : (
                      <span className="text-slate-400 bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded-md text-[10px]">
                        MANUAL
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right text-white font-extrabold font-mono">
                    RM {tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
