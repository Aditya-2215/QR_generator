import React from "react";

interface QRLoaderProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export const QRLoader: React.FC<QRLoaderProps> = ({ size = "md", message = "Scanning & generating secure router..." }) => {
  const pixelSizes = {
    sm: "w-16 h-16",
    md: "w-28 h-28",
    lg: "w-40 h-40",
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className={`relative ${pixelSizes[size]} mb-4 animate-scan p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800`}>
        {/* Modern Vector stylized QR shape */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-indigo-600 dark:text-indigo-400"
          fill="currentColor"
        >
          {/* Top-Left Position Detection Pattern */}
          <path d="M 0 0 h 25 v 25 h -25 z M 5 5 v 15 h 15 v -15 z M 10 10 h 5 v 5 h -5 z" />
          
          {/* Top-Right Position Detection Pattern */}
          <path d="M 75 0 h 25 v 25 h -25 z M 80 5 v 15 h 15 v -15 z M 85 10 h 5 v 5 h -5 z" />
          
          {/* Bottom-Left Position Detection Pattern */}
          <path d="M 0 75 h 25 v 25 h -25 z M 5 80 v 15 h 15 v -15 z M 10 85 h 5 v 5 h -5 z" />
          
          {/* Bottom-Right Alignment pattern */}
          <path d="M 75 75 h 10 v 10 h -10 z M 85 85 h 10 v 10 h -10 z" className="animate-pulse" style={{ animationDelay: "200ms" }} />
          
          {/* Timing Patterns and Simulated Data Blocks */}
          <path d="M 30 5 h 5 v 5 h -5 z M 40 5 h 5 v 5 h -5 z M 50 5 h 5 v 5 h -5 z M 60 5 h 5 v 5 h -5 z" className="animate-pulse" />
          <path d="M 5 30 h 5 v 5 h -5 z M 5 40 h 5 v 5 h -5 z M 5 50 h 5 v 5 h -5 z M 5 60 h 5 v 5 h -5 z" className="animate-pulse" style={{ animationDelay: "150ms" }} />
          
          {/* Intermittent randomized matrix blocks with glowing pulses */}
          <path d="M 30 20 h 5 v 5 h -5 z M 45 20 h 10 v 5 h -10 z M 60 20 h 5 v 5 h -5 z" className="animate-pulse" style={{ animationDelay: "300ms" }} />
          <path d="M 30 35 h 10 v 5 h -10 z M 45 35 h 5 v 10 h -5 z M 60 30 h 10 v 5 h -10 z" className="animate-pulse" style={{ animationDelay: "450ms" }} />
          <path d="M 30 50 h 5 v 5 h -5 z M 40 45 h 15 v 5 h -15 z M 65 45 h 5 v 10 h -5 z" className="animate-pulse" style={{ animationDelay: "100ms" }} />
          <path d="M 30 65 h 10 v 5 h -10 z M 45 60 h 5 v 5 h -5 z M 55 60 h 15 v 5 h -15 z" className="animate-pulse" style={{ animationDelay: "250ms" }} />
          <path d="M 30 80 h 5 v 5 h -5 z M 40 75 h 10 v 5 h -10 z M 60 75 h 5 v 15 h -5 z" className="animate-pulse" style={{ animationDelay: "500ms" }} />
          <path d="M 35 90 h 15 v 5 h -15 z M 55 85 h 5 v 10 h -5 z" className="animate-pulse" style={{ animationDelay: "350ms" }} />
        </svg>

        {/* Ambient background scanner glow */}
        <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-2xl animate-pulse-slow pointer-events-none" />
      </div>
      
      {message && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide font-display animate-pulse">
            {message}
          </p>
          <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Optimizing vectors & encryption layers...
          </span>
        </div>
      )}
    </div>
  );
};
