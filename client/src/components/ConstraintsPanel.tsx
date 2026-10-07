import React from "react";
import { Clock, ShieldAlert, Calendar, Sliders, Minus, Plus } from "lucide-react";
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
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors duration-200 space-y-4">
      <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Parametri & Vincoli di Scheduling
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Regola i parametri del motore CSP e la distribuzione a ritroso delle sessioni di studio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. Ore massime giornaliere */}
        <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Ore Max / Giorno</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => updateDailyHours(-0.5)}
                disabled={constraints.oreStudioGiornaliereMax <= 2}
                className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Riduci ore"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="min-w-[4.5rem] text-center px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-mono text-xs font-semibold border border-blue-200/80 dark:border-blue-900/50">
                {constraints.oreStudioGiornaliereMax} h/gg
              </span>
              <button
                type="button"
                onClick={() => updateDailyHours(0.5)}
                disabled={constraints.oreStudioGiornaliereMax >= 12}
                className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Aumenta ore"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
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
            className="w-full accent-blue-600 dark:accent-blue-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Tetto massimo giornaliero per bilanciare il carico cognitivo.
          </p>
        </div>

        {/* 2. Buffer minimo tra esami */}
        <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Buffer tra Esami</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => updateBufferDays(-1)}
                disabled={constraints.giorniBufferMinimi <= 0}
                className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Riduci giorni buffer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="min-w-[4.5rem] text-center px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-semibold border border-emerald-200/80 dark:border-emerald-900/50">
                {constraints.giorniBufferMinimi} {constraints.giorniBufferMinimi === 1 ? "giorno" : "giorni"}
              </span>
              <button
                type="button"
                onClick={() => updateBufferDays(1)}
                disabled={constraints.giorniBufferMinimi >= 10}
                className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Aumenta giorni buffer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
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
            className="w-full accent-emerald-600 dark:accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Intervallo minimo obbligatorio di riposo/ripasso tra due prove consecutive.
          </p>
        </div>

        {/* 3. Data inizio preparazione */}
        <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Inizio Preparazione</span>
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
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Data limite iniziale entro cui allocare le sessioni di studio.
          </p>
        </div>
      </div>
    </div>
  );
};
