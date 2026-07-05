import React, { useState, useEffect } from "react";
import { Transaction, Budget, Alert, UserProfile, AdminUser, AdminCategory, AdminTransaction } from "./types";
import {
  DEFAULT_TRANSACTIONS,
  DEFAULT_BUDGETS,
  DEFAULT_ALERTS,
  DEFAULT_PROFILE,
  DEFAULT_ADMIN_USERS,
  DEFAULT_ADMIN_CATEGORIES,
  DEFAULT_ADMIN_TRANSACTIONS,
} from "./data";

// Components
import { LoginScreen } from "./components/LoginScreen";
import { AdminLogin } from "./components/AdminLogin";
import { DashboardView } from "./components/DashboardView";
import { ReceiptView } from "./components/ReceiptView";
import { TransactionsView } from "./components/TransactionsView";
import { BudgetView } from "./components/BudgetView";
import { ReportsView } from "./components/ReportsView";
import { ForecastView } from "./components/ForecastView";
import { AccountView } from "./components/AccountView";
import { AdminView } from "./components/AdminView";

// Icons
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Target,
  BarChart3,
  BrainCircuit,
  User,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  Globe,
  CircleHelp,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

export default function App() {
  // Session / Portal State
  const [session, setSession] = useState<"guest" | "student" | "admin" | "admin_login">("guest");
  const [lang, setLang] = useState<"EN" | "BM">("EN");

  // Theme Mode: "light" | "dark" | "system"
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(() => {
    return (localStorage.getItem("ipecs_theme_mode") as "light" | "dark" | "system") || "light";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    localStorage.setItem("ipecs_theme_mode", themeMode);
    if (themeMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        setResolvedTheme(mediaQuery.matches ? "dark" : "light");
      };
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      setResolvedTheme(themeMode);
    }
  }, [themeMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  // Core App states
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("ipecs_transactions");
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget>(() => {
    const saved = localStorage.getItem("ipecs_budgets");
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem("ipecs_alerts");
    return saved ? JSON.parse(saved) : DEFAULT_ALERTS;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("ipecs_profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  // Admin Portal specific States
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem("ipecs_admin_users");
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN_USERS;
  });

  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>(() => {
    const saved = localStorage.getItem("ipecs_admin_categories");
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN_CATEGORIES;
  });

  const [adminTransactions, setAdminTransactions] = useState<AdminTransaction[]>(() => {
    const saved = localStorage.getItem("ipecs_admin_transactions");
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN_TRANSACTIONS;
  });

  // Navigation / Tab active page
  const [activeTab, setActiveTab] = useState<string>("Dashboard");

  // Mobile drawer responsive control
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem("ipecs_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("ipecs_budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("ipecs_alerts", JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem("ipecs_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("ipecs_admin_users", JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem("ipecs_admin_categories", JSON.stringify(adminCategories));
  }, [adminCategories]);

  useEffect(() => {
    localStorage.setItem("ipecs_admin_transactions", JSON.stringify(adminTransactions));
  }, [adminTransactions]);

  // Auth hooks
  const handleStudentLogin = (username: string) => {
    setSession("student");
    setActiveTab("Dashboard");
  };

  const handleAdminAuthSuccess = () => {
    setSession("admin");
    setActiveTab("Admin Dashboard");
  };

  const handleLogout = () => {
    setSession("guest");
  };

  // Transaction mutation triggers
  const handleAddTransaction = (newTx: Omit<Transaction, "id">) => {
    const freshId = `tx-${Date.now()}`;
    const txItem: Transaction = {
      ...newTx,
      id: freshId,
    };

    setTransactions((prev) => [txItem, ...prev]);

    // Check for anomalous spending triggers matching python logic
    // If the transaction amount is > 1.5x of the average for that category OR is over category limits
    const categoryTxList = transactions.filter((t) => t.category === newTx.category);
    const avgSpend = categoryTxList.length > 0
      ? categoryTxList.reduce((sum, t) => sum + t.amount, 0) / categoryTxList.length
      : 15;

    if (newTx.amount > avgSpend * 1.5 && newTx.amount > 30) {
      // Fire simulated anomaly warning
      const anomalyId = `al-${Date.now()}`;
      const anomalyAlert: Alert = {
        id: anomalyId,
        type: "Unusual Spike",
        category: newTx.category,
        amount: newTx.amount,
        date: newTx.date,
        severity: "High",
        dismissed: false,
      };
      setAlerts((prev) => [anomalyAlert, ...prev]);
    }
  };

  const handleUpdateTransactions = (updated: Transaction[]) => {
    setTransactions(updated);
  };

  const handleAddCategory = (name: string, limit: number) => {
    setBudgets((prev) => ({
      ...prev,
      [name]: limit,
    }));

    // Register into System admin taxonomies too to keep state sync
    const freshCat: AdminCategory = {
      categoryName: name,
      colour: "#8b5cf6",
      default: false,
      active: true,
    };
    setAdminCategories((prev) => [...prev, freshCat]);
  };

  const handleUpdateBudgets = (updated: Budget) => {
    setBudgets(updated);
  };

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    );
  };

  // Admin mutation triggers
  const handleToggleUserActive = (userId: string) => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, active: !u.active } : u))
    );
  };

  const handleAddSystemCategory = (name: string, color: string) => {
    const fresh: AdminCategory = {
      categoryName: name,
      colour: color,
      default: false,
      active: true,
    };
    setAdminCategories((prev) => [...prev, fresh]);

    // Update students budgets lists automatically
    setBudgets((prev) => ({
      ...prev,
      [name]: 100, // default limit
    }));
  };

  const handleDeleteSystemCategory = (name: string) => {
    setAdminCategories((prev) => prev.filter((c) => c.categoryName !== name));

    // Also remove from budgets list
    setBudgets((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleToggleCategoryActive = (name: string) => {
    setAdminCategories((prev) =>
      prev.map((c) => (c.categoryName === name ? { ...c, active: !c.active } : c))
    );
  };

  const handleToggleTransactionFlag = (id: string) => {
    setAdminTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, flagged: !t.flagged } : t))
    );
  };

  // Data Wiping Operations
  const handleClearAllData = () => {
    setTransactions([]);
    setAlerts([]);
  };

  const handleResetData = () => {
    localStorage.removeItem("ipecs_transactions");
    localStorage.removeItem("ipecs_budgets");
    localStorage.removeItem("ipecs_alerts");
    localStorage.removeItem("ipecs_profile");
    localStorage.removeItem("ipecs_admin_users");
    localStorage.removeItem("ipecs_admin_categories");
    localStorage.removeItem("ipecs_admin_transactions");

    setTransactions(DEFAULT_TRANSACTIONS);
    setBudgets(DEFAULT_BUDGETS);
    setAlerts(DEFAULT_ALERTS);
    setProfile(DEFAULT_PROFILE);
    setAdminUsers(DEFAULT_ADMIN_USERS);
    setAdminCategories(DEFAULT_ADMIN_CATEGORIES);
    setAdminTransactions(DEFAULT_ADMIN_TRANSACTIONS);
  };

  const handleDownloadAllCsv = () => {
    let csv = "Date,Merchant,Category,Amount,Notes,Source\n";
    transactions.forEach((t) => {
      csv += `"${t.date}","${t.merchant}","${t.category}",${t.amount},"${t.notes || ""}","${t.source}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ipecs_all_transactions.csv`;
    link.click();
  };

  // Switch between portals cleanly
  if (session === "guest") {
    return (
      <LoginScreen
        lang={lang}
        onLogin={handleStudentLogin}
        onAdminGate={() => setSession("admin_login")}
      />
    );
  }

  if (session === "admin_login") {
    return (
      <AdminLogin
        lang={lang}
        onLoginSuccess={handleAdminAuthSuccess}
        onBack={() => setSession("guest")}
      />
    );
  }

  // Sidebar Layout Navigation Menus Array
  const isBm = lang === "BM";

  const studentNavigation = [
    { id: "Dashboard", name: isBm ? "Papan Pemuka" : "Dashboard", icon: LayoutDashboard },
    { id: "Receipt & Transaction Entry", name: isBm ? "Daftar & Resit" : "Receipt & Transaction Entry", icon: Receipt },
    { id: "Transaction & Category Management", name: isBm ? "Papan Hamparan" : "Transaction & Category Management", icon: FileSpreadsheet },
    { id: "Budget Goal Management", name: isBm ? "Siling & Had Bajet" : "Budget Goal Management", icon: Target },
    { id: "Spending Reports & Insights", name: isBm ? "Analisis & Laporan" : "Spending Reports & Insights", icon: BarChart3 },
    { id: "AI Forecast & Alerts", name: isBm ? "Ramalan AI & Amaran" : "AI Forecast & Alerts", icon: BrainCircuit },
    { id: "User Profile & Account", name: isBm ? "Profil Akaun" : "User Profile & Account", icon: User },
  ];

  const adminNavigation = [
    { id: "Admin Dashboard", name: isBm ? "Papan Pemuka Admin" : "Admin Dashboard", icon: ShieldAlert },
  ];

  const activeNavigation = session === "admin" ? adminNavigation : studentNavigation;

  return (
    <div className="min-h-screen flex font-sans transition-colors duration-300">
      {/* 1. Sidebar Panel (Hidden on Mobile) */}
      <aside className="w-72 bg-slate-900/40 border-r border-white/5 shrink-0 hidden lg:flex flex-col justify-between py-6 relative z-10">
        <div className="space-y-8 px-6">
          {/* Logo Brand area */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">IPECS<span className="text-emerald-500">PRO</span></h1>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                {session === "admin" ? "Systems Administrator" : "Student Portal"}
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 pt-4">
            {activeNavigation.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              const hoverStyle = session === "admin"
                ? "hover:bg-red-500/10 hover:text-red-400"
                : "hover:bg-emerald-500/10 hover:text-emerald-400";
              const selectStyle = session === "admin"
                ? "bg-red-500/10 text-red-400 border-l-4 border-red-500 font-extrabold"
                : "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 font-extrabold";

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full py-3.5 px-4 rounded-xl text-left text-xs font-semibold flex items-center gap-3.5 transition-all cursor-pointer ${
                    isSelected ? selectStyle : `text-slate-400 ${hoverStyle}`
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global Toolbar inside Sidebar Footer */}
        <div className="px-6 space-y-3">
          <div className="p-3 bg-white/5 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm dark:shadow-none">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isBm ? "Tetapan Sistem" : "System Settings"}
            </div>

            {/* Language Selector row */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Globe className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>{isBm ? "Bahasa" : "Language"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 font-mono">
                <button
                  onClick={() => setLang("EN")}
                  className={`py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider transition-all cursor-pointer ${
                    lang === "EN"
                      ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  ENGLISH
                </button>
                <button
                  onClick={() => setLang("BM")}
                  className={`py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider transition-all cursor-pointer ${
                    lang === "BM"
                      ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  MELAYU
                </button>
              </div>
            </div>

            {/* Theme Selector row */}
            <div className="space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Sun className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 block dark:hidden" />
                <Moon className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 hidden dark:block" />
                <span>{isBm ? "Mod Tema" : "Theme Mode"}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setThemeMode("light")}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    themeMode === "light"
                      ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Sun className="h-3 w-3" />
                  <span>{isBm ? "Cerah" : "Light"}</span>
                </button>
                <button
                  onClick={() => setThemeMode("dark")}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    themeMode === "dark"
                      ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Moon className="h-3 w-3" />
                  <span>{isBm ? "Gelap" : "Dark"}</span>
                </button>
                <button
                  onClick={() => setThemeMode("system")}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    themeMode === "system"
                      ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Monitor className="h-3 w-3" />
                  <span>{isBm ? "Sistem" : "System"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-800/80 pt-4">
            <div className="h-9 w-9 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 text-xs font-bold">
              {session === "admin" ? "AD" : profile.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <span className="text-xs font-extrabold block text-white truncate">
                {session === "admin" ? "System Admin" : profile.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-[10px] text-red-400 font-bold hover:underline cursor-pointer"
              >
                {isBm ? "Log Keluar Sesi" : "Log out Session"}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main content viewport area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Upper Margins Utility Header bar */}
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between lg:justify-end gap-4 bg-slate-950/50 backdrop-blur-md relative z-20">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 bg-[#020617] px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SYSTEM SECURE</span>
            </div>
          </div>
        </header>

        {/* Dynamic page contents routing wrapper */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Mobile Navigation Drawer overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur z-30 lg:hidden flex flex-col p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-white">
                  {isBm ? "Laci Navigasi IPECS" : "IPECS Navigation Drawer"}
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 bg-slate-900 rounded-lg text-slate-400"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-1">
                {activeNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className="py-3.5 px-4 rounded-xl text-left text-sm font-semibold flex items-center gap-3.5 hover:bg-slate-900 text-slate-300"
                    >
                      <Icon className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Preferences in Mobile Drawer */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="p-3 bg-slate-900/60 border border-white/10 rounded-2xl space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isBm ? "Tetapan Sistem" : "System Settings"}
                  </div>

                  {/* Language Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Globe className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{isBm ? "Bahasa" : "Language"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 font-mono">
                      <button
                        onClick={() => setLang("EN")}
                        className={`py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                          lang === "EN"
                            ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        ENGLISH
                      </button>
                      <button
                        onClick={() => setLang("BM")}
                        className={`py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                          lang === "BM"
                            ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        MELAYU
                      </button>
                    </div>
                  </div>

                  {/* Theme Row */}
                  <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <Sun className="h-3.5 w-3.5 text-emerald-400 block dark:hidden" />
                      <Moon className="h-3.5 w-3.5 text-emerald-400 hidden dark:block" />
                      <span>{isBm ? "Mod Tema" : "Theme Mode"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => setThemeMode("light")}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          themeMode === "light"
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Sun className="h-3.5 w-3.5" />
                        <span>{isBm ? "Cerah" : "Light"}</span>
                      </button>
                      <button
                        onClick={() => setThemeMode("dark")}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          themeMode === "dark"
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Moon className="h-3.5 w-3.5" />
                        <span>{isBm ? "Gelap" : "Dark"}</span>
                      </button>
                      <button
                        onClick={() => setThemeMode("system")}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          themeMode === "system"
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Monitor className="h-3.5 w-3.5" />
                        <span>{isBm ? "Sistem" : "System"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab switches routing */}
          {activeTab === "Dashboard" && (
            <DashboardView
              lang={lang}
              transactions={transactions}
              budgets={budgets}
              alerts={alerts}
              onNavigate={(page) => setActiveTab(page)}
            />
          )}

          {activeTab === "Receipt & Transaction Entry" && (
            <ReceiptView
              lang={lang}
              budgets={budgets}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeTab === "Transaction & Category Management" && (
            <TransactionsView
              lang={lang}
              transactions={transactions}
              budgets={budgets}
              onUpdateTransactions={handleUpdateTransactions}
              onAddCategory={handleAddCategory}
            />
          )}

          {activeTab === "Budget Goal Management" && (
            <BudgetView
              lang={lang}
              budgets={budgets}
              transactions={transactions}
              onUpdateBudgets={handleUpdateBudgets}
            />
          )}

          {activeTab === "Spending Reports & Insights" && (
            <ReportsView
              lang={lang}
              transactions={transactions}
              budgets={budgets}
            />
          )}

          {activeTab === "AI Forecast & Alerts" && (
            <ForecastView
              lang={lang}
              alerts={alerts}
              budgets={budgets}
              transactions={transactions}
              onDismissAlert={handleDismissAlert}
              onReviewAlert={() => setActiveTab("Transaction & Category Management")}
            />
          )}

          {activeTab === "User Profile & Account" && (
            <AccountView
              lang={lang}
              profile={profile}
              budgets={budgets}
              onUpdateProfile={setProfile}
              onUpdateLang={setLang}
              onDownloadAll={handleDownloadAllCsv}
              onClearData={handleClearAllData}
              onResetData={handleResetData}
              onLogout={handleLogout}
            />
          )}

          {activeTab === "Admin Dashboard" && (
            <AdminView
              lang={lang}
              adminUsers={adminUsers}
              adminCategories={adminCategories}
              adminTransactions={adminTransactions}
              onToggleUserActive={handleToggleUserActive}
              onAddSystemCategory={handleAddSystemCategory}
              onDeleteSystemCategory={handleDeleteSystemCategory}
              onToggleCategoryActive={handleToggleCategoryActive}
              onToggleTransactionFlag={handleToggleTransactionFlag}
              onLogoutAdmin={handleLogout}
            />
          )}
        </main>
      </div>
    </div>
  );
}
