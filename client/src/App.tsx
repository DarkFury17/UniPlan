import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { Header } from "./components/Header";
import { ConstraintsPanel } from "./components/ConstraintsPanel";
import { CourseList } from "./components/CourseList";
import { ResultsView } from "./components/ResultsView";
import { ErrorAlert } from "./components/ErrorAlert";
import { useTheme } from "./hooks/useTheme";
import {
  DEFAULT_CONSTRAINTS,
  EXAMPLE_COURSES,
  EXAMPLE_PREREQUISITES,
  EXAMPLE_EXAM_CALLS,
} from "./data/example-data";
import type {
  Course,
  PrerequisiteEdge,
  ExamCall,
  SchedulingConstraints,
  PlanResponse,
  ApiError,
} from "./types";

export function App() {
  const { theme, toggleTheme } = useTheme();
  const [courses, setCourses] = useState<Course[]>(EXAMPLE_COURSES);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteEdge[]>(EXAMPLE_PREREQUISITES);
  const [examCalls, setExamCalls] = useState<ExamCall[]>(EXAMPLE_EXAM_CALLS);
  const [constraints, setConstraints] = useState<SchedulingConstraints>(DEFAULT_CONSTRAINTS);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [planResponse, setPlanResponse] = useState<PlanResponse | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  // Caricamento rapido del preset di esempio
  const handleLoadExample = () => {
    setCourses(EXAMPLE_COURSES);
    setPrerequisites(EXAMPLE_PREREQUISITES);
    setExamCalls(EXAMPLE_EXAM_CALLS);
    setConstraints(DEFAULT_CONSTRAINTS);
    setPlanResponse(null);
    setApiError(null);
  };

  // Reset completo
  const handleReset = () => {
    setCourses([]);
    setPrerequisites([]);
    setExamCalls([]);
    setPlanResponse(null);
    setApiError(null);
  };

  // Aggiungi corso
  const handleAddCourse = (newCourse: Course, prerequisiteIds: string[]) => {
    setCourses((prev) => [...prev, newCourse]);
    if (prerequisiteIds.length > 0) {
      const newEdges: PrerequisiteEdge[] = prerequisiteIds.map((pId) => ({
        courseId: newCourse.id,
        prerequisiteCourseId: pId,
      }));
      setPrerequisites((prev) => [...prev, ...newEdges]);
    }
  };

  // Rimuovi corso
  const handleRemoveCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setPrerequisites((prev) =>
      prev.filter((p) => p.courseId !== courseId && p.prerequisiteCourseId !== courseId)
    );
    setExamCalls((prev) => prev.filter((call) => call.courseId !== courseId));
  };

  // Aggiungi appello d'esame
  const handleAddExamCall = (newCall: ExamCall) => {
    setExamCalls((prev) => [...prev, newCall]);
  };

  // Rimuovi appello d'esame
  const handleRemoveExamCall = (callId: string) => {
    setExamCalls((prev) => prev.filter((call) => call.id !== callId));
  };

  // Genera piano tramite API Fastify
  const handleGeneratePlan = async () => {
    if (courses.length === 0) {
      setApiError({
        statusCode: 400,
        error: "Bad Request",
        message: "Devi inserire almeno un esame prima di calcolare il piano.",
      });
      return;
    }

    setIsGenerating(true);
    setApiError(null);

    try {
      const payload = {
        courses,
        prerequisites,
        examCalls,
        constraints: {
          oreStudioGiornaliereMax: constraints.oreStudioGiornaliereMax,
          giorniBufferMinimi: constraints.giorniBufferMinimi,
          dataInizioPianificazione: new Date(constraints.dataInizioPianificazione).toISOString(),
        },
      };

      const res = await fetch("/api/scheduler/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data as ApiError);
        setPlanResponse(null);
      } else {
        setPlanResponse(data as PlanResponse);
        setApiError(null);
      }
    } catch (err: any) {
      setApiError({
        statusCode: 500,
        error: "Network Error",
        message:
          "Impossibile connettersi al server API di UniPlan (Fastify su porta 3000). Assicurati che il backend sia avviato con 'npm run dev'.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Esporta file .ics RFC 5545
  const handleExportIcs = async () => {
    setIsExporting(true);
    try {
      const payload = {
        courses,
        prerequisites,
        examCalls,
        constraints: {
          oreStudioGiornaliereMax: constraints.oreStudioGiornaliereMax,
          giorniBufferMinimi: constraints.giorniBufferMinimi,
          dataInizioPianificazione: new Date(constraints.dataInizioPianificazione).toISOString(),
        },
      };

      const res = await fetch("/api/scheduler/export-ics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setApiError(errorData);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "piano-studi.ics";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setApiError({
        statusCode: 500,
        error: "Export Error",
        message: "Errore durante l'esportazione del file iCalendar (.ics).",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header
        onLoadExample={handleLoadExample}
        onReset={handleReset}
        isGenerating={isGenerating}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Discrete Technical Status Bar */}
        <div className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 shadow-2xs transition-colors">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
            <span className="text-slate-900 dark:text-slate-200 font-semibold">Motore CSP & Reverse Timeline Engine</span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Esportazione RFC 5545 iCalendar</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 text-xs font-mono font-medium">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60">
              {courses.length} corsi
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
              {examCalls.length} appelli
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
              {prerequisites.length} propedeuticità
            </span>
          </div>
        </div>

        {/* Error Alert Display */}
        {apiError && (
          <ErrorAlert error={apiError} onDismiss={() => setApiError(null)} />
        )}

        {/* Configuration & Constraints */}
        <ConstraintsPanel
          constraints={constraints}
          onChange={setConstraints}
        />

        {/* Courses & Calls */}
        <CourseList
          courses={courses}
          prerequisites={prerequisites}
          examCalls={examCalls}
          onAddCourse={handleAddCourse}
          onRemoveCourse={handleRemoveCourse}
          onAddExamCall={handleAddExamCall}
          onRemoveExamCall={handleRemoveExamCall}
        />

        {/* Generate Plan Action CTA */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating || courses.length === 0}
            className="flex items-center space-x-3 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Risoluzione vincoli CSP in corso...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white text-white" />
                <span>Genera piano di studio ottimizzato</span>
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        {planResponse && (
          <div id="results-view" className="pt-2">
            <ResultsView
              planResponse={planResponse}
              onExportIcs={handleExportIcs}
              isExporting={isExporting}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-5 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <p>
          UniPlan • Motore di scheduling esami & piani di studio universitari • RFC 5545
        </p>
      </footer>
    </div>
  );
}
export default App;
