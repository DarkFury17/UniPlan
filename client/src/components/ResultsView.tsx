import React, { useState } from "react";
import {
  Download,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ListOrdered,
  CalendarDays,
  FileSpreadsheet,
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
  const [activeView, setActiveView] = useState<"timeline" | "exams" | "table">("timeline");

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 sm:p-6 shadow-xs transition-colors duration-200 space-y-5 animate-in fade-in duration-200">
      {/* Header & Export button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-white dark:text-stone-900 shadow-xs">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Piano di Studio Calcolato
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Piano Valido</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Sequenza di studio ottimizzata nel rispetto delle propedeuticità e del buffer tra le prove
            </p>
          </div>
        </div>

        <button
          onClick={onExportIcs}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 text-xs font-bold shadow-sm transition-all disabled:opacity-40 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>{isExporting ? "Generazione iCalendar..." : "Esporta su Calendario (.ics)"}</span>
        </button>
      </div>

      {/* 4 Stat Card in Evidenza: Totale Ore Studio, Media Giornaliera, Esami Schedulati, Finestra Temporale */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Totale Ore Studio */}
        <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Totale Ore Studio</span>
            <Clock className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900 dark:text-stone-100 tracking-tight">
              {metrics.totalStudyHours} <span className="text-sm font-sans font-semibold text-stone-500 dark:text-stone-400">ore</span>
            </p>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">CFU × Difficoltà</p>
        </div>

        {/* 2. Media Giornaliera */}
        <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Media Giornaliera</span>
            <Layers className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900 dark:text-stone-100 tracking-tight">
              {(metrics.totalStudyDays > 0 ? (metrics.totalStudyHours / metrics.totalStudyDays).toFixed(1) : 0)} <span className="text-sm font-sans font-semibold text-stone-500 dark:text-stone-400">h/gg</span>
            </p>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Su {metrics.totalStudyDays} giorni effettivi</p>
        </div>

        {/* 3. Esami Schedulati */}
        <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Esami Schedulati</span>
            <CalendarCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900 dark:text-stone-100 tracking-tight">
              {metrics.totalExamDays} <span className="text-sm font-sans font-semibold text-stone-500 dark:text-stone-400">/ {metrics.totalCourses}</span>
            </p>
          </div>
          <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">100% appelli allocati</p>
        </div>

        {/* 4. Finestra Temporale */}
        <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Finestra Temporale</span>
            <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-bold font-mono text-stone-900 dark:text-stone-100 tracking-tight">
              {new Date(metrics.startDate).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
              {" → "}
              {metrics.lastExamDate ? new Date(metrics.lastExamDate).toLocaleDateString("it-IT", { day: "2-digit", month: "short" }) : "Fine"}
            </p>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Sessione estiva</p>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between pt-2 border-b border-stone-100 dark:border-stone-800 pb-2">
        <div className="flex items-center space-x-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 p-1 border border-stone-200 dark:border-stone-700/60 text-xs">
          <button
            onClick={() => setActiveView("timeline")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeView === "timeline"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Timeline Cronologica</span>
          </button>

          <button
            onClick={() => setActiveView("exams")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeView === "exams"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Ordine Appelli ({plan.examSchedule.length})</span>
          </button>

          <button
            onClick={() => setActiveView("table")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeView === "table"
                ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tabella Sessioni</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Timeline Calendar */}
      {activeView === "timeline" && (
        <TimelineCalendar
          examSchedule={plan.examSchedule}
          studySessions={plan.studySessions}
        />
      )}

      {/* Tab 2: Sequenza Esami Selezionati */}
      {activeView === "exams" && (
        <div className="space-y-3 pt-2">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Combinazione ottimale di date d'esame individuata dall'algoritmo di backtracking:
          </p>
          <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900">
            {plan.examSchedule.map((item, idx) => {
              const examDate = new Date(item.examCall.dataOra);
              return (
                <div
                  key={item.examCall.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                        {item.courseName}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                        Modalità: {item.examCall.tipoProva} {item.examCall.aula ? `• Aula: ${item.examCall.aula}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono text-xs">
                    <div className="font-semibold text-stone-900 dark:text-stone-100">
                      {examDate.toLocaleDateString("it-IT", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-stone-500 dark:text-stone-400 text-[11px]">
                      Ore {examDate.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Tabella Dettagliata Sessioni di Studio */}
      {activeView === "table" && (
        <div className="space-y-3 pt-2">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Riepilogo analitico delle sessioni giornaliere calcolate:
          </p>
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900">
            <div className="overflow-x-auto max-h-[460px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-700/60 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Insegnamento</th>
                    <th className="py-2.5 px-3 text-right">Ore Studio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                  {plan.studySessions.map((session, sIdx) => {
                    const sessionDate = new Date(session.data);
                    return (
                      <tr key={sIdx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                        <td className="py-2 px-3 text-stone-700 dark:text-stone-300 font-medium">
                          {sessionDate.toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2 px-3 font-sans text-stone-900 dark:text-stone-100 font-semibold">
                          {session.courseName}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-stone-900 dark:text-stone-100">
                          {session.orePianificate}h
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
