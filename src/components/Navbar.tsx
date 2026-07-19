import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { QrCode, Sun, Moon, Menu, X, User as UserIcon, LayoutDashboard, LogOut } from "lucide-react";

interface NavbarProps {
  onNavigate: (view: "landing" | "dashboard" | "login" | "register") => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scrolling to add subtle shadows & extra blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize and handle dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const navLinks = [
    { label: "Home", target: "landing", sectionId: "hero" },
    { label: "Features", target: "landing", sectionId: "features" },
    { label: "Pricing", target: "landing", sectionId: "pricing" },
    { label: "FAQ", target: "landing", sectionId: "faq" },
  ];

  const handleLinkClick = (target: "landing" | "dashboard", sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(target);
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "py-3 bg-white/75 dark:bg-slate-900/75 shadow-lg shadow-slate-100/10 dark:shadow-none border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md"
          : "py-5 bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => handleLinkClick("landing", "hero")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-transform duration-300 group-hover:scale-105">
              <QrCode className="w-5.5 h-5.5" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
              QRVerse
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick("landing", link.sectionId)}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 cursor-pointer relative py-1"
              >
                {link.label}
              </button>
            ))}

            {isAuthenticated && (
              <button
                onClick={() => handleLinkClick("dashboard")}
                className={`text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 cursor-pointer relative py-1 ${
                  currentView === "dashboard" ? "text-indigo-600 dark:text-indigo-400 font-semibold" : ""
                }`}
              >
                Dashboard
              </button>
            )}
          </nav>

          {/* Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/40 dark:border-slate-800 transition-colors duration-200 cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30">
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-indigo-200 truncate max-w-[120px]">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={() => handleLinkClick("dashboard")}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[14px] font-semibold shadow-xl shadow-indigo-200/50 dark:shadow-none active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Console
                </button>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent transition-colors duration-200 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate("login")}
                  className="px-5 py-2.5 text-[14px] font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-[14px] font-semibold shadow-xl shadow-indigo-200/50 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-6 shadow-xl flex flex-col gap-4 animate-slide-down">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleLinkClick("landing", link.sectionId)}
              className="text-left font-sans font-medium text-base text-slate-700 dark:text-slate-200 py-2 hover:text-brand-primary"
            >
              {link.label}
            </button>
          ))}

          {isAuthenticated && (
            <button
              onClick={() => handleLinkClick("dashboard")}
              className="text-left font-sans font-medium text-base text-slate-700 dark:text-slate-200 py-2 hover:text-brand-primary"
            >
              Dashboard
            </button>
          )}

          <hr className="border-slate-100 dark:border-slate-800 my-1" />

          {isAuthenticated ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 py-1">
                <UserIcon className="w-4 h-4 text-brand-primary" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={() => handleLinkClick("dashboard")}
                className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-semibold text-sm"
              >
                Dashboard Console
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-center py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate("login");
                }}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate("register");
                }}
                className="w-full text-center py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
