import React from "react";
import { Clock, ShieldCheck, Calendar, SlidersHorizontal, Minus, Plus } from "lucide-react";
import type { SchedulingConstraints } from "../types";

interface ConstraintsPanelProps {
  constraints: SchedulingConstraints;
  onChange: (constraints: SchedulingConstraints) => void;
}

export const ConstraintsPanel: React.FC<ConstraintsPanelProps> = ({ constraints, onChange }) => {
  const updateDailyHours = (delta: number) => {
    const nextVal = Math.min(12, Math.max(2, constraints.oreStudioGiornaliereMax + delta));
    onChange({ ...constraints, oreStudioGiornaliereMax: nextVal });
  };

  const updateBufferDays = (delta: number) => {
    const nextVal = Math.min(10, Math.max(0, constraints.giorniBufferMinimi + delta));
    onChange({ ...constraints, giorniBufferMinimi: nextVal });
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-lg space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-2xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100 uppercase">
              Parametri di Studio & Vincoli Sessione
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Imposta il ritmo di preparazione e i tempi di riposo tra gli esami consecutivi
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Ore massime giornaliere */}
        <div className="bg-white dark:bg-stone-950 p-4 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-xs font-bold text-stone-900 dark:text-stone-200">
              <Clock className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span>Ore Max / Giorno</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-xs font-bold border border-stone-200 dark:border-stone-700">
              {constraints.oreStudioGiornaliereMax} h
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => updateDailyHours(-0.5)}
              disabled={constraints.oreStudioGiornaliereMax <= 2}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-30 transition-colors cursor-pointer font-bold shrink-0"
              title="Riduci ore"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={2}
              max={12}
              step={0.5}
              value={constraints.oreStudioGiornaliereMax}
              onChange={(e) =>
                onChange({
                  ...constraints,
                  oreStudioGiornaliereMax: parseFloat(e.target.value),
                })
              }
              className="w-full accent-emerald-800 dark:accent-emerald-600 cursor-pointer h-2 bg-stone-200 dark:bg-stone-700 rounded-lg"
            />
            <button
              type="button"
              onClick={() => updateDailyHours(0.5)}
              disabled={constraints.oreStudioGiornaliereMax >= 12}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-30 transition-colors cursor-pointer font-bold shrink-0"
              title="Aumenta ore"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            Tetto massimo di ore studio giornaliere raccomandato (2h - 12h).
          </p>
        </div>

        {/* 2. Buffer minimo tra esami */}
        <div className="bg-white dark:bg-stone-950 p-4 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-xs font-bold text-stone-900 dark:text-stone-200">
              <ShieldCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span>Buffer Minimo</span>
            </span>
            <span className="px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-xs font-bold border border-stone-200 dark:border-stone-700">
              {constraints.giorniBufferMinimi} {constraints.giorniBufferMinimi === 1 ? "giorno" : "giorni"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => updateBufferDays(-1)}
              disabled={constraints.giorniBufferMinimi <= 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-30 transition-colors cursor-pointer font-bold shrink-0"
              title="Riduci buffer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={constraints.giorniBufferMinimi}
              onChange={(e) =>
                onChange({
                  ...constraints,
                  giorniBufferMinimi: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-emerald-800 dark:accent-emerald-600 cursor-pointer h-2 bg-stone-200 dark:bg-stone-700 rounded-lg"
            />
            <button
              type="button"
              onClick={() => updateBufferDays(1)}
              disabled={constraints.giorniBufferMinimi >= 10}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-30 transition-colors cursor-pointer font-bold shrink-0"
              title="Aumenta buffer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            Giorni obbligatori di intervallo tra due prove consecutive.
          </p>
        </div>

        {/* 3. Data inizio preparazione */}
        <div className="bg-white dark:bg-stone-950 p-4 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-xs font-bold text-stone-900 dark:text-stone-200">
              <Calendar className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span>Inizio Studio</span>
            </span>
            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
              Data limite
            </span>
          </div>

          <input
            type="date"
            value={constraints.dataInizioPianificazione.slice(0, 10)}
            onChange={(e) =>
              onChange({
                ...constraints,
                dataInizioPianificazione: e.target.value,
              })
            }
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 focus:border-emerald-800 font-mono font-semibold"
          />

          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            Giorno di partenza a ritroso per il carico di studio.
          </p>
        </div>
      </div>
    </div>
  );
};
