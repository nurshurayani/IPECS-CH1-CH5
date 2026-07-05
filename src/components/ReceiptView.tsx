import React, { useState, useRef } from "react";
import { Transaction, Budget } from "../types";
import { Upload, Camera, FileText, CheckCircle2, RefreshCw, PlusCircle, AlertCircle } from "lucide-react";

interface ReceiptViewProps {
  lang: "EN" | "BM";
  budgets: Budget;
  onAddTransaction: (tx: Omit<Transaction, "id">) => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  lang,
  budgets,
  onAddTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<"ocr" | "manual">("ocr");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [confidence, setConfidence] = useState<number | null>(null);

  // Form Fields (shared or individual)
  const [ocrMerchant, setOcrMerchant] = useState("");
  const [ocrAmount, setOcrAmount] = useState("");
  const [ocrDate, setOcrDate] = useState("");
  const [ocrCategory, setOcrCategory] = useState("Food & Dining");
  const [ocrNotes, setOcrNotes] = useState("");

  const [manualMerchant, setManualMerchant] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualDate, setManualDate] = useState(new Date().toISOString().split("T")[0]);
  const [manualCategory, setManualCategory] = useState("Food & Dining");
  const [manualNotes, setManualNotes] = useState("");

  const [notification, setNotification] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        triggerOcrSimulation(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerOcrSimulation = (fileName: string) => {
    setOcrStatus("loading");
    setConfidence(null);

    // Dynamic mock OCR parser based on file names
    setTimeout(() => {
      let parsedMerchant = "Mamak Corner Snd Bhd";
      let parsedAmount = "15.50";
      let parsedDate = "2025-06-18";
      let parsedCategory = "Food & Dining";
      let calculatedConfidence = 96;

      if (fileName.toLowerCase().includes("giant") || fileName.toLowerCase().includes("receipt1")) {
        parsedMerchant = "Giant Hypermarket KK";
        parsedAmount = "115.30";
        parsedDate = "2025-06-11";
        parsedCategory = "Shopping";
        calculatedConfidence = 94;
      } else if (fileName.toLowerCase().includes("lrt") || fileName.toLowerCase().includes("ticket")) {
        parsedMerchant = "RapidKL LRT Station";
        parsedAmount = "4.50";
        parsedDate = "2025-06-03";
        parsedCategory = "Transport";
        calculatedConfidence = 98;
      } else if (fileName.toLowerCase().includes("digi") || fileName.toLowerCase().includes("phone")) {
        parsedMerchant = "Digi Telecommunications";
        parsedAmount = "35.00";
        parsedDate = "2025-06-06";
        parsedCategory = "Bills";
        calculatedConfidence = 95;
      }

      setOcrMerchant(parsedMerchant);
      setOcrAmount(parsedAmount);
      setOcrDate(parsedDate);
      setOcrCategory(parsedCategory);
      setOcrNotes(`OCR Scanned from ${fileName}`);
      setConfidence(calculatedConfidence);
      setOcrStatus("success");
    }, 2500);
  };

  const handleOcrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocrMerchant || !ocrAmount || !ocrDate) return;

    onAddTransaction({
      merchant: ocrMerchant,
      amount: parseFloat(ocrAmount),
      date: ocrDate,
      category: ocrCategory,
      notes: ocrNotes,
      source: "ocr",
    });

    setNotification(
      isBm
        ? `Sukses! Resit daripada ${ocrMerchant} berjaya ditambah secara pintar!`
        : `Success! Receipt from ${ocrMerchant} logged successfully via Gemini AI!`
    );

    // Reset OCR
    setImagePreview(null);
    setOcrStatus("idle");
    setOcrMerchant("");
    setOcrAmount("");
    setOcrNotes("");
    setConfidence(null);

    setTimeout(() => setNotification(""), 4000);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMerchant || !manualAmount || !manualDate) return;

    onAddTransaction({
      merchant: manualMerchant,
      amount: parseFloat(manualAmount),
      date: manualDate,
      category: manualCategory,
      notes: manualNotes,
      source: "manual",
    });

    setNotification(
      isBm
        ? `Sukses! Log perbelanjaan ${manualMerchant} berjaya disimpan.`
        : `Success! Expensed RM ${parseFloat(manualAmount).toFixed(2)} under ${manualCategory} successfully.`
    );

    // Reset manual
    setManualMerchant("");
    setManualAmount("");
    setManualNotes("");

    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <div className="space-y-8 font-sans animate-fadeIn">
      {/* 1. Header Section */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          {isBm ? "Daftar Resit & Perbelanjaan" : "Receipt Scanning & Expense Entry"}
        </h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {isBm
            ? "Pengekstrakan data resit berkuasa Gemini Vision API dengan sokongan borang kemasukan manual."
            : "Gemini Vision AI powered receipt parsing coupled with instant manual data logging controls."}
        </p>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-3 animate-slideIn">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. Custom Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("ocr")}
          className={`pb-4 px-6 text-sm font-bold tracking-wide transition-all ${
            activeTab === "ocr"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {isBm ? "Imbasan Resit Gemini AI" : "Gemini AI Receipt OCR"}
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`pb-4 px-6 text-sm font-bold tracking-wide transition-all ${
            activeTab === "manual"
              ? "text-emerald-400 border-b-2 border-emerald-400"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {isBm ? "Kemasukan Manual" : "Manual Transaction Entry"}
        </button>
      </div>

      {/* 3. Render Tabs */}
      {activeTab === "ocr" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* File Upload Zone */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 self-start">
              {isBm ? "Muat Naik Gambar Resit" : "Upload Receipt Image"}
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-16 border-2 border-dashed border-white/10 rounded-2xl bg-[#020617]/30 hover:bg-white/5 hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col items-center gap-4 group"
              >
                <div className="p-4 bg-[#020617]/60 border border-white/10 text-slate-400 group-hover:text-emerald-400 rounded-2xl transition-all">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-white font-bold">
                    {isBm ? "Seret atau Klik gambar" : "Drag and Drop or Click to Browse"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {isBm ? "PNG, JPG atau JPEG sehingga 10MB" : "PNG, JPG or JPEG up to 10MB"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-h-72 flex items-center justify-center bg-slate-950">
                  <img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="object-contain max-h-72 w-full"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setOcrStatus("idle");
                    }}
                    className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 rounded-full text-slate-400 hover:text-white border border-slate-700 backdrop-blur"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span>{isBm ? "Gambar Berjaya Dimuat Naik" : "Image Uploaded Successfully"}</span>
                </div>
              </div>
            )}

            {/* Simulated preset quick mock-up files */}
            <div className="mt-6 w-full text-left">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
                {isBm ? "Contoh Resit (Uji AI)" : "Quick Demo Receipts (Simulate OCR)"}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setImagePreview("https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=60");
                    triggerOcrSimulation("mamak_receipt1.jpg");
                  }}
                  className="p-2 bg-[#020617]/60 hover:bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all text-left truncate font-medium cursor-pointer"
                >
                  🍔 Mamak Corner (RM15.50)
                </button>
                <button
                  onClick={() => {
                    setImagePreview("https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60");
                    triggerOcrSimulation("giant_groceries.png");
                  }}
                  className="p-2 bg-[#020617]/60 hover:bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all text-left truncate font-medium cursor-pointer"
                >
                  🛒 Giant Hypermarket (RM115.30)
                </button>
              </div>
            </div>
          </div>

          {/* Extracted Details & Confirmation Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              {ocrStatus === "idle" && (
                <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-4">
                  <Camera className="h-10 w-10 opacity-30 text-emerald-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">
                      {isBm ? "Sedia Untuk Imbasan AI" : "Awaiting Receipt Capture"}
                    </p>
                    <p className="text-xs max-w-xs leading-relaxed">
                      {isBm
                        ? "Muat naik resit atau klik salah satu contoh resit ujian di sebelah untuk memulakan pemprosesan Gemini API."
                        : "Upload a photo of your receipt or select a quick demo preset to trigger Gemini AI data extraction."}
                    </p>
                  </div>
                </div>
              )}

              {ocrStatus === "loading" && (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">
                      {isBm ? "Gemini AI Sedang Diproses..." : "Gemini 2.0 Vision parsing receipt..."}
                    </p>
                    <p className="text-xs text-slate-500 animate-pulse">
                      {isBm ? "Menganalisis teks, struktur, tarikh dan mengira tahap keyakinan jumlah keseluruhan..." : "Analyzing text, structure, dates and computing total sum confidence..."}
                    </p>
                  </div>
                </div>
              )}

              {ocrStatus === "success" && (
                <form onSubmit={handleOcrSubmit} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 animate-bounce" />
                      <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                        {isBm ? "AI Berhasil Diekstrak" : "AI Extraction Completed"}
                      </span>
                    </div>
                    {confidence && (
                      <span className="text-xs font-mono font-bold px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
                        Confidence: {confidence}%
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        {isBm ? "Nama Peniaga / Kedai" : "Merchant Name"}
                      </label>
                      <input
                        type="text"
                        value={ocrMerchant}
                        onChange={(e) => setOcrMerchant(e.target.value)}
                        className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        {isBm ? "Amaun (RM)" : "Amount (RM)"}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={ocrAmount}
                        onChange={(e) => setOcrAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold text-emerald-400 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        {isBm ? "Tarikh Transaksi" : "Transaction Date"}
                      </label>
                      <input
                        type="date"
                        value={ocrDate}
                        onChange={(e) => setOcrDate(e.target.value)}
                        className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Kategori Perbelanjaan
                      </label>
                      <select
                        value={ocrCategory}
                        onChange={(e) => setOcrCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                      >
                        {Object.keys(budgets).map((cat) => (
                          <option key={cat} value={cat}>
                            {translateCategory(cat)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      {isBm ? "Nota / Catatan Tambahan" : "Personal Notes"}
                    </label>
                    <textarea
                      value={ocrNotes}
                      onChange={(e) => setOcrNotes(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-2xl text-xs transition-all duration-300 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="h-4.5 w-4.5" />
                    <span>{isBm ? "Sahkan & Log Transaksi" : "Confirm & Save OCR Transaction"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Manual Transaction Entry view */
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto shadow-xl">
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <h3 className="text-sm font-bold text-white tracking-wide border-b border-white/5 pb-4">
              {isBm ? "Log Perbelanjaan Baru Secara Manual" : "Add Transaction Manually"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {isBm ? "Nama Kedai / Perihal" : "Merchant / Description"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mamak Corner"
                  value={manualMerchant}
                  onChange={(e) => setManualMerchant(e.target.value)}
                  className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {isBm ? "Amaun (RM)" : "Amount (RM)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold font-mono text-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {isBm ? "Tarikh Transaksi" : "Transaction Date"}
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Kategori
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                >
                  {Object.keys(budgets).map((cat) => (
                    <option key={cat} value={cat}>
                      {translateCategory(cat)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {isBm ? "Catatan" : "Notes"}
              </label>
              <textarea
                rows={2}
                placeholder={isBm ? "Butiran pembelian..." : "Details of purchase..."}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                className="w-full px-4 py-3 bg-[#020617]/50 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-2xl text-xs transition-all duration-300 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 tracking-wider uppercase flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              <span>{isBm ? "Simpan Log Perbelanjaan" : "Save Logged Transaction"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
