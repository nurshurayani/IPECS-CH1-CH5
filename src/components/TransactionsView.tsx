import React, { useState } from "react";
import { Transaction, Budget } from "../types";
import { SlidersHorizontal, Calendar, FolderHeart, DollarSign, Save, PlusCircle, Check, Trash2, Edit2 } from "lucide-react";

interface TransactionsViewProps {
  lang: "EN" | "BM";
  transactions: Transaction[];
  budgets: Budget;
  onUpdateTransactions: (updatedList: Transaction[]) => void;
  onAddCategory: (name: string, limit: number) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  lang,
  transactions,
  budgets,
  onUpdateTransactions,
  onAddCategory,
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

  // Filter States
  const [startDate, setStartDate] = useState("2025-06-01");
  const [endDate, setEndDate] = useState("2025-06-30");
  const [selectedCat, setSelectedCat] = useState("All");
  const [maxAmount, setMaxAmount] = useState<number>(200);

  // Editing States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMerchant, setEditMerchant] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Manage Categories Expanders
  const [newCatName, setNewCatName] = useState("");
  const [newCatLimit, setNewCatLimit] = useState("");
  const [isCatExpanded, setIsCatExpanded] = useState(false);

  const [notification, setNotification] = useState("");

  // Calculate stats for Categories
  const juneTransactions = transactions.filter((t) => t.date.startsWith("2025-06"));
  const catStats = Object.keys(budgets).map((cat) => {
    const matchingTx = juneTransactions.filter((t) => t.category === cat);
    const spent = matchingTx.reduce((sum, t) => sum + t.amount, 0);
    return {
      category: cat,
      spent,
      count: matchingTx.length,
      limit: budgets[cat],
    };
  });

  // Filter Transactions logic
  const filteredTransactions = transactions.filter((tx) => {
    const txDate = tx.date;
    const matchesDate = txDate >= startDate && txDate <= endDate;
    const matchesCat = selectedCat === "All" || tx.category === selectedCat;
    const matchesAmount = tx.amount <= maxAmount;
    return matchesDate && matchesCat && matchesAmount;
  });

  const handleStartEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditMerchant(tx.merchant);
    setEditAmount(tx.amount.toString());
    setEditDate(tx.date);
    setEditCategory(tx.category);
    setEditNotes(tx.notes);
  };

  const handleSaveRow = (id: string) => {
    const updated = transactions.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          merchant: editMerchant,
          amount: parseFloat(editAmount) || 0,
          date: editDate,
          category: editCategory,
          notes: editNotes,
        };
      }
      return t;
    });
    onUpdateTransactions(updated);
    setEditingId(null);
    setNotification(isBm ? "Perubahan spreadsheet disimpan!" : "Spreadsheet row updated!");
    setTimeout(() => setNotification(""), 3000);
  };

  const handleDeleteRow = (id: string) => {
    if (window.confirm(isBm ? "Padam rekursif entri ini?" : "Delete this expense entry?")) {
      const updated = transactions.filter((t) => t.id !== id);
      onUpdateTransactions(updated);
      setNotification(isBm ? "Transaksi berjaya dipadam." : "Transaction deleted successfully.");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleAddNewCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    const limitNum = parseFloat(newCatLimit);

    if (!cleanName || isNaN(limitNum)) return;

    if (budgets[cleanName] !== undefined) {
      alert(isBm ? "Kategori sudah wujud!" : "Category already exists!");
      return;
    }

    onAddCategory(cleanName, limitNum);
    setNewCatName("");
    setNewCatLimit("");
    setNotification(isBm ? `Kategori '${cleanName}' ditambah!` : `Category '${cleanName}' created successfully!`);
    setTimeout(() => setNotification(""), 3000);
  };

  return (
    <div className="space-y-8 font-sans animate-fadeIn">
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          {isBm ? "Pengurusan Transaksi & Kategori" : "Transaction & Category Management"}
        </h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {isBm
            ? "Papan hamparan (spreadsheet) interaktif dengan sokongan suntingan dalam talian (inline) dan penapis lanjutan."
            : "Double-click rows to edit inline. Multi-factor search filters let you isolate specific expense clusters."}
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Advanced Filters Expandable Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-wider mb-6">
          <SlidersHorizontal className="h-4.5 w-4.5 text-emerald-400" />
          <span>{isBm ? "Bahagian Atas — Penapis Ledger" : "Top Section — Ledger Filters"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{isBm ? "Tarikh Mula" : "Start Date"}</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#020617]/50 border border-white/10 focus:border-emerald-500 rounded-xl text-xs text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{isBm ? "Tarikh Tamat" : "End Date"}</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#020617]/50 border border-white/10 focus:border-emerald-500 rounded-xl text-xs text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FolderHeart className="h-3 w-3" />
              <span>Kategori</span>
            </label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-3 py-2 bg-[#020617]/50 border border-white/10 focus:border-emerald-500 rounded-xl text-xs text-white outline-none font-semibold"
            >
              <option value="All">{isBm ? "Semua Kategori" : "All Categories"}</option>
              {Object.keys(budgets).map((c) => (
                <option key={c} value={c}>
                  {translateCategory(c)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>{isBm ? "Amaun Maksimum (RM)" : "Max Amount (RM)"}</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={maxAmount}
                onChange={(e) => setMaxAmount(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                RM {maxAmount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Spreadsheet Data Editor Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          {isBm ? "Klik Baris atau Butang Untuk Sunting Dalam Talian" : "Click Edit to Update Row in Inline Spreadsheet Grid"}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">{isBm ? "Tarikh" : "Date"}</th>
                <th className="py-3 px-4">{isBm ? "Peniaga" : "Merchant"}</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">{isBm ? "Nota" : "Notes"}</th>
                <th className="py-3 px-4 text-right">{isBm ? "Amaun" : "Amount"}</th>
                <th className="py-3 px-4 text-center">{isBm ? "Tindakan" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 text-slate-300">
              {filteredTransactions.map((tx) => {
                const isEditing = editingId === tx.id;
                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-800/10 transition-colors ${
                      isEditing ? "bg-slate-800/30" : ""
                    }`}
                  >
                    {isEditing ? (
                      /* Editing Row */
                      <>
                        <td className="py-2.5 px-3">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="px-2 py-1 bg-[#020617]/50 border border-white/10 text-xs rounded-lg text-white font-mono outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={editMerchant}
                            onChange={(e) => setEditMerchant(e.target.value)}
                            className="w-full px-2 py-1 bg-[#020617]/50 border border-white/10 text-xs rounded-lg text-white font-semibold outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="px-2 py-1 bg-[#020617]/50 border border-white/10 text-xs rounded-lg text-white font-semibold outline-none"
                          >
                            {Object.keys(budgets).map((c) => (
                              <option key={c} value={c}>
                                {translateCategory(c)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="w-full px-2 py-1 bg-[#020617]/50 border border-white/10 text-xs rounded-lg text-white outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-20 px-2 py-1 bg-[#020617]/50 border border-white/10 text-xs rounded-lg text-white text-right font-bold outline-none font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleSaveRow(tx.id)}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20"
                            >
                              <Save className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 bg-[#020617]/60 hover:bg-white/5 border border-white/10 text-[10px] rounded-lg text-slate-400 cursor-pointer"
                            >
                              {isBm ? "Batal" : "Cancel"}
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      /* Display Row */
                      <>
                        <td className="py-3.5 px-4 font-mono text-xs">{tx.date}</td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {tx.merchant}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs bg-slate-850 border border-slate-800 px-2.5 py-0.5 rounded-full font-semibold">
                            {translateCategory(tx.category)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs italic text-slate-400 max-w-xs truncate">
                          {tx.notes || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-white">
                          RM {tx.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStartEdit(tx)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(tx.id)}
                              className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 italic">
                    {isBm ? "Tiada transaksi sepadan dengan penapis." : "No transactions match the selected filter criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Manage Categories accordion */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <button
          onClick={() => setIsCatExpanded(!isCatExpanded)}
          className="w-full p-5 flex items-center justify-between text-left text-white bg-white/5 font-bold hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span>{isBm ? "⚙️ Urus Kategori" : "⚙️ Manage Categories & Limits"}</span>
          <span className="text-[10px] text-slate-400 font-bold font-mono">
            {isCatExpanded ? "[-] CLOSE PANEL" : "[+] EXPAND PANEL"}
          </span>
        </button>

        {isCatExpanded && (
          <div className="p-6 border-t border-white/5 space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isBm ? "Gambaran Keseluruhan Kategori Pintar" : "Interactive Categories Overview"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Category stats grid */}
              <div className="space-y-3">
                {catStats.map((stat) => (
                  <div
                    key={stat.category}
                    className="p-4 bg-[#020617]/40 border border-white/5 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-white">{translateCategory(stat.category)}</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        {isBm ? `${stat.count} entri direkodkan` : `${stat.count} items recorded`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block font-mono font-bold text-emerald-400">
                        {isBm ? `Belanja: RM ${stat.spent.toFixed(2)}` : `Spent: RM ${stat.spent.toFixed(2)}`}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isBm ? `Had: RM ${stat.limit.toFixed(0)}` : `Limit: RM ${stat.limit.toFixed(0)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddNewCategorySubmit} className="p-5 bg-[#020617]/30 border border-white/10 rounded-xl space-y-4">
                <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">
                  {isBm ? "Tambah Kategori Baru" : "Add Custom Category"}
                </h5>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                    {isBm ? "Nama Kategori Baru" : "New Category Name"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Subscriptions"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#020617]/50 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                    {isBm ? "Had Perbelanjaan Lalai (RM)" : "Default Spend Limit (RM)"}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={newCatLimit}
                    onChange={(e) => setNewCatLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#020617]/50 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{isBm ? "Tambah Kategori" : "Create Custom Category"}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
