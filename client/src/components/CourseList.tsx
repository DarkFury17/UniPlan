import React, { useState } from "react";
import {
  BookOpen,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import type { Course, ExamCall, PrerequisiteEdge } from "../types";
import { AddCourseModal } from "./AddCourseModal";
import { AddExamCallModal } from "./AddExamCallModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface CourseListProps {
  courses: Course[];
  prerequisites: PrerequisiteEdge[];
  examCalls: ExamCall[];
  onAddCourse: (course: Course, prerequisiteIds: string[]) => void;
  onRemoveCourse: (courseId: string) => void;
  onAddExamCall: (call: ExamCall) => void;
  onRemoveExamCall: (callId: string) => void;
}

type DeleteTarget =
  | { type: "course"; course: Course }
  | { type: "examCall"; call: ExamCall; courseName: string }
  | null;

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  prerequisites,
  examCalls,
  onAddCourse,
  onRemoveCourse,
  onAddExamCall,
  onRemoveExamCall,
}) => {
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [activeCourseForCall, setActiveCourseForCall] = useState<Course | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const getPrerequisitesForCourse = (courseId: string) => {
    const prereqIds = prerequisites
      .filter((p) => p.courseId === courseId)
      .map((p) => p.prerequisiteCourseId);
    return courses.filter((c) => prereqIds.includes(c.id));
  };

  const getExamCallsForCourse = (courseId: string) => {
    return examCalls
      .filter((c) => c.courseId === courseId)
      .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDifficultyBadge = (diff: number) => {
    if (diff <= 2) {
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/50",
        barActive: "bg-emerald-500",
        barInactive: "bg-emerald-200 dark:bg-emerald-950",
      };
    }
    if (diff === 3) {
      return {
        bg: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/50",
        barActive: "bg-amber-500",
        barInactive: "bg-amber-200 dark:bg-amber-950",
      };
    }
    return {
      bg: "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/50",
      barActive: "bg-rose-500",
      barInactive: "bg-rose-200 dark:bg-rose-950",
    };
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "course") {
      onRemoveCourse(deleteTarget.course.id);
    } else if (deleteTarget.type === "examCall") {
      onRemoveExamCall(deleteTarget.call.id);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors duration-200 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Corsi & Appelli d'Esame ({courses.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gestisci esami, crediti formativi, propedeuticità e date d'appello disponibili
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddCourseOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Aggiungi Esame</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <BookOpen className="w-9 h-9 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nessun esame configurato</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Clicca su "Carica piano demo (Informatica)" in alto oppure aggiungi un esame manualmente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {courses.map((course) => {
            const coursePrereqs = getPrerequisitesForCourse(course.id);
            const calls = getExamCallsForCourse(course.id);
            const isExpanded = expandedCourseId === course.id;
            const diffStyle = getDifficultyBadge(course.difficoltaStimata);

            return (
              <div
                key={course.id}
                className="bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800/80 rounded-xl p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {course.codice && (
                        <span className="font-mono text-[11px] font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-300/80 dark:border-slate-700/50">
                          {course.codice}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {course.nome}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-y-1">
                      <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/80 dark:border-blue-900/50 text-[11px]">
                        {course.cfu} CFU
                      </span>
                      <span>Anno {course.annoCorso}, Sem. {course.semestre}</span>
                      <span>•</span>
                      {/* Color-coded difficulty badge */}
                      <div
                        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded border text-[11px] font-medium ${diffStyle.bg}`}
                        title={`Difficoltà stimata: ${course.difficoltaStimata}/5`}
                      >
                        <span>Difficoltà: {course.difficoltaStimata}/5</span>
                        <div className="flex space-x-0.5 ml-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-1 h-2 rounded-xs ${
                                i < course.difficoltaStimata
                                  ? diffStyle.barActive
                                  : diffStyle.barInactive
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget({ type: "course", course })}
                    className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Elimina esame"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Propedeuticità attive con freccia */}
                {coursePrereqs.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                      <ArrowRight className="w-3 h-3 text-indigo-500" />
                      <span>Richiede:</span>
                    </span>
                    {coursePrereqs.map((p) => (
                      <span
                        key={p.id}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-900/50 font-medium"
                      >
                        {p.nome}
                      </span>
                    ))}
                  </div>
                )}

                {/* Appelli disponibili */}
                <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{calls.length} {calls.length === 1 ? "Appello d'esame" : "Appelli d'esame"}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveCourseForCall(course)}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Aggiungi data</span>
                      </button>
                      {calls.length > 2 && (
                        <button
                          onClick={() =>
                            setExpandedCourseId(isExpanded ? null : course.id)
                          }
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {calls.length === 0 ? (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                      Nessun appello inserito (richiesto almeno 1 per la schedulazione)
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {(isExpanded ? calls : calls.slice(0, 2)).map((call) => (
                        <div
                          key={call.id}
                          className="flex items-center justify-between text-xs bg-amber-500/5 dark:bg-amber-950/20 px-2.5 py-1.5 rounded-lg border border-amber-200/80 dark:border-amber-900/40"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-semibold text-amber-800 dark:text-amber-300 text-xs">
                              {formatDate(call.dataOra)}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 font-medium">
                              {call.tipoProva}
                            </span>
                            {call.aula && (
                              <span className="text-slate-600 dark:text-slate-400 flex items-center space-x-1 text-[11px]">
                                <MapPin className="w-2.5 h-2.5 text-amber-600/70 dark:text-amber-400/70" />
                                <span>{call.aula}</span>
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: "examCall",
                                call,
                                courseName: course.nome,
                              })
                            }
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer"
                            title="Rimuovi data"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {!isExpanded && calls.length > 2 && (
                        <button
                          onClick={() => setExpandedCourseId(course.id)}
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline block text-center w-full pt-0.5 font-medium cursor-pointer"
                        >
                          Mostra altri {calls.length - 2} appelli...
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddCourseModal
        isOpen={isAddCourseOpen}
        onClose={() => setIsAddCourseOpen(false)}
        onAddCourse={onAddCourse}
        existingCourses={courses}
      />

      {activeCourseForCall && (
        <AddExamCallModal
          isOpen={true}
          onClose={() => setActiveCourseForCall(null)}
          courseId={activeCourseForCall.id}
          courseName={activeCourseForCall.nome}
          onAddCall={onAddExamCall}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={true}
          title={
            deleteTarget.type === "course"
              ? "Conferma eliminazione esame"
              : "Conferma eliminazione appello"
          }
          message={
            deleteTarget.type === "course"
              ? `Sei sicuro di voler eliminare l'esame "${deleteTarget.course.nome}" e tutti i relativi appelli d'esame? L'operazione non può essere annullata.`
              : `Sei sicuro di voler eliminare l'appello d'esame del ${formatDate(
                  deleteTarget.call.dataOra
                )} per il corso "${deleteTarget.courseName}"?`
          }
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
