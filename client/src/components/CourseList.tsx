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



  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "course") {
      onRemoveCourse(deleteTarget.course.id);
    } else if (deleteTarget.type === "examCall") {
      onRemoveExamCall(deleteTarget.call.id);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 sm:p-5 shadow-xs transition-colors duration-200 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Insegnamenti & Appelli d'Esame ({courses.length})
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Gestisci esami, crediti formativi, propedeuticità e date d'appello disponibili
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddCourseOpen(true)}
          className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Aggiungi Insegnamento</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 px-4 bg-stone-50 dark:bg-stone-950/40 rounded-xl border border-dashed border-stone-300 dark:border-stone-800">
          <BookOpen className="w-8 h-8 text-stone-400 dark:text-stone-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">Nessun insegnamento configurato</p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-md mx-auto">
            Seleziona un corso di laurea dal Passo 1 oppure aggiungi manualmente i tuoi esami universitari.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {courses.map((course) => {
            const coursePrereqs = getPrerequisitesForCourse(course.id);
            const calls = getExamCallsForCourse(course.id);
            const isExpanded = expandedCourseId === course.id;
            return (
              <div
                key={course.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 sm:p-5 transition-all hover:border-stone-300 dark:hover:border-stone-700 space-y-3.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {course.codice && (
                        <span className="font-mono text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                          {course.codice}
                        </span>
                      )}
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 tracking-tight truncate">
                        {course.nome}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2.5 text-xs text-stone-600 dark:text-stone-400 flex-wrap gap-y-1">
                      <span className="font-mono font-semibold px-2.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-[11px]">
                        {course.cfu} CFU
                      </span>
                      <span className="font-medium">Anno {course.annoCorso} • Sem. {course.semestre}</span>
                      <span>•</span>
                      {/* Indicatore di difficoltà a segmenti ambra/arancio */}
                      <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-semibold text-[11px]">
                        <span>Difficoltà: {course.difficoltaStimata}/5</span>
                        <div className="flex space-x-0.5 ml-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-2 rounded-xs ${
                                i < course.difficoltaStimata
                                  ? "bg-amber-500"
                                  : "bg-amber-200 dark:bg-amber-900"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget({ type: "course", course })}
                    className="text-stone-400 hover:text-rose-700 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                    title="Elimina insegnamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Propedeuticità attive con freccia verde bosco */}
                {coursePrereqs.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5 pt-0.5 text-xs">
                    <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 flex items-center space-x-1">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-500 stroke-[2.5]" />
                      <span>Richiede superamento di:</span>
                    </span>
                    {coursePrereqs.map((p) => (
                      <span
                        key={p.id}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold"
                      >
                        {p.nome}
                      </span>
                    ))}
                  </div>
                )}

                {/* Appelli disponibili */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-stone-800 dark:text-stone-200 font-bold flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>{calls.length} {calls.length === 1 ? "Appello d'esame" : "Appelli d'esame"}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveCourseForCall(course)}
                        className="text-[11px] text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>Aggiungi data</span>
                      </button>
                      {calls.length > 2 && (
                        <button
                          onClick={() =>
                            setExpandedCourseId(isExpanded ? null : course.id)
                          }
                          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 cursor-pointer"
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
                    <p className="text-[11px] text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-2 rounded-lg font-semibold">
                      Nessun appello inserito (richiesto almeno 1 per la pianificazione)
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {(isExpanded ? calls : calls.slice(0, 2)).map((call) => (
                        <div
                          key={call.id}
                          className="flex items-center justify-between text-xs bg-stone-50 dark:bg-stone-950/70 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-xs">
                              {formatDate(call.dataOra)}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-medium">
                              {call.tipoProva}
                            </span>
                            {call.aula && (
                              <span className="text-stone-500 dark:text-stone-400 flex items-center space-x-1 text-[11px]">
                                <MapPin className="w-2.5 h-2.5 text-stone-400" />
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
                            className="text-stone-400 hover:text-rose-700 dark:hover:text-rose-400 p-1 rounded hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                            title="Rimuovi data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {!isExpanded && calls.length > 2 && (
                        <button
                          onClick={() => setExpandedCourseId(course.id)}
                          className="text-[11px] text-emerald-800 dark:text-emerald-400 hover:underline block text-center w-full pt-1 font-semibold cursor-pointer"
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
