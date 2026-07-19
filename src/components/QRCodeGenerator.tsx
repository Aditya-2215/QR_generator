import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { qrAPI } from "../services/api";
import { QR } from "../types";
import { useQRDownloader } from "../hooks/useQRDownloader";
import { QRLoader } from "./QRLoader";
import {
  QrCode,
  Link as LinkIcon,
  Palette,
  Sliders,
  Download,
  Copy,
  Check,
  CloudLightning,
  Sparkles,
  Lock,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react";

interface QRCodeGeneratorProps {
  onQRGenerated?: (qr: QR) => void;
  isAuthenticated?: boolean;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  onQRGenerated,
  isAuthenticated,
}) => {
  const { downloadQR, isDownloading } = useQRDownloader();
  const [url, setUrl] = useState("https://google.com");
  const [foregroundColor, setForegroundColor] = useState("#4F46E5");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [size, setSize] = useState(350);
  const [margin, setMargin] = useState(4);
  const [title, setTitle] = useState("");
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("H");
  
  // Status and loading states
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Quick swatch definitions
  const swatches = [
    { color: "#4F46E5", name: "Indigo" },
    { color: "#0F172A", name: "Slate" },
    { color: "#10B981", name: "Emerald" },
    { color: "#EF4444", name: "Red" },
    { color: "#F59E0B", name: "Amber" },
    { color: "#EC4899", name: "Pink" },
  ];

  // Helper to enforce secure (https://) URLs, preventing dangerous protocols or unsecure paths
  const ensureSecureUrl = (input: string): string => {
    if (!input) return "https://google.com";
    let trimmed = input.trim();
    
    // Guard against XSS or malicious schemes
    const isDangerousProtocol = /^(javascript|data|vbscript|file):/i.test(trimmed);
    if (isDangerousProtocol) {
      return "https://google.com";
    }

    // Add protocol if none is found
    if (!/^[a-zA-Z]+:\/\//i.test(trimmed)) {
      trimmed = "https://" + trimmed;
    }

    // Force HTTPS for a direct, encrypted, secure link
    if (/^http:\/\//i.test(trimmed)) {
      trimmed = "https://" + trimmed.slice(7);
    }

    try {
      const parsedUrl = new URL(trimmed);
      return parsedUrl.toString();
    } catch (err) {
      return "https://google.com";
    }
  };

  const secureTargetUrl = ensureSecureUrl(url);

  // Generate QR code client-side whenever parameters change
  useEffect(() => {
    let active = true;
    const generateClientQR = async () => {
      setIsGenerating(true);
      try {
        const dataUrl = await QRCode.toDataURL(secureTargetUrl, {
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          width: size,
          margin: margin,
          errorCorrectionLevel: errorCorrection,
        });

        // 550ms premium vector compile buffer
        await new Promise((resolve) => setTimeout(resolve, 550));

        if (!active) return;
        setQrDataUrl(dataUrl);

        // Also draw onto hidden canvas for high-quality downloads & clipboard copy
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const img = new Image();
            img.src = dataUrl;
            img.onload = () => {
              if (ctx) {
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img, 0, 0, size, size);
              }
            };
          }
        }
      } catch (err) {
        console.error("Client-side QR generation error:", err);
      } finally {
        if (active) {
          setIsGenerating(false);
        }
      }
    };

    generateClientQR();
    return () => {
      active = false;
    };
  }, [secureTargetUrl, foregroundColor, backgroundColor, size, margin, errorCorrection]);

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (err) {
      console.error("Failed to copy image:", err);
    }
  };

  const handleDownload = (format: "png" | "svg" | "pdf") => {
    downloadQR(format, {
      text: secureTargetUrl,
      title: title || "qrverse-secure-code",
      foregroundColor,
      backgroundColor,
      size,
      margin,
      errorCorrectionLevel: errorCorrection,
    });
  };

  const handleSaveToCloud = async () => {
    if (!isAuthenticated) {
      setSaveError("Please sign in or create an account to save codes to your cloud library.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const qrTitle = title.trim() || `Secure QR - ${new URL(secureTargetUrl).hostname || "Link"}`;
      const data = await qrAPI.generate({
        title: qrTitle,
        type: "url",
        url: secureTargetUrl,
        foregroundColor,
        backgroundColor,
        size,
        margin,
      });

      setSaveSuccess(true);
      if (data.qr && onQRGenerated) {
        onQRGenerated(data.qr);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.error || "Failed to save QR design to your account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Hidden Canvas for operations */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Left Settings Control Column */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.04)] dark:shadow-none flex flex-col gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3" /> Secure QR Code Engine
          </div>
          <h3 className="font-display font-extrabold text-2xl text-slate-950 dark:text-white leading-snug">
            Sleek QR Customizer
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            All links are automatically configured with secure protocols (<code className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">https://</code>) to guard your scan routing.
          </p>
        </div>

        {/* Input fields */}
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Code Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Marketing Portal Link"
              className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Destination Link */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" /> Destination URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com/promo"
                className="w-full pl-4 pr-16 py-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
              <span className="absolute right-3 top-3 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 text-[10px] font-mono text-emerald-600 font-bold">
                HTTPS
              </span>
            </div>
            {url && (
              <p className="text-[10px] text-slate-400 font-mono truncate leading-normal">
                Generates: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{secureTargetUrl}</span>
              </p>
            )}
          </div>

          {/* Color Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Foreground */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-slate-400" /> QR Pattern Color
              </label>
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                <input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                />
                <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                  {foregroundColor.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Background */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-slate-400" /> Background Color
              </label>
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-800 p-0"
                />
                <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                  {backgroundColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Swatches Helper */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Swatches:
            </span>
            {swatches.map((sw) => (
              <button
                key={sw.color}
                type="button"
                onClick={() => setForegroundColor(sw.color)}
                className="w-5 h-5 rounded-full border border-white dark:border-slate-900 shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: sw.color }}
                title={sw.name}
              />
            ))}
          </div>

          <hr className="border-slate-100 dark:border-slate-800/80 my-2" />

          {/* Size and margin range sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Size */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" /> Image Size
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  {size}px
                </span>
              </div>
              <input
                type="range"
                min="128"
                max="1024"
                step="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Quiet Zone Margin */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <span>Quiet Zone (Padding)</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  {margin} modules
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Error Correction Selection */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Error Correction Redundancy
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { level: "L", label: "Low (7%)" },
                { level: "M", label: "Medium (15%)" },
                { level: "Q", label: "Quartile (25%)" },
                { level: "H", label: "High (30% - Best)" },
              ].map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => setErrorCorrection(item.level as any)}
                  className={`py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer border ${
                    errorCorrection === item.level
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Live Preview Column */}
      <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.04)] dark:shadow-none flex flex-col items-center gap-6">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Live Preview
            </span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          {/* QR Code Canvas Frame Container */}
          <div className="relative aspect-square w-full max-w-[280px] bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-slate-950 dark:to-slate-900 rounded-[28px] border border-indigo-100/30 dark:border-slate-800/80 flex items-center justify-center p-6 shadow-inner">
            {isGenerating ? (
              <QRLoader size="sm" message="" />
            ) : qrDataUrl ? (
              <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100 dark:border-transparent flex items-center justify-center">
                <img
                  src={qrDataUrl}
                  alt="Sleek QR Code Preview"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                <QrCode className="w-12 h-12 stroke-[1.5] animate-pulse" />
                <span className="text-xs font-semibold">Configuring preview...</span>
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {saveSuccess && (
            <div className="w-full text-center py-2 px-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-100/50">
              ✓ Successfully synced to your cloud library!
            </div>
          )}
          {saveError && (
            <div className="w-full text-center py-2 px-3 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 rounded-xl text-xs font-bold border border-red-100/50">
              {saveError}
            </div>
          )}

          {/* Control Actions */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Download Format
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleDownload("png")}
                  disabled={isDownloading || !qrDataUrl}
                  className="py-3 px-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shadow-md shadow-indigo-500/10"
                >
                  <Download className="w-4 h-4" />
                  <span>PNG</span>
                </button>
                <button
                  onClick={() => handleDownload("svg")}
                  disabled={isDownloading || !qrDataUrl}
                  className="py-3 px-2 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 border border-indigo-100/40 dark:border-slate-700/50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>SVG</span>
                </button>
                <button
                  onClick={() => handleDownload("pdf")}
                  disabled={isDownloading || !qrDataUrl}
                  className="py-3 px-2 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 border border-indigo-100/40 dark:border-slate-700/50"
                >
                  <QrCode className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 w-full">
              <button
                onClick={handleCopy}
                disabled={!qrDataUrl}
                className="py-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" /> Copied Image
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Image
                  </>
                )}
              </button>

              <button
                onClick={handleSaveToCloud}
                disabled={saving || !qrDataUrl}
                className="py-3 bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white dark:text-slate-900 hover:text-white dark:hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
              >
                {saving ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <CloudLightning className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    Save to Cloud
                  </>
                )}
              </button>
            </div>

            {!isAuthenticated && (
              <p className="text-[10px] text-slate-400 text-center leading-normal mt-1">
                Tip: <span className="underline cursor-pointer font-bold text-indigo-600 dark:text-indigo-400">Sign in</span> to unlock live telemetry logs and cloud backup.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
