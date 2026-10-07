import { useState } from "react";
import {
  Play,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Header } from "./components/Header";
import { StepTracker } from "./components/StepTracker";
import { DegreeSelector } from "./components/DegreeSelector";
import { ConstraintsPanel } from "./components/ConstraintsPanel";
import { CourseList } from "./components/CourseList";
import { ResultsView } from "./components/ResultsView";
import { ErrorAlert } from "./components/ErrorAlert";
import { useTheme } from "./hooks/useTheme";
import type { DegreePreset } from "./data/degree-presets";
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

  // Flusso di navigazione a 3 step progressivi
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>("cs-triennale");

  // Dati di dominio
  const [courses, setCourses] = useState<Course[]>(EXAMPLE_COURSES);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteEdge[]>(EXAMPLE_PREREQUISITES);
  const [examCalls, setExamCalls] = useState<ExamCall[]>(EXAMPLE_EXAM_CALLS);
  const [constraints, setConstraints] = useState<SchedulingConstraints>(DEFAULT_CONSTRAINTS);

  // Stati asincroni
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [planResponse, setPlanResponse] = useState<PlanResponse | null>(null);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  // Configurazione degli step
  const steps = [
    { id: 1, label: "Corso di Laurea", sublabel: "Preset o personalizzato" },
    { id: 2, label: "Insegnamenti & Parametri", sublabel: "Esami, appelli e ore" },
    { id: 3, label: "Piano di Studio", sublabel: "Calendario & Esportazione" },
  ];

  const canNavigateTo = (stepId: number) => {
    if (stepId === 1) return true;
    if (stepId === 2) return courses.length > 0;
    if (stepId === 3) return planResponse !== null;
    return false;
  };

  // Selezione di un preset per laurea
  const handleSelectDegreePreset = (preset: DegreePreset) => {
    setSelectedPresetId(preset.id);
    setCourses(preset.courses);
    setPrerequisites(preset.prerequisites);
    setExamCalls(preset.examCalls);
    setConstraints(preset.constraints);
    setPlanResponse(null);
    setApiError(null);
    // Avanza automaticamente al passo 2 per ridurre i click
    setCurrentStep(2);
  };

  // Inizia con un piano vuoto da zero
  const handleStartBlank = () => {
    setSelectedPresetId(null);
    setCourses([]);
    setPrerequisites([]);
    setExamCalls([]);
    setPlanResponse(null);
    setApiError(null);
    setCurrentStep(2);
  };

  // Reset completo
  const handleReset = () => {
    setSelectedPresetId(null);
    setCourses([]);
    setPrerequisites([]);
    setExamCalls([]);
    setPlanResponse(null);
    setApiError(null);
    setCurrentStep(1);
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

  // Calcolo del piano tramite API Fastify
  const handleGeneratePlan = async () => {
    if (courses.length === 0) {
      setApiError({
        statusCode: 400,
        error: "Bad Request",
        message: "Devi inserire almeno un insegnamento prima di calcolare il piano.",
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
      } else {
        setPlanResponse(data as PlanResponse);
        setApiError(null);
        setCurrentStep(3); // Mostra direttamente i risultati finali
      }
    } catch (err: any) {
      setApiError({
        statusCode: 500,
        error: "Network Error",
        message:
          "Impossibile raggiungere il server API di UniPlan. Verifica che il processo backend sia attivo.",
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
      a.download = "piano-studi-uniplan.ics";
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
    <div className="min-h-screen flex flex-col bg-stone-100/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      <Header
        onLoadExample={() => {}}
        onReset={handleReset}
        isGenerating={isGenerating}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentStep={currentStep}
        onSelectStep={(step) => {
          if (canNavigateTo(step)) setCurrentStep(step);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Step Progress Tracker */}
        <StepTracker
          steps={steps}
          currentStep={currentStep}
          onStepClick={(stepId) => setCurrentStep(stepId)}
          canNavigateTo={canNavigateTo}
        />

        {/* Global Error Banner */}
        {apiError && (
          <ErrorAlert error={apiError} onDismiss={() => setApiError(null)} />
        )}

        {/* STEP 1: Scelta Corso di Laurea / Facoltà */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <DegreeSelector
              selectedPresetId={selectedPresetId}
              onSelectPreset={handleSelectDegreePreset}
              onStartBlank={handleStartBlank}
            />

            {courses.length > 0 && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Configura Esami & Vincoli ({courses.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Gestione Corsi, Appelli & Vincoli */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Top Breadcrumb & Back */}
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center space-x-1.5 hover:text-stone-900 dark:hover:text-stone-100 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Torna alla selezione corso di laurea</span>
              </button>

              <div className="flex items-center space-x-2 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200">
                  {courses.length} insegnamenti
                </span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200">
                  {examCalls.length} appelli
                </span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200">
                  {prerequisites.length} propedeuticità
                </span>
              </div>
            </div>

            {/* Constraints & Preferences Panel */}
            <ConstraintsPanel
              constraints={constraints}
              onChange={setConstraints}
            />

            {/* Course & Exam Calls Management */}
            <CourseList
              courses={courses}
              prerequisites={prerequisites}
              examCalls={examCalls}
              onAddCourse={handleAddCourse}
              onRemoveCourse={handleRemoveCourse}
              onAddExamCall={handleAddExamCall}
              onRemoveExamCall={handleRemoveExamCall}
            />

            {/* Primary Action Button (Solve CSP & Backwards Timeline) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                  Pronto per calcolare il piano di studio?
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Il motore verificherà la conformità delle propedeuticità (DAG) e troverà la combinazione ideale.
                </p>
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={isGenerating || courses.length === 0}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600 font-semibold text-xs shadow-xs transition-all disabled:opacity-40 cursor-pointer shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Calcolo del piano in corso...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Calcola Piano Ottimizzato</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Visualizzazione Risultati */}
        {currentStep === 3 && planResponse && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center space-x-1.5 hover:text-stone-900 dark:hover:text-stone-100 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modifica esami e parametri di studio</span>
              </button>

              <span className="font-mono text-stone-500 dark:text-stone-400">
                Data inizio: {new Date(planResponse.metrics.startDate).toLocaleDateString("it-IT")}
              </span>
            </div>

            <ResultsView
              planResponse={planResponse}
              onExportIcs={handleExportIcs}
              isExporting={isExporting}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 dark:border-stone-900 bg-white dark:bg-stone-950 py-5 text-center text-xs text-stone-500 dark:text-stone-400 transition-colors">
        <p className="font-mono text-[11px]">
          UniPlan • Motore di Scheduling DAG & CSP • Standard iCalendar RFC 5545
        </p>
      </footer>
    </div>
  );
}

export default App;
