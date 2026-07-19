import React, { useState } from "react";
import { QRGeneratorCard } from "../components/QRGeneratorCard";
import { QRCodeGenerator } from "../components/QRCodeGenerator";
import {
  Sparkles,
  QrCode,
  Zap,
  Shield,
  Download,
  BarChart3,
  Heart,
  History,
  Star,
  ChevronRight,
  Plus,
  Minus,
  Mail,
  Send,
  ArrowRight,
  Sliders,
  Check,
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (view: "landing" | "dashboard" | "login" | "register") => void;
  isAuthenticated: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, isAuthenticated }) => {
  const [generatorType, setGeneratorType] = useState<"quick" | "multi">("quick");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // FAQ Data
  const faqs = [
    {
      q: "What makes QRVerse codes different?",
      a: "QRVerse codes are generated using Error Correction Level H. This adds up to 30% structural damage redundancy, allowing you to embed company logos or symbols right in the center without preventing scanning devices from reading the data.",
    },
    {
      q: "Can I download vector formats?",
      a: "Yes! High-paying users can download QR codes in fully scalable formats. In the free version, you can export high-resolution PNGs and PDF-native print sheets.",
    },
    {
      q: "How does the 'sync' and dashboard history work?",
      a: "When you are logged in, every QR code you customize is synced into our cloud persistence layer. This saves your color palettes, custom logos, titles, and download stats, allowing you to reload and re-download them from any device.",
    },
    {
      q: "Is there a limit on scans?",
      a: "Absolutely not! All QR codes generated on QRVerse are static in nature, meaning they encode your target protocol directly. They have no scan limitations, never expire, and will work forever.",
    },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail("");
      }, 2000);
    }
  };

  const handleGetStartedClick = () => {
    if (isAuthenticated) {
      onNavigate("dashboard");
    } else {
      onNavigate("register");
    }
  };

  return (
    <div className="w-full pt-20">
      {/* 1. HERO SECTION & DEMO */}
      <section id="hero" className="relative py-16 lg:py-24 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider dark:bg-indigo-950/40 dark:border-indigo-900/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Production Ready SaaS
          </div>
          <h1 className="font-display font-extrabold text-[44px] sm:text-[64px] lg:text-[72px] leading-[1.05] tracking-tight text-slate-900 dark:text-white max-w-4xl">
            Generate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Beautiful</span> <br />
            QR Codes Instantly
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Create customizable QR codes for websites, WiFi, payments, and events with real-time analytics and enterprise-grade security.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <button
              onClick={() => {
                const element = document.getElementById("demo");
                if (element) element.scrollIntoView({ behavior: "smooth" });
              }}
              className="group flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg shadow-2xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              Generate Your QR
              <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
            </button>
            <button
              onClick={handleGetStartedClick}
              className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Live Interactive Generator Embedded Container */}
        <div id="demo" className="max-w-5xl mx-auto py-4">
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => setGeneratorType("quick")}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-2 border ${
                generatorType === "quick"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              🚀 Secure URL Mode
            </button>
            <button
              onClick={() => setGeneratorType("multi")}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-2 border ${
                generatorType === "multi"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              ⚡ Multi-Format Pro Engine
            </button>
          </div>

          <div className="p-1.5 rounded-4xl bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 shadow-inner">
            <div className="p-4 sm:p-8 rounded-[32px] bg-slate-50/60 dark:bg-slate-900/30 backdrop-blur-xl">
              {generatorType === "quick" ? (
                <QRCodeGenerator isAuthenticated={isAuthenticated} />
              ) : (
                <QRGeneratorCard isAuthenticated={isAuthenticated} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATISTICS SECTION */}
      <section className="py-12 border-y border-slate-100 dark:border-slate-900/60 bg-slate-50/30 dark:bg-slate-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col gap-1">
              <span className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white">
                50K+
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Generated QRs
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white">
                10K+
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Active Creators
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white">
                70K+
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                File Exports
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white flex items-center justify-center gap-1">
                4.9 <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                User Rating
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES MODULE */}
      <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="px-3 py-1 text-[10px] font-bold text-brand-primary dark:text-brand-accent bg-indigo-50 dark:bg-indigo-950/40 rounded-full uppercase tracking-wider">
              Rich Features
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 dark:text-white">
              Fully Custom Brand Controls
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl">
              QR codes don't have to be boring black and white grids. Stylize your brand perfectly with advanced SaaS tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-4 hover:border-brand-primary dark:hover:border-brand-accent transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-brand-primary dark:text-brand-accent">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Custom Colors</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Select precise HEX colors for both background and foreground pixels. Set clean transparent gradients easily.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-4 hover:border-brand-primary dark:hover:border-brand-accent transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950 flex items-center justify-center text-pink-500">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Logo Integration</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Upload business logos or vector symbols to overlay them right in the center. Built-in boundary pads prevent scans from clipping.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-4 hover:border-brand-primary dark:hover:border-brand-accent transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950 flex items-center justify-center text-green-500">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">High-Quality Export</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Export files in standard high-res PNG formats, or trigger custom PDF sheets perfect for restaurant menus or banners.
              </p>
            </div>

            {/* Card 4 */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-4 hover:border-brand-primary dark:hover:border-brand-accent transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-500">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Dynamic Routing</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Support smart WiFi triggers, vCards, payments, geo coordinates, and calendars that configure user smartphones with one scan.
              </p>
            </div>

            {/* Card 5 */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-4 hover:border-brand-primary dark:hover:border-brand-accent transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-500">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Cloud History & Sync</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Create a secure account to save your generated history, track export counts, and download previous designs at any time.
              </p>
            </div>

            {/* Card 6 */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-4 hover:border-brand-primary dark:hover:border-brand-accent transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-500">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">Secure Redundancy</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                All QR parameters are fully computed locally or proxied through secure server APIs. We collect no tracking hashes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS TIMELINE */}
      <section className="py-20 lg:py-28 bg-slate-50/50 dark:bg-slate-950/20 border-y border-slate-100 dark:border-slate-900/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="px-3 py-1 text-[10px] font-bold text-brand-primary dark:text-brand-accent bg-indigo-50 dark:bg-indigo-950/40 rounded-full uppercase tracking-wider">
              Simple Flow
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 dark:text-white">
              Create in Four Simple Steps
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Our streamlined Apple-inspired interface lets you craft custom codes in seconds.
            </p>
          </div>

          <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 sm:pl-10 flex flex-col gap-12 max-w-2xl mx-auto">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -left-[39px] sm:-left-[55px] w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold shadow-lg">
                1
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Enter target data
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select your category (Website, WiFi, Contact, or UPI) and paste your URL or details.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -left-[39px] sm:-left-[55px] w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold shadow-lg">
                2
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Stylize aesthetics
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Customize colors with our fluid HEX color pickers. Adjust parameters such as resolution size and block margins.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -left-[39px] sm:-left-[55px] w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold shadow-lg">
                3
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Integrate company branding
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Upload your brand logo (JPG, PNG, WebP) to merge it inside the center with high error-correction protection.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="absolute -left-[39px] sm:-left-[55px] w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold shadow-lg">
                4
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Export high-res
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Download a transparent PNG or print a vector PDF layout immediately. Log in to sync it onto your persistent cloud.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="px-3 py-1 text-[10px] font-bold text-brand-primary dark:text-brand-accent bg-indigo-50 dark:bg-indigo-950/40 rounded-full uppercase tracking-wider">
              Loved Globally
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 dark:text-white">
              SaaS Owners & Designers Choose QRVerse
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-6 relative">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                "QRVerse allowed us to print customized WiFi credentials cards for all our physical coworking hubs. The high-contrast dark theme presets fit our design language perfectly."
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                  SH
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">Sarah Jenkins</h4>
                  <span className="text-xs text-slate-400">Hub Ops Director, Cowork</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-6 relative">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                "The UPI payments deep-link codes are extremely useful for our offline shop checkouts. Generating and printing direct high-resolution PDFs has saved us hundreds in printing bills."
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                  RK
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">Rohan Kapoor</h4>
                  <span className="text-xs text-slate-400">Founder, Kapoor Grocers</span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-6 relative">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                "Being able to upload our SVG logo and have it clean-clipped inside the QR blocks is a lifesaver. The 30% correction redundancy ensures the codes scan immediately on iPhone and Android."
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                  MC
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">Marcus Chen</h4>
                  <span className="text-xs text-slate-400">Lead Brand Designer, Linear Flow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING MODULE */}
      <section id="pricing" className="py-20 lg:py-28 bg-slate-50/50 dark:bg-slate-950/20 border-y border-slate-100 dark:border-slate-900/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="px-3 py-1 text-[10px] font-bold text-brand-primary dark:text-brand-accent bg-indigo-50 dark:bg-indigo-950/40 rounded-full uppercase tracking-wider">
              Flexible Plans
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 dark:text-white">
              Transparent, Premium SaaS Pricing
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              No hidden fees. Create static scan-limit-free codes forever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Card 1: Free */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-6 relative">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Starter</span>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Free</h3>
                <span className="text-slate-500 mt-2 text-xs">For casual users who need immediate custom designs.</span>
              </div>
              <div className="flex items-baseline gap-1 py-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Static QR code generation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Custom color palettes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Center logo uploading
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> High-resolution PNG
                </li>
              </ul>
              <button
                onClick={handleGetStartedClick}
                className="w-full mt-auto py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer text-center"
              >
                Get Started
              </button>
            </div>

            {/* Card 2: Pro */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-6 relative border-brand-primary dark:border-brand-accent shadow-xl shadow-indigo-500/5">
              <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-brand-primary text-white text-[9px] font-bold uppercase tracking-wider">
                Most Popular
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-brand-primary dark:text-brand-accent uppercase">Professional</span>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Creators Pro</h3>
                <span className="text-slate-500 mt-2 text-xs">For agencies, designers, and scaling small businesses.</span>
              </div>
              <div className="flex items-baseline gap-1 py-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">$12</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Everything in Free plan
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Persistent Cloud Dashboard
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Cloud library syncing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Traceable download stats
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> PDF vector outputs
                </li>
              </ul>
              <button
                onClick={handleGetStartedClick}
                className="w-full mt-auto py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-semibold text-xs shadow-md shadow-indigo-500/10 cursor-pointer text-center"
              >
                Go Pro (Cloud Save)
              </button>
            </div>

            {/* Card 3: Enterprise */}
            <div className="glass p-8 rounded-3xl flex flex-col gap-6 relative">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Scale</span>
                <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Business</h3>
                <span className="text-slate-500 mt-2 text-xs">For retail networks, event coordinators, and enterprise franchises.</span>
              </div>
              <div className="flex items-baseline gap-1 py-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">$39</span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <hr className="border-slate-100 dark:border-slate-800" />
              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Everything in Pro plan
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Unlimited dynamic scans
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Custom branding domains
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> Dedicated API access key
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" /> 24/7 SLA Support SLA
                </li>
              </ul>
              <button
                onClick={handleGetStartedClick}
                className="w-full mt-auto py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-primary dark:hover:bg-brand-primary hover:text-white dark:hover:text-white font-semibold text-xs transition-colors cursor-pointer text-center"
              >
                Deploy Business
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ MODULE WITH ACCORDION STATES */}
      <section id="faq" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="px-3 py-1 text-[10px] font-bold text-brand-primary dark:text-brand-accent bg-indigo-50 dark:bg-indigo-950/40 rounded-full uppercase tracking-wider">
              Answering Questions
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div
                  key={i}
                  className="glass rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40 transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between font-sans font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 hover:text-brand-primary dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100/60 dark:border-slate-800/40 pt-4 animate-fade-in leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. LUXURY MULTI-COLUMN FOOTER & NEWSLETTER */}
      <footer className="border-t border-slate-100 dark:border-slate-900 bg-white/50 dark:bg-slate-950/20 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-md">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                QR<span className="text-brand-accent">Verse</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Generating gorgeous, static, redundancy-safe QR codes for top-tier companies, retail brands, and independent designers globally.
            </p>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
              <span>© 2026 QRVerse Inc.</span>
              <span>•</span>
              <span>All rights reserved.</span>
            </div>
          </div>

          {/* Links Cols */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product</h4>
              <button
                onClick={() => handleGetStartedClick()}
                className="text-left text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-brand-primary"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById("demo");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-left text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-brand-primary"
              >
                Custom Generator
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById("pricing");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-left text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-brand-primary"
              >
                Premium Pricing
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Legal</h4>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-brand-primary">
                Privacy Policy
              </span>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-brand-primary">
                Terms of Service
              </span>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-brand-primary">
                Security Controls
              </span>
            </div>
          </div>

          {/* Newsletter Col */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Join our newsletter</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Get modern design inspiration, security briefs, and SaaS product updates directly to your inbox.
            </p>
            {newsletterSubscribed ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 text-emerald-600 dark:text-emerald-400 font-semibold text-xs text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Thank you! You've subscribed successfully.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-brand-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-brand-primary dark:hover:bg-brand-primary hover:text-white font-semibold text-xs flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
