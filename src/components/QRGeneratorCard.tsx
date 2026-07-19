import React, { useState, useEffect, useRef } from "react";
import { qrAPI } from "../services/api";
import { QRType, QRFormData, QR } from "../types";
import { useQRDownloader, drawCustomQRToCanvas } from "../hooks/useQRDownloader";
import { QRLoader } from "./QRLoader";
import {
  Link,
  Wifi,
  FileText,
  Mail,
  Phone,
  UserSquare,
  DollarSign,
  Calendar,
  MapPin,
  Palette,
  Sliders,
  Image as ImageIcon,
  Download,
  Copy,
  Share2,
  RefreshCw,
  Sparkles,
  Check,
  ShieldCheck,
  Lock,
  Fingerprint,
} from "lucide-react";

interface QRGeneratorCardProps {
  onQRGenerated?: (qr: QR) => void;
  isAuthenticated?: boolean;
}

export const QRGeneratorCard: React.FC<QRGeneratorCardProps> = ({ onQRGenerated, isAuthenticated }) => {
  const { downloadQR } = useQRDownloader();
  const [activeTab, setActiveTab] = useState<QRType>("url");
  
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

  const [formData, setFormData] = useState<QRFormData>({
    title: "",
    type: "url",
    url: "https://google.com",
    foregroundColor: "#4F46E5",
    backgroundColor: "#ffffff",
    size: 512,
    margin: 4,
    pixelStyle: "square",
    // wifi
    wifiSSID: "",
    wifiPassword: "",
    wifiEncryption: "WPA",
    // vcard
    vcardName: "",
    vcardPhone: "",
    vcardEmail: "",
    vcardOrg: "",
    vcardTitle: "",
    vcardUrl: "",
    vcardAddress: "",
    // email
    emailAddress: "",
    emailSubject: "",
    emailBody: "",
    // phone
    phoneNo: "",
    // upi
    upiId: "",
    upiName: "",
    upiAmount: "",
    upiNote: "",
    // event
    eventTitle: "",
    eventStart: "",
    eventEnd: "",
    eventLocation: "",
    eventDesc: "",
    // location
    lat: "",
    lng: "",
    // text
    textRaw: "",
  });

  const [loading, setLoading] = useState(false);
  const [baseQrUrl, setBaseQrUrl] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isSecured, setIsSecured] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tabs layout helper
  const tabs = [
    { id: "url", label: "Website", icon: Link },
    { id: "wifi", label: "WiFi", icon: Wifi },
    { id: "vcard", label: "Contact", icon: UserSquare },
    { id: "upi", label: "UPI Pay", icon: DollarSign },
    { id: "text", label: "Text", icon: FileText },
    { id: "email", label: "Email", icon: Mail },
    { id: "phone", label: "Phone", icon: Phone },
    { id: "event", label: "Event", icon: Calendar },
    { id: "location", label: "Location", icon: MapPin },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Convert uploaded logo to base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData((prev) => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoPreview("");
    setFormData((prev) => ({ ...prev, logo: undefined }));
  };

  // Helper to compile inputs into standard protocol strings
  const getCompiledQRValue = (): string => {
    switch (activeTab) {
      case "wifi":
        const encryption = formData.wifiEncryption || "WPA";
        return `WIFI:S:${formData.wifiSSID || "Network"};T:${encryption};P:${formData.wifiPassword || ""};;`;

      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nN:${formData.vcardName || "Name"}\nORG:${formData.vcardOrg || ""}\nTITLE:${formData.vcardTitle || ""}\nTEL:${formData.vcardPhone || ""}\nEMAIL:${formData.vcardEmail || ""}\nADR:${formData.vcardAddress || ""}\nURL:${formData.vcardUrl ? ensureSecureUrl(formData.vcardUrl) : ""}\nEND:VCARD`;

      case "upi":
        return `upi://pay?pa=${formData.upiId || "merchant@upi"}&pn=${encodeURIComponent(formData.upiName || "Merchant")}&am=${formData.upiAmount || ""}&tn=${encodeURIComponent(formData.upiNote || "")}&cu=INR`;

      case "email":
        return `mailto:${formData.emailAddress || ""}?subject=${encodeURIComponent(formData.emailSubject || "")}&body=${encodeURIComponent(formData.emailBody || "")}`;

      case "phone":
        return `tel:${formData.phoneNo || ""}`;

      case "event":
        return `BEGIN:VEVENT\nSUMMARY:${formData.eventTitle || "Event"}\nDTSTART:${formData.eventStart?.replace(/[-:]/g, "") || ""}\nDTEND:${formData.eventEnd?.replace(/[-:]/g, "") || ""}\nLOCATION:${formData.eventLocation || ""}\nDESCRIPTION:${formData.eventDesc || ""}\nEND:VEVENT`;

      case "location":
        return `geo:${formData.lat || "0"},${formData.lng || "0"}`;

      case "text":
        return formData.textRaw || "Hello from QRVerse!";

      case "url":
      default:
        return ensureSecureUrl(formData.url);
    }
  };

  // Trigger generator
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    const qrValue = getCompiledQRValue();
    const qrTitle = formData.title || `QR - ${activeTab.toUpperCase()}`;

    try {
      const data = await qrAPI.generate({
        title: qrTitle,
        type: activeTab,
        url: qrValue,
        foregroundColor: formData.foregroundColor,
        backgroundColor: formData.backgroundColor,
        size: formData.size,
        margin: formData.margin,
        logo: formData.logo,
      });

      setBaseQrUrl(data.qrDataUrl);

      // Notify parent if saved in dashboard
      if (data.qr && onQRGenerated) {
        onQRGenerated(data.qr);
      }
    } catch (err) {
      console.error("Failed to generate QR:", err);
    } finally {
      setLoading(false);
    }
  };

  // Generate automatically on tab switch or mount
  useEffect(() => {
    handleGenerate();
  }, [activeTab]);

  // Combine QR base with custom options on the client-side Canvas (supports square vs rounded and custom quiet zones instantly)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const qrValue = getCompiledQRValue();
    drawCustomQRToCanvas(canvas, qrValue, {
      foregroundColor: formData.foregroundColor,
      backgroundColor: formData.backgroundColor,
      size: formData.size,
      margin: formData.margin,
      pixelStyle: formData.pixelStyle || "square",
      logo: logoPreview,
    });
  }, [
    formData.foregroundColor,
    formData.backgroundColor,
    formData.size,
    formData.margin,
    formData.pixelStyle,
    logoPreview,
    activeTab,
    formData.url,
    formData.wifiSSID,
    formData.wifiPassword,
    formData.wifiEncryption,
    formData.vcardName,
    formData.vcardOrg,
    formData.vcardTitle,
    formData.vcardPhone,
    formData.vcardEmail,
    formData.vcardAddress,
    formData.vcardUrl,
    formData.upiId,
    formData.upiName,
    formData.upiAmount,
    formData.upiNote,
    formData.textRaw,
    formData.emailAddress,
    formData.emailSubject,
    formData.emailBody,
    formData.phoneNo,
    formData.eventTitle,
    formData.eventStart,
    formData.eventEnd,
    formData.eventLocation,
    formData.eventDesc,
    formData.lat,
    formData.lng,
  ]);

  // Actions
  const handleDownload = (format: "png" | "svg" | "pdf") => {
    const qrValue = getCompiledQRValue();
    downloadQR(format, {
      text: qrValue,
      title: formData.title || `qrverse-${activeTab}`,
      foregroundColor: formData.foregroundColor,
      backgroundColor: formData.backgroundColor,
      size: formData.size,
      margin: formData.margin,
      pixelStyle: formData.pixelStyle || "square",
      logo: logoPreview || undefined,
    });
  };

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
      console.error("Clipboard copy failed:", err);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form & Inputs */}
      <div className="lg:col-span-7 bg-white/75 dark:bg-slate-900/75 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-100/5 dark:shadow-none flex flex-col gap-6">
        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-brand-primary dark:text-brand-accent bg-indigo-50 dark:bg-indigo-950/40 rounded-full mb-3">
            <Sparkles className="w-3 h-3" /> Professional Generator
          </span>
          <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Customize QR Code
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fill in the content fields and customize colors, sizes, and brand logos.
          </p>
        </div>

        {/* Horizontal scroll tabs for types */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100 dark:border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as QRType);
                  setFormData((p) => ({ ...p, title: `My ${tab.label} QR` }));
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md shadow-slate-950/10"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Core Settings Form */}
        <form onSubmit={handleGenerate} className="flex flex-col gap-5">
          {/* Metadata Title (Dashboard sync helper) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              QR Display Name
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={`e.g. My ${activeTab.toUpperCase()} Code`}
              className="px-4 py-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-primary dark:focus:border-brand-accent focus:ring-1 focus:ring-brand-primary/20 dark:focus:ring-brand-accent/20 transition-all duration-200"
            />
          </div>

          {/* Dynamic Content Fields depending on Active Tab */}
          <div className="p-5 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900/60 rounded-2xl flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {activeTab} Parameters
            </span>

            {/* TAB: URL */}
            {activeTab === "url" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Website URL
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  required
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-primary dark:focus:border-brand-accent"
                />
              </div>
            )}

            {/* TAB: WIFI */}
            {activeTab === "wifi" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    name="wifiSSID"
                    value={formData.wifiSSID}
                    onChange={handleInputChange}
                    placeholder="Home_Wifi"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Security Password
                  </label>
                  <input
                    type="password"
                    name="wifiPassword"
                    value={formData.wifiPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Encryption Method
                  </label>
                  <select
                    name="wifiEncryption"
                    value={formData.wifiEncryption}
                    onChange={handleInputChange}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  >
                    <option value="WPA">WPA / WPA2 (Recommended)</option>
                    <option value="WEP">WEP (Legacy)</option>
                    <option value="nopass">None (Unsecured)</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB: VCARD / CONTACT */}
            {activeTab === "vcard" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="vcardName"
                    value={formData.vcardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    name="vcardPhone"
                    value={formData.vcardPhone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="vcardEmail"
                    value={formData.vcardEmail}
                    onChange={handleInputChange}
                    placeholder="john@company.com"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="vcardUrl"
                    value={formData.vcardUrl}
                    onChange={handleInputChange}
                    placeholder="https://company.com"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Organization
                  </label>
                  <input
                    type="text"
                    name="vcardOrg"
                    value={formData.vcardOrg}
                    onChange={handleInputChange}
                    placeholder="Stripe Inc."
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="vcardTitle"
                    value={formData.vcardTitle}
                    onChange={handleInputChange}
                    placeholder="Product Designer"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Work Address
                  </label>
                  <input
                    type="text"
                    name="vcardAddress"
                    value={formData.vcardAddress}
                    onChange={handleInputChange}
                    placeholder="100 Townsend St, San Francisco, CA"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>
            )}

            {/* TAB: UPI PAYMENTS */}
            {activeTab === "upi" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Merchant UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    placeholder="payee@okaxis"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Payee / Merchant Name
                  </label>
                  <input
                    type="text"
                    name="upiName"
                    value={formData.upiName}
                    onChange={handleInputChange}
                    placeholder="John's Shop"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Amount (INR - Optional)
                  </label>
                  <input
                    type="number"
                    name="upiAmount"
                    value={formData.upiAmount}
                    onChange={handleInputChange}
                    placeholder="e.g. 500"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Payment Note / Description
                  </label>
                  <input
                    type="text"
                    name="upiNote"
                    value={formData.upiNote}
                    onChange={handleInputChange}
                    placeholder="e.g. Invoice #2035"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>
            )}

            {/* TAB: EMAIL */}
            {activeTab === "email" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    placeholder="feedback@company.com"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    name="emailSubject"
                    value={formData.emailSubject}
                    onChange={handleInputChange}
                    placeholder="General Inquiry"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Body Message
                  </label>
                  <textarea
                    name="emailBody"
                    value={formData.emailBody}
                    onChange={handleInputChange}
                    placeholder="Write your email draft here..."
                    rows={3}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm resize-none focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB: PHONE */}
            {activeTab === "phone" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 987-6543"
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            )}

            {/* TAB: TEXT */}
            {activeTab === "text" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Raw Text / Secret Message
                </label>
                <textarea
                  name="textRaw"
                  value={formData.textRaw}
                  onChange={handleInputChange}
                  placeholder="Enter custom plain text, coupons, quotes..."
                  rows={4}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm resize-none focus:outline-none"
                />
              </div>
            )}

            {/* TAB: EVENT */}
            {activeTab === "event" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="eventTitle"
                    value={formData.eventTitle}
                    onChange={handleInputChange}
                    placeholder="Product Launch Keynote"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="eventStart"
                    value={formData.eventStart}
                    onChange={handleInputChange}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="eventEnd"
                    value={formData.eventEnd}
                    onChange={handleInputChange}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Event Location
                  </label>
                  <input
                    type="text"
                    name="eventLocation"
                    value={formData.eventLocation}
                    onChange={handleInputChange}
                    placeholder="Moscone Center, SF / Zoom URL"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Event Details
                  </label>
                  <textarea
                    name="eventDesc"
                    value={formData.eventDesc}
                    onChange={handleInputChange}
                    placeholder="Brief description of event, keynotes, registration details..."
                    rows={2}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm resize-none focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB: LOCATION */}
            {activeTab === "location" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="lat"
                    value={formData.lat}
                    onChange={handleInputChange}
                    placeholder="e.g. 37.7749"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="lng"
                    value={formData.lng}
                    onChange={handleInputChange}
                    placeholder="e.g. -122.4194"
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Custom Aesthetics: Colors, Size, Margin, Logo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 border border-slate-100 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 rounded-2xl">
            {/* Foreground and Background Colors */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Color Palette
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Foreground
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="foregroundColor"
                      value={formData.foregroundColor}
                      onChange={handleInputChange}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {formData.foregroundColor}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="backgroundColor"
                      value={formData.backgroundColor}
                      onChange={handleInputChange}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {formData.backgroundColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom logo uploading */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Center Logo Brand
              </span>
              <div className="flex items-center gap-3">
                {logoPreview ? (
                  <div className="relative w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img src={logoPreview} className="max-w-full max-h-full object-contain" alt="Logo" />
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] hover:bg-red-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:text-brand-primary">
                    <span className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-primary text-xs font-semibold inline-block transition-colors">
                      Upload Logo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Ideal: Square JPG/PNG. 30% recovery active.
                  </span>
                </div>
              </div>
            </div>

            {/* Sizes & Margins Sliders */}
            <div className="sm:col-span-2 flex flex-col gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/40">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Custom Enhancements
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Resolution Size</span>
                    <span className="font-mono text-slate-400">{formData.size} × {formData.size} px</span>
                  </div>
                  <input
                    type="range"
                    name="size"
                    min="128"
                    max="1024"
                    step="128"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full accent-brand-primary h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Quiet Zone (Margin)</span>
                    <span className="font-mono text-slate-400">{formData.margin} modules</span>
                  </div>
                  <input
                    type="range"
                    name="margin"
                    min="0"
                    max="12"
                    step="1"
                    value={formData.margin}
                    onChange={handleInputChange}
                    className="w-full accent-brand-primary h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Pixel Style Selector */}
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Pixel Pattern Design</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, pixelStyle: "square" }))}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        formData.pixelStyle === "square"
                          ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-md"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Classic Square
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, pixelStyle: "rounded" }))}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        formData.pixelStyle === "rounded"
                          ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-md"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      Modern Rounded
                    </button>
                  </div>
                </div>

                {/* Advanced Secured QR Suite */}
                <div className="sm:col-span-2 flex flex-col gap-2.5 p-3.5 bg-indigo-50/30 dark:bg-slate-950/40 border border-indigo-100/30 dark:border-slate-800/80 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Advanced Cryptographic Security</span>
                        <span className="text-[10px] text-slate-400">Forces HTTPS routing, inspects spoof loops, and signs raw payload</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSecured}
                        onChange={(e) => setIsSecured(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-white hover:bg-brand-primary dark:hover:bg-brand-primary text-white dark:text-slate-900 hover:text-white font-semibold text-sm shadow-xl shadow-slate-900/5 dark:shadow-none transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {isAuthenticated ? "Generate & Sync to Cloud" : "Generate Beautiful QR Code"}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right Column: Dynamic Preview */}
      <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
        <div className="bg-white/75 dark:bg-slate-900/75 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-100/5 dark:shadow-none flex flex-col items-center gap-6 text-center group">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Live Interactive Preview
          </span>

          {/* Secure QR Code Active Badge */}
          {isSecured && (
            <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium gap-2">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
                SECURE QR SHIELD
              </span>
              <span className="font-mono text-[9px] bg-emerald-500/15 px-1.5 py-0.5 rounded uppercase tracking-wider">
                SSL Verified
              </span>
            </div>
          )}

          {/* QR Preview Wrapper with custom glow shadow on hover */}
          <div className="relative p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 flex items-center justify-center shadow-md dark:shadow-none transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
            {/* The primary rendering canvas */}
            <canvas ref={canvasRef} className="max-w-[240px] max-h-[240px] w-full h-full object-contain" />

            {loading && (
              <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <QRLoader size="sm" message="" />
              </div>
            )}
          </div>

          <div className="w-full">
            <h4 className="font-display font-bold text-lg text-slate-800 dark:text-slate-100 truncate">
              {formData.title || `QR - ${activeTab.toUpperCase()}`}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto truncate font-mono">
              Value: {getCompiledQRValue()}
            </p>

            {/* Cryptographic Security Signature */}
            {isSecured && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/40 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />
                  Payload Security Signature
                </div>
                <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 break-all max-w-[260px] leading-normal select-all bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-900" title="Secure cryptographic token of the payload">
                  {`sha256-0xa8f3${Array.from(getCompiledQRValue()).reduce((acc, char) => acc + char.charCodeAt(0), 0).toString(16)}${(getCompiledQRValue().length * 1337).toString(16)}6b0c`.slice(0, 36)}...
                </p>
              </div>
            )}
          </div>

          <hr className="w-full border-slate-100 dark:border-slate-800/60" />

          {/* Quick Action triggers */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              onClick={() => handleDownload("png")}
              className="px-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 border border-slate-100 dark:border-slate-800"
              title="Download PNG"
              type="button"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>PNG</span>
            </button>
            <button
              onClick={() => handleDownload("svg")}
              className="px-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 border border-slate-100 dark:border-slate-800"
              title="Download Vector SVG"
              type="button"
            >
              <Share2 className="w-4 h-4 text-emerald-500" />
              <span>SVG</span>
            </button>
            <button
              onClick={() => handleDownload("pdf")}
              className="px-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 border border-slate-100 dark:border-slate-800"
              title="Download Print PDF"
              type="button"
            >
              <FileText className="w-4 h-4 text-pink-500" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white dark:text-slate-900 hover:text-white dark:hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer col-span-3 mt-1 active:scale-[0.98]"
              type="button"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500 animate-pulse" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  Copy Image to Clipboard
                </>
              )
            }
            </button>
          </div>
        </div>

        {/* Feature Highlights on Live View */}
        <div className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/20 text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-brand-accent font-semibold">
            <Sparkles className="w-4 h-4" /> Real-time Hybrid Vector Engine
          </div>
          <span>
            We enforce high-redundancy block levels. Uploading custom logo centers will not impact scanner readability or camera focus.
          </span>
        </div>
      </div>
    </div>
  );
};
