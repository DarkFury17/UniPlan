import React from "react";
import { GraduationCap, RotateCcw, Sun, Moon } from "lucide-react";
import type { Theme } from "../hooks/useTheme";

interface HeaderProps {
  onLoadExample: () => void;
  onReset: () => void;
  isGenerating: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  currentStep: number;
  onSelectStep: (step: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  isGenerating,
  theme,
  onToggleTheme,
  currentStep,
  onSelectStep,
}) => {
  return (
    <header className="border-b border-stone-200/90 dark:border-stone-800 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              UniPlan
            </h1>
            <span className="bg-emerald-900 text-emerald-100 text-xs px-2.5 py-1 rounded font-medium border border-emerald-800 hidden sm:inline-flex items-center">
              Accademico
            </span>
          </div>
        </div>

        {/* Actions & Tools */}
        <div className="flex items-center space-x-2">
          {/* Quick Step Switcher */}
          <div className="hidden md:flex items-center rounded-lg bg-stone-100 dark:bg-stone-900 p-0.5 border border-stone-200 dark:border-stone-800 text-xs">
            <button
              onClick={() => onSelectStep(1)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                currentStep === 1
                  ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              1. Corso
            </button>
            <button
              onClick={() => onSelectStep(2)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                currentStep === 2
                  ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              2. Esami & Vincoli
            </button>
            <button
              onClick={() => onSelectStep(3)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                currentStep === 3
                  ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              3. Piano Finale
            </button>
          </div>

          <div className="h-4 w-[1px] bg-stone-200 dark:bg-stone-800 mx-1 hidden sm:block" />

          {/* Reset Button */}
          <button
            onClick={onReset}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer"
            title="Azzera piano di studi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reimposta</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 transition-colors cursor-pointer"
            title={theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"}
            aria-label="Cambia tema"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-stone-300" />
            ) : (
              <Moon className="w-4 h-4 text-stone-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
