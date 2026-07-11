"use client";

import { ArrowLeft, DatabaseZap, MoonStar, SunMedium, UserCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HeaderProps {
  onRestart: () => void;
  currentStep: string;
}

export function Header({ onRestart, currentStep }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-[#2a2d33] dark:bg-[#121417]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-300">
            <DatabaseZap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                CRM Extractor
              </h1>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:border-[#2a2d33] dark:bg-[#18181b] dark:text-slate-400">
                Beta
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered CRM Import</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentStep !== "upload" && (
            <button
              onClick={onRestart}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-[#2a2d33] dark:bg-[#18181b] dark:text-slate-300 dark:hover:border-[#3a3f46] dark:hover:bg-[#23262b]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-[#2a2d33] dark:bg-[#18181b] dark:text-slate-300 dark:hover:border-[#3a3f46] dark:hover:bg-[#23262b]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>

          <div className="ml-1 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#2a2d33] dark:bg-[#18181b]">
            <UserCircle2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden text-sm font-medium text-slate-600 dark:text-slate-300 sm:inline">
              Ops Team
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
