import React from "react";
import { Calendar, GraduationCap, Clock, MapPin } from "lucide-react";
import type { ScheduledExamItem, StudySessionItem } from "../types";

interface TimelineCalendarProps {
  examSchedule: ScheduledExamItem[];
  studySessions: StudySessionItem[];
}

export const TimelineCalendar: React.FC<TimelineCalendarProps> = ({
  examSchedule,
  studySessions,
}) => {
  // Raggruppa tutte le attività (esami e studio) per giorno (YYYY-MM-DD)
  const activitiesByDate = new Map<
    string,
    {
      date: Date;
      exams: ScheduledExamItem[];
      sessions: StudySessionItem[];
      totalHours: number;
    }
  >();

  // 1. Aggiungi sessioni di studio
  for (const session of studySessions) {
    const d = new Date(session.data);
    const key = d.toISOString().slice(0, 10);
    const entry = activitiesByDate.get(key) || {
      date: d,
      exams: [],
      sessions: [],
      totalHours: 0,
    };
    entry.sessions.push(session);
    entry.totalHours += session.orePianificate;
    activitiesByDate.set(key, entry);
  }

  // 2. Aggiungi esami schedulati
  for (const exam of examSchedule) {
    const d = new Date(exam.examCall.dataOra);
    const key = d.toISOString().slice(0, 10);
    const entry = activitiesByDate.get(key) || {
      date: d,
      exams: [],
      sessions: [],
      totalHours: 0,
    };
    entry.exams.push(exam);
    activitiesByDate.set(key, entry);
  }

  // 3. Ordina giorni cronologicamente
  const sortedDays = Array.from(activitiesByDate.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const formatDayTitle = (date: Date) => {
    return date.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-0.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Cronoprogramma Giornaliero ({sortedDays.length} giorni)
        </span>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Appello d'Esame</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Sessione di Studio</span>
          </span>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
        {sortedDays.map((item) => {
          const hasExam = item.exams.length > 0;
          const hasStudy = item.sessions.length > 0;

          return (
            <div
              key={item.date.toISOString()}
              className={`p-3.5 rounded-xl border transition-all ${
                hasExam
                  ? "bg-amber-500/5 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-800/60 shadow-xs"
                  : "bg-slate-50/90 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      hasExam
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                    }`}
                  >
                    {hasExam ? (
                      <GraduationCap className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">
                    {formatDayTitle(item.date)}
                  </span>
                </div>

                {hasStudy && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                    {Math.round(item.totalHours * 10) / 10}h studio
                  </span>
                )}
              </div>

              {/* Eventi Esame */}
              {hasExam && (
                <div className="space-y-1.5 my-2">
                  {item.exams.map((exam) => (
                    <div
                      key={exam.examCall.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/70 text-slate-900 dark:text-slate-100 text-xs shadow-xs"
                    >
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px] tracking-wider uppercase font-mono shadow-2xs">
                          ESAME
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {exam.courseName}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          ({exam.examCall.tipoProva})
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 font-mono text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>
                            {new Date(exam.examCall.dataOra).toLocaleTimeString("it-IT", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </span>
                        {exam.examCall.aula && (
                          <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{exam.examCall.aula}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sessioni di studio */}
              {hasStudy && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                  {item.sessions.map((session, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-xs"
                    >
                      <span className="text-slate-800 dark:text-slate-200 truncate mr-2 font-medium">
                        📖 {session.courseName}
                      </span>
                      <span className="font-mono text-blue-700 dark:text-blue-300 font-bold shrink-0">
                        {session.orePianificate}h
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
