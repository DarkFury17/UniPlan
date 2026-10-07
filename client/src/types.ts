// ============================================================================
// UniPlan — Frontend UI Types
// ============================================================================

export interface Course {
  id: string;
  codice?: string;
  nome: string;
  cfu: number;
  semestre: 1 | 2;
  annoCorso: number;
  difficoltaStimata: number; // 1-5
}

export interface PrerequisiteEdge {
  courseId: string;
  prerequisiteCourseId: string;
}

export type ExamType = "SCRITTO" | "ORALE" | "PROGETTO" | "LABORATORIO" | "SCRITTO_ORALE";

export interface ExamCall {
  id: string;
  courseId: string;
  dataOra: string; // ISO string
  aula?: string;
  tipoProva: ExamType;
}

export interface SchedulingConstraints {
  oreStudioGiornaliereMax: number;
  giorniBufferMinimi: number;
  dataInizioPianificazione: string; // ISO or YYYY-MM-DD
}

export interface ScheduledExamItem {
  courseId: string;
  courseName: string;
  examCall: ExamCall;
}

export interface StudySessionItem {
  courseId: string;
  courseName: string;
  data: string; // ISO string
  orePianificate: number;
}

export interface PlanMetrics {
  totalCourses: number;
  totalStudyHours: number;
  totalStudyDays: number;
  totalExamDays: number;
  totalCost: number;
  startDate: string;
  lastExamDate: string | null;
}

export interface PlanResponse {
  success: boolean;
  plan: {
    examSchedule: ScheduledExamItem[];
    studySessions: StudySessionItem[];
    totalCost: number;
  };
  metrics: PlanMetrics;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  cycle?: string[];
  reason?: string;
  issues?: Array<{ path: string; message: string }>;
}
