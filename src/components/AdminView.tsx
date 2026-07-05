import React, { useState } from "react";
import { AdminUser, AdminCategory, AdminTransaction, Transaction } from "../types";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Shield, Users, Server, Tags, Eye, ShieldAlert, CheckCircle, RefreshCw, PlusCircle, AlertCircle, Download, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

interface AdminViewProps {
  lang: "EN" | "BM";
  adminUsers: AdminUser[];
  adminCategories: AdminCategory[];
  adminTransactions: AdminTransaction[];
  onToggleUserActive: (userId: string) => void;
  onAddSystemCategory: (name: string, hexColor: string) => void;
  onDeleteSystemCategory: (name: string) => void;
  onToggleCategoryActive: (name: string) => void;
  onToggleTransactionFlag: (id: string) => void;
  onLogoutAdmin: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  lang,
  adminUsers,
  adminCategories,
  adminTransactions,
  onToggleUserActive,
  onAddSystemCategory,
  onDeleteSystemCategory,
  onToggleCategoryActive,
  onToggleTransactionFlag,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<"users" | "telemetry" | "taxonomy" | "audit">("users");

  // Filter States for Auditing
  const [auditUser, setAuditUser] = useState("All");
  const [auditCat, setAuditCat] = useState("All");
  const [auditFlagged, setAuditFlagged] = useState("All");

  // Create Category forms
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#8b5cf6");

  // Suspicious Control selection
  const [flagSelectionId, setFlagSelectionId] = useState("");

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

  // System Nodes status
  const databaseStatus = "Operational";
  const ocrServiceStatus = "Operational";
  const geminiAiStatus = "Operational"; // Simulated check

  // Chart 1: System Transactions per Category totals
  const barData = adminCategories.map((c) => {
    // Sum from transactions
    const count = adminTransactions.filter((t) => t.category === c.categoryName).length;
    return {
      Category: translateCategory(c.categoryName),
      Volume: count + (c.categoryName === "Food & Dining" ? 24 : c.categoryName === "Transport" ? 12 : 8),
    };
  });

  // Chart 2: Daily Activity rates
  const lineData = [
    { Date: "25-06-01", Volume: 14 },
    { Date: "25-06-02", Volume: 16 },
    { Date: "25-06-03", Volume: 9 },
    { Date: "25-06-04", Volume: 13 },
    { Date: "25-06-05", Volume: 18 },
    { Date: "25-06-06", Volume: 12 },
    { Date: "25-06-07", Volume: 15 },
    { Date: "25-06-08", Volume: 22 },
  ];

  // Filtering audit list
  const filteredAudit = adminTransactions.filter((t) => {
    const matchUser = auditUser === "All" || t.user === auditUser;
    const matchCat = auditCat === "All" || t.category === auditCat;
    const matchFlag =
      auditFlagged === "All" ||
      (auditFlagged === "Flagged" && t.flagged) ||
      (auditFlagged === "Normal" && !t.flagged);
    return matchUser && matchCat && matchFlag;
  });

  const handleAddNewCat = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) return;

    if (adminCategories.some((c) => c.categoryName.toLowerCase() === cleanName.toLowerCase())) {
      alert("Category name already registered!");
      return;
    }

    onAddSystemCategory(cleanName, newCatColor);
    setNewCatName("");
    setNotification(`System Category '${cleanName}' registered successfully!`);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleToggleFlagSubmit = (id: string) => {
    if (!id) return;
    onToggleTransactionFlag(id);
    setNotification("Ledger audit status synchronized successfully!");
    setTimeout(() => setNotification(""), 3000);
  };

  return (
    <div className="space-y-8 font-sans animate-fadeIn text-slate-100">
      {/* Header Panel */}
      <div className="border-l-4 border-red-500 pl-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500 animate-pulse" />
            <span>{isBm ? "Portal Pentadbiran Sistem" : "IPECS Admin Control Center"}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBm
              ? "Panel berprestasi tinggi untuk pemantauan penyelarasan perbelanjaan berbilang pengguna dan kesihatan nod."
              : "Perform real-time multi-user auditing, system node checks, and customise expense taxonomies."}
          </p>
        </div>

        <button
          onClick={onLogoutAdmin}
          className="px-4 py-2 bg-[#020617]/80 hover:bg-red-500/80 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded-xl text-xs font-bold transition-all self-start sm:self-center cursor-pointer"
        >
          {isBm ? "Tutup Sesi Admin" : "Log out Admin"}
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Tabs Navigation */}
      <div className="flex border-b border-white/5 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-4 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "users"
              ? "text-red-500 border-b-2 border-red-500 font-extrabold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{isBm ? "Pengurusan Pengguna" : "User Management"}</span>
        </button>

        <button
          onClick={() => setActiveTab("telemetry")}
          className={`pb-3 px-4 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "telemetry"
              ? "text-red-500 border-b-2 border-red-500 font-extrabold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Server className="h-4 w-4" />
          <span>{isBm ? "Kesihatan Nod & Metrik" : "System Telemetry"}</span>
        </button>

        <button
          onClick={() => setActiveTab("taxonomy")}
          className={`pb-3 px-4 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "taxonomy"
              ? "text-red-500 border-b-2 border-red-500 font-extrabold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Tags className="h-4 w-4" />
          <span>{isBm ? "Taksonomi Sistem" : "Taxonomy"}</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 px-4 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "audit"
              ? "text-red-500 border-b-2 border-red-500 font-extrabold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>{isBm ? "Audit Transaksi" : "Transaction Oversight"}</span>
        </button>
      </div>

      {/* Admin views */}
      {activeTab === "users" && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isBm ? "Senarai Akaun Berdaftar" : "Registered Student Accounts"}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md">
              {isBm ? `Jumlah Pengguna: ${adminUsers.length}` : `Total Users: ${adminUsers.length}`}
            </span>
          </div>

          <p className="text-xs text-slate-500 italic mb-4 font-mono">
            {isBm ? "Toggel elemen status di bawah untuk menangguhkan atau mengaktifkan keistimewaan log masuk pengguna dengan segera." : "Toggle status elements below to immediately suspend or activate user login privileges."}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">University</th>
                  <th className="py-3 px-4 text-center">Entries</th>
                  <th className="py-3 px-4 text-center">Plan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {adminUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{user.userId}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{user.name}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{user.institution}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs font-bold">{user.totalTransactions}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        user.plan === "Pro" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-[#020617]/40 text-slate-400 border border-white/5"
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onToggleUserActive(user.userId)}
                        className="inline-flex focus:outline-none"
                      >
                        {user.active ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg cursor-pointer">
                            {isBm ? "AKTIF" : "ACTIVE"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg cursor-pointer">
                            {isBm ? "DITANGGUHKAN" : "SUSPENDED"}
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "telemetry" && (
        <div className="space-y-8">
          {/* Nodes status row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">{isBm ? "Kluster Pangkalan Data" : "Database Cluster"}</span>
                <span className="text-sm font-extrabold text-white">{isBm ? "Nod Postgres Beroperasi" : "Postgres Node Operational"}</span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping shadow-lg shadow-emerald-500/50"></span>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">{isBm ? "Enjin Penghurai OCR" : "OCR Parser Engine"}</span>
                <span className="text-sm font-extrabold text-white">{isBm ? "Pelayan Visi Dalam Talian" : "Vision Server Online"}</span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Google Gemini API</span>
                <span className="text-sm font-extrabold text-white">{isBm ? "Model Flash Aktif" : "Models Flash Active"}</span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System charts */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">
                {isBm ? "Taburan Transaksi Sistem" : "System Transaction Distribution"}
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="Category" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="Volume" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">
                {isBm ? "Aktiviti Beban Sistem Harian" : "Daily System Load Activity"}
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="Date" stroke="#64748b" fontSize={9} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Volume"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      dot={{ fill: "#f43f5e", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "taxonomy" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Categories Grid Table */}
          <div className="lg:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">
              {isBm ? "Grid Taksonomi Perbelanjaan Sistem" : "System Expense Taxonomy Grid"}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">{isBm ? "Nama Kategori" : "Category Name"}</th>
                    <th className="py-3 px-4">{isBm ? "Warna Estetik" : "Aesthetic Colour"}</th>
                    <th className="py-3 px-4 text-center">{isBm ? "Jenis" : "Type"}</th>
                    <th className="py-3 px-4 text-center">{isBm ? "Keterlihatan" : "Visibility"}</th>
                    <th className="py-3 px-4 text-center">{isBm ? "Padam" : "Delete"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-330">
                  {adminCategories.map((c) => (
                    <tr key={c.categoryName} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.colour }}></span>
                        <span>{translateCategory(c.categoryName)}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400 uppercase">{c.colour}</td>
                      <td className="py-3.5 px-4 text-center">
                        {c.default ? (
                          <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold rounded-md font-mono">
                            {isBm ? "SISTEM DIKUNCI" : "LOCKED SYSTEM"}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#020617]/40 border border-white/5 text-slate-400 text-[9px] font-bold rounded-md font-mono">
                            {isBm ? "TERDAFTAR TERSUAI" : "CUSTOM REGISTERED"}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onToggleCategoryActive(c.categoryName)}
                          className="text-xs font-bold cursor-pointer"
                        >
                          {c.active ? (
                            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono text-[9px]">{isBm ? "AKTIF" : "ACTIVE"}</span>
                          ) : (
                            <span className="text-slate-500 bg-[#020617]/50 border border-white/5 px-2.5 py-0.5 rounded-full font-mono text-[9px]">{isBm ? "DISEBUNYIKAN" : "HIDDEN"}</span>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {!c.default ? (
                          <button
                            onClick={() => onDeleteSystemCategory(c.categoryName)}
                            className="p-1 hover:bg-red-500/15 text-slate-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-slate-600 font-mono text-[10px]">{isBm ? "🔒 Dikunci" : "🔒 Locked"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Category Form */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <form onSubmit={handleAddNewCat} className="space-y-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-3 mb-4">
                {isBm ? "Daftar Taksonomi Sistem Baru" : "Register New System Taxonomy"}
              </h3>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">
                  {isBm ? "Nama Kategori Taksonomi" : "Taxonomy Category Name"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBm ? "cth. Langganan" : "e.g. Subscriptions"}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#020617]/60 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">
                  {isBm ? "Pilih Warna Tema Estetik" : "Pick Aesthetic Theme Colour"}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-12 h-10 bg-[#020617]/60 border border-white/10 rounded-lg appearance-none cursor-pointer outline-none"
                  />
                  <input
                    type="text"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-full px-3 py-2 bg-[#020617]/60 border border-white/10 rounded-lg text-xs font-mono text-white outline-none uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-red-500/10 cursor-pointer font-bold"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{isBm ? "Daftar Taksonomi Sistem" : "Register System Taxonomy"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Audit filters */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
              {isBm ? "Panel Penapis Audit" : "Audit Filters Panel"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                  {isBm ? "Tapis Pelajar" : "Filter Student"}
                </label>
                <select
                  value={auditUser}
                  onChange={(e) => setAuditUser(e.target.value)}
                  className="w-full px-3 py-2 bg-[#020617]/60 border border-white/10 rounded-xl text-xs text-white outline-none font-semibold"
                >
                  <option value="All" className="bg-[#020617]">{isBm ? "Semua Pelajar" : "All Students"}</option>
                  <option value="Siti Aminah" className="bg-[#020617]">Siti Aminah</option>
                  <option value="Teoh Wei Jie" className="bg-[#020617]">Teoh Wei Jie</option>
                  <option value="Arun Kumar" className="bg-[#020617]">Arun Kumar</option>
                  <option value="Amirul Syafiq" className="bg-[#020617]">Amirul Syafiq</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                  {isBm ? "Tapis Kategori" : "Filter Category"}
                </label>
                <select
                  value={auditCat}
                  onChange={(e) => setAuditCat(e.target.value)}
                  className="w-full px-3 py-2 bg-[#020617]/60 border border-white/10 rounded-xl text-xs text-white outline-none font-semibold"
                >
                  <option value="All" className="bg-[#020617]">{isBm ? "Semua Kategori" : "All Categories"}</option>
                  {adminCategories.map((c) => (
                    <option key={c.categoryName} value={c.categoryName} className="bg-[#020617]">
                      {translateCategory(c.categoryName)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                  {isBm ? "Status Bendera Audit" : "Audit Flags status"}
                </label>
                <select
                  value={auditFlagged}
                  onChange={(e) => setAuditFlagged(e.target.value)}
                  className="w-full px-3 py-2 bg-[#020617]/60 border border-white/10 rounded-xl text-xs text-white outline-none font-semibold"
                >
                  <option value="All" className="bg-[#020617]">{isBm ? "Semua Transaksi" : "All Transactions"}</option>
                  <option value="Flagged" className="bg-[#020617]">{isBm ? "⚠️ Bendera Mencurigakan sahaja" : "⚠️ Suspicious Flags only"}</option>
                  <option value="Normal" className="bg-[#020617]">{isBm ? "Normal/Diluluskan" : "Normal/Approved"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit table list */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">{isBm ? "Nama Pelajar" : "Student Name"}</th>
                    <th className="py-3 px-4">{isBm ? "Peniaga" : "Merchant"}</th>
                    <th className="py-3 px-4">{isBm ? "Kategori" : "Category"}</th>
                    <th className="py-3 px-4 text-center">{isBm ? "Sumber" : "Source"}</th>
                    <th className="py-3 px-4 text-right">{isBm ? "Amaun" : "Amount"}</th>
                    <th className="py-3 px-4 text-center">{isBm ? "Status" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-350">
                  {filteredAudit.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{row.id}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{row.user}</td>
                      <td className="py-3.5 px-4 font-semibold">{row.merchant}</td>
                      <td className="py-3.5 px-4 text-xs font-semibold">{translateCategory(row.category)}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs uppercase text-slate-400">
                        {row.source}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-white">
                        RM {row.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleFlagSubmit(row.id)}
                          className="inline-flex focus:outline-none"
                        >
                          {row.flagged ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg cursor-pointer font-mono">
                              {isBm ? "⚠️ BENDERA MENCURIGAKAN" : "⚠️ SUSPICIOUS FLAG"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg cursor-pointer font-mono">
                              {isBm ? "NORMAL/DILULUSKAN" : "NORMAL/APPROVED"}
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredAudit.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 italic font-mono text-xs">
                        {isBm ? "Tiada transaksi dikesan di bawah skop pengauditan terpilih." : "No transactions captured under selected auditing scopes."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
