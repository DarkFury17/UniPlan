// ============================================================================
// UniPlan — Timeline Builder (Reverse Study Planner)
// Distribuisce a ritroso le sessioni di studio dalla data d'esame
// ============================================================================

import type {
  Course,
  ExamCall,
  SchedulingConstraints,
  StudySessionSlot,
  GeneratedPlan,
} from "./types";
import type { ScheduleResult } from "./exam-scheduler";

// ---------------------------------------------------------------------------
// Calcolo fabbisogno orario
// ---------------------------------------------------------------------------

/**
 * Calcola il fabbisogno orario stimato per un esame.
 * Formula: Ore = CFU × 25 × (Difficoltà / 3)
 *
 * Es. un esame da 9 CFU con difficoltà 4:
 *     9 × 25 × (4/3) = 300 ore → ma è il fabbisogno TOTALE incluse le lezioni.
 *     Usiamo un fattore di riduzione per lo studio autonomo (≈40% del totale).
 */
const STUDIO_AUTONOMO_RATIO = 0.4;

export function computeStudyHours(course: Course): number {
  const totalWorkload = course.cfu * 25 * (course.difficoltaStimata / 3);
  return Math.round(totalWorkload * STUDIO_AUTONOMO_RATIO * 10) / 10;
}

// ---------------------------------------------------------------------------
// Utilità date
// ---------------------------------------------------------------------------

/** Aggiunge `days` giorni a una data (negativo = sottrai). */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Normalizza una data alle 09:00 per consistenza nelle sessioni di studio. */
function normalizeToMorning(date: Date): Date {
  const d = new Date(date);
  d.setHours(9, 0, 0, 0);
  return d;
}

/** Differenza in giorni tra due date. */
function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
}

/** Crea una chiave stringa dal giorno per la mappa dei carichi. */
function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Timeline Builder
// ---------------------------------------------------------------------------

export interface TimelineBuildOptions {
  /** Corsi con i relativi dati (CFU, difficoltà, ecc.) */
  readonly courses: readonly Course[];
  /** Risultato dello scheduler (mappa courseId → ExamCall) */
  readonly scheduleResult: ScheduleResult;
  /** Vincoli di scheduling */
  readonly constraints: SchedulingConstraints;
}

/**
 * Costruisce il piano di studio completo distribuendo a ritroso le sessioni
 * dalla data dell'esame alla data di inizio pianificazione.
 *
 * Algoritmo:
 * 1. Per ogni esame, calcola le ore totali di studio necessarie.
 * 2. Partendo dalla data dell'esame (meno buffer), distribuisce le ore
 *    all'indietro giorno per giorno, rispettando il tetto giornaliero.
 * 3. Se i giorni disponibili non bastano, le ore vengono compresse (warning).
 */
export function buildTimeline(options: TimelineBuildOptions): GeneratedPlan {
  const { courses, scheduleResult, constraints } = options;
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  // Mappa giorno → ore già allocate (per bilanciare il carico globale)
  const dailyLoad = new Map<string, number>();

  // Ordinare gli esami per data (dal primo all'ultimo)
  const sortedExams = [...scheduleResult.schedule.entries()].sort(
    ([, a], [, b]) => a.dataOra.getTime() - b.dataOra.getTime()
  );

  const allSessions: StudySessionSlot[] = [];

  for (const [courseId, examCall] of sortedExams) {
    const course = courseMap.get(courseId);
    if (!course) continue;

    const requiredHours = computeStudyHours(course);
    const sessions = allocateStudySessions(
      courseId,
      requiredHours,
      examCall.dataOra,
      constraints,
      dailyLoad
    );

    allSessions.push(...sessions);
  }

  // Ordina tutte le sessioni cronologicamente
  allSessions.sort((a, b) => a.data.getTime() - b.data.getTime());

  return {
    examSchedule: scheduleResult.schedule,
    studySessions: allSessions,
    totalCost: scheduleResult.cost,
  };
}

/**
 * Alloca le sessioni di studio per un singolo esame, procedendo a ritroso
 * dalla data dell'esame.
 */
function allocateStudySessions(
  courseId: string,
  totalHours: number,
  examDate: Date,
  constraints: SchedulingConstraints,
  dailyLoad: Map<string, number>
): StudySessionSlot[] {
  const sessions: StudySessionSlot[] = [];
  let remainingHours = totalHours;

  // L'ultimo giorno utile per studiare è (examDate - buffer - 1)
  // Il giorno dell'esame e i giorni di buffer prima sono liberi
  let currentDay = addDays(examDate, -(constraints.giorniBufferMinimi + 1));

  const startDate = normalizeToMorning(constraints.dataInizioPianificazione);

  while (remainingHours > 0 && currentDay.getTime() >= startDate.getTime()) {
    const key = dayKey(currentDay);
    const usedHours = dailyLoad.get(key) ?? 0;
    const availableHours = Math.max(0, constraints.oreStudioGiornaliereMax - usedHours);

    if (availableHours > 0) {
      const hoursToAllocate = Math.min(remainingHours, availableHours);

      // Arrotonda a 0.5h per sessioni realistiche
      const roundedHours = Math.round(hoursToAllocate * 2) / 2;

      if (roundedHours > 0) {
        sessions.push({
          courseId,
          data: normalizeToMorning(currentDay),
          orePianificate: roundedHours,
        });

        dailyLoad.set(key, usedHours + roundedHours);
        remainingHours -= roundedHours;
      }
    }

    currentDay = addDays(currentDay, -1);
  }

  // Se rimangono ore non allocate (non abbastanza giorni), comprimi
  // rispettando comunque il tetto giornaliero (con un margine di 0.5h per arrotondamento)
  if (remainingHours > 0.5) {
    const maxDaily = constraints.oreStudioGiornaliereMax;
    for (let i = 0; i < sessions.length && remainingHours > 0.25; i++) {
      const sessionKey = dayKey(sessions[i].data);
      const currentLoad = dailyLoad.get(sessionKey) ?? sessions[i].orePianificate;
      const headroom = Math.max(0, maxDaily - currentLoad);

      if (headroom > 0) {
        const extra = Math.round(Math.min(headroom, remainingHours) * 2) / 2;
        if (extra > 0) {
          sessions[i] = {
            ...sessions[i],
            orePianificate: sessions[i].orePianificate + extra,
          };
          dailyLoad.set(sessionKey, currentLoad + extra);
          remainingHours -= extra;
        }
      }
    }
  }

  // Le sessioni sono state create a ritroso → inverti per ordine cronologico
  return sessions.reverse();
}
