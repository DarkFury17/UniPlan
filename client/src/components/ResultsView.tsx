import React from "react";
import {
  Download,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
} from "lucide-react";
import type { PlanResponse } from "../types";
import { TimelineCalendar } from "./TimelineCalendar";

interface ResultsViewProps {
  planResponse: PlanResponse;
  onExportIcs: () => void;
  isExporting: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  planResponse,
  onExportIcs,
  isExporting,
}) => {
  const { plan, metrics } = planResponse;

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors duration-200 space-y-5 animate-in fade-in duration-200">
      {/* Header & Export button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Piano di Studio Ottimizzato
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Risolto</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Soluzione CSP coerente con la sequenza di propedeuticità e limiti giornalieri
            </p>
          </div>
        </div>

        <button
          onClick={onExportIcs}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? "Esportazione in corso..." : "Scarica file iCal (.ics)"}</span>
        </button>
      </div>

      {/* KPI Cards: 4 Box Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Esami schedulati */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 space-y-1.5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Appelli Schedulati</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
            {metrics.totalExamDays} <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400">/ {metrics.totalCourses} corsi</span>
          </p>
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Tutti i vincoli rispettati</p>
        </div>

        {/* Ore totali studio */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 space-y-1.5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Monte Ore Totale</span>
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
            {metrics.totalStudyHours} <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400">ore</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Formula (CFU × Difficoltà)
          </p>
        </div>

        {/* Giorni di studio */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 space-y-1.5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Giorni Impegnati</span>
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
            {metrics.totalStudyDays} <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400">giorni</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sessioni backwards
          </p>
        </div>

        {/* Costo Obiettivo */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3.5 space-y-1.5 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">Costo Soluzione</span>
            <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
            {metrics.totalCost}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Ottimo globale calcolato
          </p>
        </div>
      </div>

      {/* Visual Timeline */}
      <TimelineCalendar
        examSchedule={plan.examSchedule}
        studySessions={plan.studySessions}
      />
    </div>
  );
};
