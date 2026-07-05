import React, { useState } from "react";
import { Transaction, Budget } from "../types";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Calendar, DollarSign, Award, ShoppingBag, Download, Landmark } from "lucide-react";

interface ReportsViewProps {
  lang: "EN" | "BM";
  transactions: Transaction[];
  budgets: Budget;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  lang,
  transactions,
  budgets,
}) => {
  const [period, setPeriod] = useState<"june" | "may" | "3months" | "custom">("june");
  const [customStart, setCustomStart] = useState("2025-06-01");
  const [customEnd, setCustomEnd] = useState("2025-06-30");

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

  // Filter transactions based on selected period
  const getFilteredData = () => {
    let start = "2025-06-01";
    let end = "2025-06-30";

    if (period === "may") {
      start = "2025-05-01";
      end = "2025-05-31";
    } else if (period === "3months") {
      start = "2025-04-01";
      end = "2025-06-30";
    } else if (period === "custom") {
      start = customStart;
      end = customEnd;
    }

    return transactions.filter((t) => t.date >= start && t.date <= end);
  };

  const filteredTx = getFilteredData();

  // Metric 1: Total Spent
  const totalSpent = filteredTx.reduce((sum, t) => sum + t.amount, 0);

  // Metric 2: Highest Category
  const categoryTotals: { [cat: string]: number } = {};
  filteredTx.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  let highestCategory = "-";
  let maxSpent = 0;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > maxSpent) {
      maxSpent = val;
      highestCategory = cat;
    }
  });

  // Metric 3: Most Frequent Merchant
  const merchantCounts: { [m: string]: number } = {};
  filteredTx.forEach((t) => {
    merchantCounts[t.merchant] = (merchantCounts[t.merchant] || 0) + 1;
  });
  let mostFreqMerchant = "-";
  let maxFreq = 0;
  Object.entries(merchantCounts).forEach(([m, count]) => {
    if (count > maxFreq) {
      maxFreq = count;
      mostFreqMerchant = m;
    }
  });

  // Metric 4: Avg Daily Spend
  const uniqueDays = new Set(filteredTx.map((t) => t.date)).size;
  const avgDailySpend = uniqueDays > 0 ? totalSpent / uniqueDays : 0;

  // Chart Data 1: Daily spending trend
  const dailySpendMap: { [date: string]: number } = {};
  filteredTx.forEach((t) => {
    dailySpendMap[t.date] = (dailySpendMap[t.date] || 0) + t.amount;
  });
  const lineChartData = Object.entries(dailySpendMap)
    .map(([date, amount]) => ({ date, Amount: parseFloat(amount.toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Chart Data 2: Category Breakdown (Bar/Pie)
  const pieColors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#64748b"];
  const barChartData = Object.entries(categoryTotals).map(([name, value], idx) => ({
    name,
    Value: parseFloat(value.toFixed(2)),
    color: pieColors[idx % pieColors.length],
  }));

  const translatedBarChartData = barChartData.map(item => ({
    ...item,
    name: translateCategory(item.name)
  }));

  // Categories Table detailed breakdown
  const tableData = Object.entries(categoryTotals).map(([name, val]) => {
    const matchingTx = filteredTx.filter((t) => t.category === name);
    return {
      category: name,
      total: val,
      txCount: matchingTx.length,
      avg: matchingTx.length > 0 ? val / matchingTx.length : 0,
    };
  });

  const handleDownloadCsv = () => {
    // Generate simulated CSV string
    let csvContent = "Date,Merchant,Category,Amount,Notes,Source\n";
    filteredTx.forEach((t) => {
      csvContent += `"${t.date}","${t.merchant}","${t.category}",${t.amount},"${t.notes || ""}","${t.source}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ipecs_report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification(isBm ? "Laporan CSV dimuat turun!" : "CSV Spreadsheet exported & downloaded!");
    setTimeout(() => setNotification(""), 3000);
  };

  return (
    <div className="space-y-8 font-sans animate-fadeIn">
      {/* 1. Header Title */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          {isBm ? "Laporan & Analitis Kewangan" : "Spending Reports & Insights"}
        </h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {isBm
            ? "Analisis visual terperinci mengenai aliran tunai peribadi dan eksport rekod perbelanjaan penuh."
            : "Review historical trends, category breakdowns, and export full offline spreadsheets."}
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Advanced Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
          {isBm ? "Pilih Rangka Jangka Masa Laporan" : "Select Report Timeframe"}
        </span>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setPeriod("june")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
              period === "june"
                ? "bg-emerald-500 border-emerald-500 text-slate-950"
                : "bg-[#020617]/50 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {isBm ? "Bulan Ini (Jun)" : "This Month (June)"}
          </button>
          <button
            onClick={() => setPeriod("may")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
              period === "may"
                ? "bg-emerald-500 border-emerald-500 text-slate-950"
                : "bg-[#020617]/50 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {isBm ? "Bulan Lepas (Mei)" : "Last Month (May)"}
          </button>
          <button
            onClick={() => setPeriod("3months")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
              period === "3months"
                ? "bg-emerald-500 border-emerald-500 text-slate-950"
                : "bg-[#020617]/50 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {isBm ? "3 Bulan Terakhir" : "Last 3 Months"}
          </button>
          <button
            onClick={() => setPeriod("custom")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
              period === "custom"
                ? "bg-emerald-500 border-emerald-500 text-slate-950"
                : "bg-[#020617]/50 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {isBm ? "Julat Tersuai" : "Custom Range"}
          </button>
        </div>

        {period === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5 max-w-lg">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                {isBm ? "Tarikh Mula Laporan" : "Report Start Date"}
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-2 bg-[#020617]/50 border border-white/10 rounded-xl text-xs text-white outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                {isBm ? "Tarikh Tamat Laporan" : "Report End Date"}
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-2 bg-[#020617]/50 border border-white/10 rounded-xl text-xs text-white outline-none font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Metric cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isBm ? "Jumlah Belanja" : "Total Spent"}
            </span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">RM {totalSpent.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">In selected period</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isBm ? "Kategori Tertinggi" : "Highest Category"}
            </span>
            <Award className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white truncate">{translateCategory(highestCategory)}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {maxSpent > 0 ? (isBm ? `RM ${maxSpent.toFixed(1)} dibelanjakan` : `RM ${maxSpent.toFixed(1)} spent`) : (isBm ? "Tiada data" : "No data available")}
          </span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isBm ? "Peniaga Kerap" : "Frequent Merchant"}
            </span>
            <ShoppingBag className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white truncate">{mostFreqMerchant}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {maxFreq > 0 ? (isBm ? `${maxFreq} transaksi` : `${maxFreq} transactions`) : (isBm ? "Tiada data" : "No data available")}
          </span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isBm ? "Purata Harian" : "Avg Daily Spend"}
            </span>
            <Landmark className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">RM {avgDailySpend.toFixed(2)}</div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {isBm ? "Berdasarkan hari direkod" : "Based on logged days"}
          </span>
        </div>
      </div>

      {/* 4. Spending Trend Line Chart */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">
          {isBm ? "Aliran Perbelanjaan Harian (RM)" : "Daily Spending Trend (RM)"}
        </h3>

        <div className="h-64">
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  formatter={(value) => [`RM ${value}`, "Spent"]}
                />
                <Line
                  type="monotone"
                  dataKey="Amount"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 0, fill: "#10b981" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
              No daily logs captured in this period.
            </div>
          )}
        </div>
      </div>

      {/* 5. Charts Side-by-Side: Bar & Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">
            {isBm ? "Pecahan Mutlak Kategori" : "Category Totals comparison"}
          </h3>
          <div className="h-64">
            {translatedBarChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={translatedBarChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value) => [`RM ${value}`, isBm ? "Belanja" : "Spent"]}
                  />
                  <Bar dataKey="Value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                No logs available.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            {isBm ? "Komposisi Peratusan Perbelanjaan" : "Spent Percentage Composition"}
          </h3>
          <div className="h-52 relative flex items-center justify-center">
            {translatedBarChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={translatedBarChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="Value"
                  >
                    {translatedBarChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value) => [`RM ${value}`, isBm ? "Belanja" : "Spent"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 italic">{isBm ? "Tiada log tersedia." : "No logs available."}</div>
            )}
            <div className="absolute text-center flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">TOTAL</span>
              <span className="text-base font-black text-white">RM {totalSpent.toFixed(0)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-slate-400 pt-4">
            {translatedBarChartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 truncate bg-[#020617]/50 p-1.5 rounded-lg border border-white/5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Detailed Analytics breakdown table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          {isBm ? "Perincian Metrik Pengkategorian" : "Category Breakdown Details"}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">{isBm ? "Bilangan Transaksi" : "Transaction Count"}</th>
                <th className="py-3 px-4 text-right">{isBm ? "Purata Per Item" : "Avg Per Item"}</th>
                <th className="py-3 px-4 text-right">{isBm ? "Jumlah Belanja" : "Total Spend"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-350">
              {tableData.map((row) => (
                <tr key={row.category} className="hover:bg-slate-800/10 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{translateCategory(row.category)}</td>
                  <td className="py-3.5 px-4 text-center font-mono">{row.txCount}</td>
                  <td className="py-3.5 px-4 text-right font-mono">RM {row.avg.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-white">
                    RM {row.total.toFixed(2)}
                  </td>
                </tr>
              ))}

              {tableData.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 italic">
                    {isBm ? "Tiada log tersedia untuk tempoh terpilih." : "No logs available for selected period."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
          <button
            onClick={handleDownloadCsv}
            disabled={filteredTx.length === 0}
            className="px-5 py-3 bg-[#020617]/80 hover:bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Download className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>{isBm ? "Muat Turun Laporan (CSV)" : "Download Spreadsheet Report (CSV)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
