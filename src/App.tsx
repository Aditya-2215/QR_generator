import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { FloatingBackground } from "./components/FloatingBackground";
import { CustomCursor } from "./components/CustomCursor";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { QrCode, RefreshCw } from "lucide-react";

type ViewType = "landing" | "dashboard" | "login" | "register";

const MainAppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>("landing");

  // Custom route-guard view switcher
  const handleNavigate = (view: ViewType) => {
    if (view === "dashboard" && !isAuthenticated) {
      setCurrentView("login");
    } else {
      setCurrentView(view);
    }
  };

  // Modern SaaS Page Loader
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-[#0B0F19]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-xl animate-float">
            <QrCode className="w-8 h-8 animate-pulse" />
          </div>
          <RefreshCw className="w-20 h-20 text-indigo-500/30 dark:text-indigo-400/20 rounded-full border-2 border-dashed border-indigo-500 absolute animate-spin [animation-duration:10s]" />
        </div>
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
          Initializing QRVerse...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative selection:bg-indigo-500 selection:text-white">
      {/* Luxury Interactive Cursor */}
      <CustomCursor />

      {/* Sticky Top-level Navigation */}
      <Navbar onNavigate={handleNavigate} currentView={currentView} />

      {/* Floating Animated Backdrop Blurs */}
      <FloatingBackground />

      {/* Dynamic Screen Mounting with custom layout container */}
      <main className="w-full">
        {currentView === "landing" && (
          <LandingPage onNavigate={handleNavigate} isAuthenticated={isAuthenticated} />
        )}

        {currentView === "login" && (
          <LoginPage onNavigate={handleNavigate} />
        )}

        {currentView === "register" && (
          <RegisterPage onNavigate={handleNavigate} />
        )}

        {currentView === "dashboard" && (
          <DashboardPage onNavigate={handleNavigate} />
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
