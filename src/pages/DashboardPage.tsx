import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { qrAPI } from "../services/api";
import { QR, QRType } from "../types";
import { QRLoader } from "../components/QRLoader";
import {
  LayoutDashboard,
  FolderHeart,
  BarChart4,
  User,
  Search,
  Filter,
  Download,
  Trash2,
  Heart,
  Eye,
  RefreshCw,
  Plus,
  ArrowUpRight,
  LogOut,
  QrCode,
  Sparkles,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Mail,
  Sliders,
  Check,
  X,
} from "lucide-react";
import QRCode from "qrcode";

interface DashboardPageProps {
  onNavigate: (view: "landing" | "dashboard" | "login" | "register") => void;
}

type DashboardTab = "overview" | "library" | "analytics" | "profile";

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [qrs, setQrs] = useState<QR[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Detail Modal State
  const [selectedQR, setSelectedQR] = useState<QR | null>(null);
  const [selectedQrDataUrl, setSelectedQrDataUrl] = useState("");
  const [copyingId, setCopyingId] = useState<string | null>(null);

  // Fetch saved QRs
  const fetchQRs = async () => {
    setLoading(true);
    try {
      const data = await qrAPI.getMyQRs({
        search: searchTerm || undefined,
        type: filterType !== "all" ? filterType : undefined,
      });
      setQrs(data.qrs || []);
    } catch (err) {
      console.error("Failed to load dashboard QRs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRs();
  }, [searchTerm, filterType]);

  // Operations
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this QR code? This cannot be undone.")) return;
    try {
      await qrAPI.delete(id);
      setQrs((prev) => prev.filter((q) => q.id !== id));
      if (selectedQR?.id === id) {
        setSelectedQR(null);
      }
    } catch (err) {
      console.error("Failed to delete QR:", err);
    }
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const data = await qrAPI.toggleFavorite(id);
      if (data.success) {
        setQrs((prev) =>
          prev.map((q) => (q.id === id ? { ...q, favorites: data.qr.favorites } : q))
        );
        if (selectedQR?.id === id) {
          setSelectedQR((prev) => (prev ? { ...prev, favorites: data.qr.favorites } : null));
        }
      }
    } catch (err) {
      console.error("Failed to favorite QR:", err);
    }
  };

  const handleRecordDownload = async (qr: QR, format: "png" | "svg") => {
    try {
      await qrAPI.recordDownload(qr.id);
      setQrs((prev) =>
        prev.map((q) => (q.id === qr.id ? { ...q, downloads: q.downloads + 1 } : q))
      );

      // Re-generate high-res canvas for download
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = qr.size || 512;
      tempCanvas.height = qr.size || 512;
      const ctx = tempCanvas.getContext("2d");

      if (ctx) {
        const qrBaseDataUrl = await QRCode.toDataURL(qr.url, {
          color: {
            dark: qr.foregroundColor,
            light: qr.backgroundColor,
          },
          width: qr.size,
          margin: qr.margin,
          errorCorrectionLevel: "H",
        });

        const qrImg = new Image();
        qrImg.src = qrBaseDataUrl;
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 0, 0, qr.size, qr.size);

          if (qr.logo) {
            const logoImg = new Image();
            logoImg.src = qr.logo;
            logoImg.onload = () => {
              const logoSize = qr.size * 0.22;
              const x = (qr.size - logoSize) / 2;
              const y = (qr.size - logoSize) / 2;

              ctx.fillStyle = qr.backgroundColor;
              ctx.beginPath();
              ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, 2 * Math.PI);
              ctx.fill();

              ctx.drawImage(logoImg, x + logoSize * 0.1, y + logoSize * 0.1, logoSize * 0.8, logoSize * 0.8);

              // Trigger download
              const finalDataUrl = tempCanvas.toDataURL("image/png");
              const link = document.createElement("a");
              link.download = `${qr.title}.png`;
              link.href = finalDataUrl;
              link.click();
            };
          } else {
            // No logo trigger download immediately
            const finalDataUrl = tempCanvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `${qr.title}.png`;
            link.href = finalDataUrl;
            link.click();
          }
        };
      }
    } catch (err) {
      console.error("Download handling failed:", err);
    }
  };

  const handleOpenDetailModal = async (qr: QR) => {
    setSelectedQR(qr);
    try {
      // Pre-render QR onto a dataUrl for preview rendering
      const dataUrl = await QRCode.toDataURL(qr.url, {
        color: {
          dark: qr.foregroundColor,
          light: qr.backgroundColor,
        },
        width: 350,
        margin: qr.margin,
        errorCorrectionLevel: "H",
      });
      setSelectedQrDataUrl(dataUrl);
    } catch (err) {
      console.error("Modal render error:", err);
    }
  };

  const handleCopyClipboard = async (qr: QR, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const dataUrl = await QRCode.toDataURL(qr.url, {
        color: {
          dark: qr.foregroundColor,
          light: qr.backgroundColor,
        },
        width: 512,
        margin: qr.margin,
        errorCorrectionLevel: "H",
      });

      // copy image helper
      const img = new Image();
      img.src = dataUrl;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ]);
            setCopyingId(qr.id);
            setTimeout(() => setCopyingId(null), 2000);
          }
        });
      };
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Compute stats helper
  const totalCodes = qrs.length;
  const totalDownloads = qrs.reduce((acc, q) => acc + q.downloads, 0);
  const totalFavorites = qrs.filter((q) => q.favorites.includes(user?.id || "")).length;

  const categoryDistribution = qrs.reduce((acc: any, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-[#0B0F19] pt-20">
      {/* 1. SIDEBAR (Left Rail) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl p-5 gap-6">
        <div className="px-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
            Workspace Console
          </span>
          <h3 className="font-display font-extrabold text-slate-900 dark:text-white mt-0.5 truncate text-lg">
            {user?.name || "Premium Creator"}
          </h3>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview Panel
          </button>

          <button
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "library"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FolderHeart className="w-4 h-4" />
            My Library ({totalCodes})
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "analytics"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart4 className="w-4 h-4" />
            Analytics Charts
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "profile"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            Account Profile
          </button>
        </nav>

        {/* Quick Launch trigger */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              const el = document.getElementById("hero");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              onNavigate("landing");
            }}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-brand-primary cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New QR Code
          </button>
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-500 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto overflow-y-auto">
        {/* Mobile quick tabs (visible only on small screens) */}
        <div className="flex items-center gap-1.5 md:hidden overflow-x-auto pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          {(["overview", "library", "analytics", "profile"] as DashboardTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap capitalize cursor-pointer ${
                activeTab === tab
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8">
            {/* Greeting Header */}
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-brand-primary dark:text-brand-accent bg-indigo-50 dark:bg-indigo-950/40 rounded-full mb-3">
                <Sparkles className="w-3 h-3 animate-spin" /> Real-time Synced Database
              </span>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
                Creator Overview
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Monitor cumulative QR stats, analytics, and manage recent codes.
              </p>
            </div>

            {/* Visual Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-2xl flex flex-col gap-1 relative overflow-hidden group hover:border-brand-primary transition-colors">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Total QR Codes</span>
                <span className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
                  {totalCodes}
                </span>
                <FolderHeart className="w-12 h-12 absolute right-3 bottom-3 text-slate-100 dark:text-slate-800/40 group-hover:scale-110 transition-transform" />
              </div>

              <div className="glass p-6 rounded-2xl flex flex-col gap-1 relative overflow-hidden group hover:border-brand-primary transition-colors">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Total Exports</span>
                <span className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
                  {totalDownloads}
                </span>
                <Download className="w-12 h-12 absolute right-3 bottom-3 text-slate-100 dark:text-slate-800/40 group-hover:scale-110 transition-transform" />
              </div>

              <div className="glass p-6 rounded-2xl flex flex-col gap-1 relative overflow-hidden group hover:border-brand-primary transition-colors">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Favorites</span>
                <span className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
                  {totalFavorites}
                </span>
                <Heart className="w-12 h-12 absolute right-3 bottom-3 text-slate-100 dark:text-slate-800/40 group-hover:scale-110 transition-transform fill-none" />
              </div>
            </div>

            {/* Recent QR Codes List */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Recent Generations
                </h3>
                <button
                  onClick={() => setActiveTab("library")}
                  className="text-xs font-semibold text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View library <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col gap-6 w-full">
                  <div className="py-2 flex justify-center">
                    <QRLoader size="sm" message="Loading your workspace..." />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="glass p-5 rounded-2xl flex flex-col gap-4 animate-pulse">
                        <div className="flex justify-between items-start">
                          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                          <div className="flex gap-1.5">
                            <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                            <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                          <div className="h-3.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </div>
                        <hr className="border-slate-100 dark:border-slate-800/50" />
                        <div className="flex justify-between items-center">
                          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : qrs.length === 0 ? (
                <div className="glass p-12 rounded-2xl text-center flex flex-col items-center justify-center gap-4">
                  <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                  <div>
                    <h4 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">
                      No codes generated yet
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                      Your dynamically saved codes will populate right here.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate("landing");
                      setTimeout(() => {
                        const el = document.getElementById("demo");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }, 200);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md hover:bg-brand-primary transition-colors cursor-pointer"
                  >
                    Generate First Code
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {qrs.slice(0, 3).map((qr) => (
                    <div
                      key={qr.id}
                      onClick={() => handleOpenDetailModal(qr)}
                      className="glass p-5 rounded-2xl flex flex-col gap-4 hover:border-brand-primary hover:shadow-lg hover:shadow-slate-100/5 transition-all duration-300 cursor-pointer relative group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                          {qr.type}
                        </span>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleToggleFavorite(qr.id, e)}
                            className="p-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <Heart className={`w-3.5 h-3.5 ${qr.favorites.includes(user?.id || "") ? "fill-red-500 text-red-500" : ""}`} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(qr.id, e)}
                            className="p-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                          {qr.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate font-mono">
                          {qr.url}
                        </span>
                      </div>

                      <hr className="border-slate-100/60 dark:border-slate-800/60" />

                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" /> {qr.downloads} downloads
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(qr.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIBRARY CATALOG */}
        {activeTab === "library" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
                Saved QR Library
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Filter, search, copy, and re-download your customized corporate QR codes.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search code titles, targets..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto items-center">
                <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none w-full sm:w-auto"
                >
                  <option value="all">All Formats</option>
                  <option value="url">Website URLs</option>
                  <option value="wifi">WiFi Networks</option>
                  <option value="vcard">VCard Contacts</option>
                  <option value="upi">UPI Payments</option>
                  <option value="text">Raw Text</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone Calls</option>
                  <option value="event">Calendar Events</option>
                  <option value="location">Geolocation</option>
                </select>
              </div>
            </div>

            {/* Grid listing */}
            {loading ? (
              <div className="flex flex-col gap-6 w-full">
                <div className="py-4 flex justify-center">
                  <QRLoader size="sm" message="Syncing library data..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="glass p-5 rounded-2xl flex flex-col gap-4 animate-pulse">
                      <div className="flex justify-between items-start">
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="flex gap-1.5">
                          <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                          <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-3.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      </div>
                      <hr className="border-slate-100 dark:border-slate-800/50" />
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : qrs.length === 0 ? (
              <div className="glass p-16 rounded-3xl text-center flex flex-col items-center gap-4">
                <Search className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <div>
                  <h4 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">No matching codes found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Try updating your search queries, clearing category filters, or generating a brand new code.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {qrs.map((qr) => (
                  <div
                    key={qr.id}
                    onClick={() => handleOpenDetailModal(qr)}
                    className="glass p-5 rounded-2xl flex flex-col gap-4 hover:border-brand-primary hover:shadow-lg hover:shadow-slate-100/5 transition-all duration-300 cursor-pointer relative group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        {qr.type}
                      </span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleToggleFavorite(qr.id, e)}
                          className="p-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Heart className={`w-3.5 h-3.5 ${qr.favorites.includes(user?.id || "") ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                        <button
                          onClick={(e) => handleCopyClipboard(qr, e)}
                          className="p-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-400 hover:text-indigo-500 cursor-pointer"
                          title="Copy PNG"
                        >
                          {copyingId === qr.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Layers className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => handleDelete(qr.id, e)}
                          className="p-1 rounded bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                        {qr.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate font-mono">
                        {qr.url}
                      </span>
                    </div>

                    <hr className="border-slate-100/60 dark:border-slate-800/60" />

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" /> {qr.downloads} downloads
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(qr.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS CHARTS */}
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
                SaaS Activity Analytics
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Interactive distribution and metrics of your cloud QR codes.
              </p>
            </div>

            {/* Main vector visual chart panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-2xl md:col-span-2 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Category Distribution Matrix
                </h4>
                {totalCodes === 0 ? (
                  <div className="py-20 text-center text-xs text-slate-400">
                    No code parameters loaded. Populate codes to view vector graphs.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 w-full">
                    {/* Render standard proportional bar charts dynamically */}
                    {Object.keys(categoryDistribution).map((key) => {
                      const val = categoryDistribution[key];
                      const pct = Math.round((val / totalCodes) * 100);
                      return (
                        <div key={key} className="flex flex-col gap-1 w-full">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                              {key} ({val} codes)
                            </span>
                            <span className="text-slate-400">{pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Statistics sidebar */}
              <div className="glass p-6 rounded-2xl flex flex-col gap-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Operational Summary
                </h4>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Active Library Codes</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{totalCodes}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Cumulative Downloads</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{totalDownloads}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Avg Downloads / Code</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {totalCodes === 0 ? "0" : (totalDownloads / totalCodes).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/30 rounded-xl text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Static codes encode target strings directly inside local pixel clusters. Scan metrics represent user browser logs upon download request.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACCOUNT PROFILE & SETTINGS */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
                Account Settings
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage user profile configurations, integrations, and secure credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Profile Card */}
              <div className="glass p-6 sm:p-8 rounded-3xl flex flex-col gap-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Personal Profile
                </h4>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-bold text-slate-400 dark:text-slate-500 uppercase">Username</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{user?.name}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-bold text-slate-400 dark:text-slate-500 uppercase">Email</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{user?.email}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-bold text-slate-400 dark:text-slate-500 uppercase">Subscription Status</span>
                    <span className="inline-flex max-w-fit items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-full">
                      Professional Plan (Active)
                    </span>
                  </div>
                </div>
              </div>

              {/* Developer Keys Card */}
              <div className="glass p-6 sm:p-8 rounded-3xl flex flex-col gap-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" /> Custom Developer APIs
                </h4>
                <div className="flex flex-col gap-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Integrate QRVerse APIs into your SaaS:</span>
                  <span>Connect your headless applications directly to our render pipelines. Secure JWT Bearer tokens will authorize remote microservices automatically.</span>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <span className="font-bold text-slate-400 dark:text-slate-500 uppercase">Your Client Secret Key</span>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl font-mono text-[10px] break-all text-slate-700 dark:text-slate-300">
                      qrv_pro_live_9a4f215e9821a7b63f5c92e1039aef7c53d
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. QR DETAILS PREVIEW MODAL */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800 p-6 sm:p-8 flex flex-col gap-6 relative">
            {/* Close */}
            <button
              onClick={() => setSelectedQR(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {selectedQR.type} Parameter Code
              </span>
              <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mt-1.5 truncate max-w-[85%]">
                {selectedQR.title}
              </h3>
            </div>

            {/* Modal QR Code Visual */}
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900/60 shadow-inner flex items-center justify-center">
                <img
                  src={selectedQrDataUrl}
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  alt="QR Preview"
                />
              </div>
              <p className="text-xs text-slate-400 text-center font-mono break-all max-w-xs leading-relaxed">
                Raw Value: {selectedQR.url}
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Details specification details */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
              <div className="flex flex-col gap-0.5 border-r border-slate-100 dark:border-slate-800/60 pr-2">
                <span>Foreground HEX</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{selectedQR.foregroundColor}</span>
              </div>
              <div className="flex flex-col gap-0.5 pl-2">
                <span>Background HEX</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{selectedQR.backgroundColor}</span>
              </div>
              <div className="flex flex-col gap-0.5 border-r border-slate-100 dark:border-slate-800/60 pr-2 pt-2">
                <span>Resolution Size</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{selectedQR.size} × {selectedQR.size}px</span>
              </div>
              <div className="flex flex-col gap-0.5 pl-2 pt-2">
                <span>Silent Margin</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{selectedQR.margin} Modules</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => handleRecordDownload(selectedQR, "png")}
                className="py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-primary cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
              <button
                onClick={(e) => handleCopyClipboard(selectedQR, e)}
                className="py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                {copyingId === selectedQR.id ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" /> Copied!
                  </>
                ) : (
                  <>
                    <FolderHeart className="w-4 h-4" /> Copy Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
