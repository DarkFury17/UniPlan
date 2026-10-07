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
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-0.5">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          Cronoprogramma Giornaliero ({sortedDays.length} giorni totali)
        </span>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-400/30" />
            <span className="text-stone-800 dark:text-stone-200 font-bold">Appello d'Esame</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
            <span className="text-stone-600 dark:text-stone-400 font-medium">Sessione di Studio</span>
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
        {sortedDays.map((item) => {
          const hasExam = item.exams.length > 0;
          const hasStudy = item.sessions.length > 0;

          return (
            <div
              key={item.date.toISOString()}
              className={`p-4 rounded-xl border transition-all ${
                hasExam
                  ? "bg-amber-50/60 dark:bg-amber-950/20 border-2 border-amber-400 dark:border-amber-700/80 shadow-xs"
                  : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      hasExam
                        ? "bg-amber-600 text-white shadow-2xs"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                    }`}
                  >
                    {hasExam ? (
                      <GraduationCap className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 capitalize">
                    {formatDayTitle(item.date)}
                  </span>
                </div>

                {hasStudy && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {Math.round(item.totalHours * 10) / 10}h studio
                  </span>
                )}
              </div>

              {/* Eventi Esame in Evidenza Ambra */}
              {hasExam && (
                <div className="space-y-2 my-2.5">
                  {item.exams.map((exam) => (
                    <div
                      key={exam.examCall.id}
                      className="flex items-center justify-between p-3.5 rounded-lg bg-amber-100/70 text-amber-950 border-2 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800 text-xs shadow-2xs"
                    >
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                        <span className="px-2 py-0.5 rounded bg-amber-800 text-white font-bold text-[10px] tracking-wider uppercase font-mono shadow-2xs">
                          PROVA D'ESAME
                        </span>
                        <span className="font-extrabold text-stone-900 dark:text-white text-sm">
                          {exam.courseName}
                        </span>
                        <span className="text-amber-900 dark:text-amber-300 font-semibold text-[11px]">
                          ({exam.examCall.tipoProva})
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 font-mono text-xs text-amber-950 dark:text-amber-200 font-bold">
                        <span className="flex items-center space-x-1.5 bg-white/80 dark:bg-stone-900/80 px-2 py-1 rounded border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                          <span>
                            {new Date(exam.examCall.dataOra).toLocaleTimeString("it-IT", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </span>
                        {exam.examCall.aula && (
                          <span className="flex items-center space-x-1 text-stone-700 dark:text-stone-300 font-sans">
                            <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                            <span>{exam.examCall.aula}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sessioni di studio: Salvia desaturato con border-l-4 smeraldo */}
              {hasStudy && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {item.sessions.map((session, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 border-l-4 border-l-emerald-600 dark:border-l-emerald-500 text-xs shadow-2xs"
                    >
                      <span className="text-stone-900 dark:text-stone-100 truncate mr-2 font-semibold">
                        {session.courseName}
                      </span>
                      <span className="font-mono text-emerald-900 dark:text-emerald-300 font-bold shrink-0 bg-white dark:bg-stone-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
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
