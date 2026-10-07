// ============================================================================
// UniPlan — Exam Scheduler
// Constraint Satisfaction: seleziona la combinazione ottimale di appelli
// ============================================================================

import type {
  ExamCall,
  SchedulingConstraints,
  PrerequisiteEdge,
} from "./types";
import {
  buildAdjacencyList,
  topologicalSort,
  type AdjacencyList,
} from "./dag-engine";

// ---------------------------------------------------------------------------
// Errori personalizzati
// ---------------------------------------------------------------------------

/**
 * Lanciato quando non esiste alcuna combinazione di appelli che soddisfi
 * tutti gli hard constraints.
 */
export class UnfeasibleScheduleError extends Error {
  public readonly reason: string;

  constructor(reason: string) {
    super(`Pianificazione impossibile: ${reason}`);
    this.name = "UnfeasibleScheduleError";
    this.reason = reason;
  }
}

// ---------------------------------------------------------------------------
// Utilità temporali
// ---------------------------------------------------------------------------

/** Differenza in giorni tra due date (positiva se b > a). */
function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86_400_000;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
}

/** Verifica se due date cadono nello stesso giorno di calendario. */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ---------------------------------------------------------------------------
// Hard Constraints Validation
// ---------------------------------------------------------------------------

/**
 * Verifica che un insieme di appelli scelti rispetti gli hard constraints:
 * 1. Nessun appello sovrapposto nello stesso giorno
 * 2. Rispetto della precedenza cronologica tra corsi propedeutici
 */
export function validateHardConstraints(
  selection: ReadonlyMap<string, ExamCall>,
  adj: AdjacencyList
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  // 1. Controlla sovrapposizioni: nessun esame nello stesso giorno
  const entries = [...selection.entries()];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [idA, callA] = entries[i];
      const [idB, callB] = entries[j];
      if (isSameDay(callA.dataOra, callB.dataOra)) {
        violations.push(
          `Conflitto temporale: "${idA}" e "${idB}" nello stesso giorno (${callA.dataOra.toISOString().slice(0, 10)})`
        );
      }
    }
  }

  // 2. Controlla precedenza propedeuticità: il prerequisito deve essere PRIMA del corso
  for (const [courseId, call] of selection) {
    const prereqs = adj.prerequisites.get(courseId);
    if (!prereqs) continue;

    for (const prereqId of prereqs) {
      const prereqCall = selection.get(prereqId);
      if (!prereqCall) continue; // Il prerequisito non è nel piano (già superato?)

      if (prereqCall.dataOra.getTime() >= call.dataOra.getTime()) {
        violations.push(
          `Violazione propedeuticità: "${prereqId}" (${prereqCall.dataOra.toISOString().slice(0, 10)}) deve precedere "${courseId}" (${call.dataOra.toISOString().slice(0, 10)})`
        );
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

// ---------------------------------------------------------------------------
// Funzione di costo euristica (Soft Constraints)
// ---------------------------------------------------------------------------

/**
 * Calcola il costo di una selezione di appelli.
 * Costo più basso = piano migliore.
 *
 * Componenti:
 * - Penalità per giorni di distanza tra esami consecutivi troppo bassi
 * - Bonus (costo negativo) per distanze generose
 * - Penalità per buffer < giorniBufferMinimi
 */
export function computeScheduleCost(
  selection: ReadonlyMap<string, ExamCall>,
  constraints: SchedulingConstraints
): number {
  // Ordina gli appelli per data
  const sorted = [...selection.values()].sort(
    (a, b) => a.dataOra.getTime() - b.dataOra.getTime()
  );

  if (sorted.length <= 1) return 0;

  let totalCost = 0;

  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1].dataOra, sorted[i].dataOra);

    // Penalità pesante se il gap è inferiore al buffer minimo
    if (gap < constraints.giorniBufferMinimi) {
      totalCost += (constraints.giorniBufferMinimi - gap) * 100;
    }

    // Costo inversamente proporzionale alla distanza (incentiva più spazio)
    // Usiamo 1/gap: più giorni = meno costo
    if (gap > 0) {
      totalCost += 30 / gap;
    } else {
      // Same day → costo enorme (dovrebbe essere già filtered by hard constraints)
      totalCost += 10000;
    }
  }

  return totalCost;
}

// ---------------------------------------------------------------------------
// Scheduler principale: Backtracking con pruning
// ---------------------------------------------------------------------------

export interface ScheduleResult {
  /** Mappa courseId → ExamCall scelto */
  readonly schedule: ReadonlyMap<string, ExamCall>;
  /** Costo del piano */
  readonly cost: number;
}

/**
 * Seleziona la combinazione ottimale di date d'esame rispettando tutti i vincoli.
 *
 * @param courseIds - ID dei corsi da schedulare
 * @param edges - Archi di propedeuticità
 * @param examCalls - Tutti gli appelli disponibili (raggruppati per corso)
 * @param constraints - Vincoli di scheduling
 *
 * @throws {UnfeasibleScheduleError} se non esiste soluzione ammissibile
 * @throws {CyclicDependencyError} se il grafo contiene cicli
 */
export function scheduleExams(
  courseIds: readonly string[],
  edges: readonly PrerequisiteEdge[],
  examCalls: readonly ExamCall[],
  constraints: SchedulingConstraints
): ScheduleResult {
  // 1. Costruisci il DAG e ordina topologicamente
  const adj = buildAdjacencyList(courseIds, edges);
  const topoResult = topologicalSort(adj);

  // 2. Raggruppa appelli per corso
  const callsByCourse = new Map<string, ExamCall[]>();
  for (const call of examCalls) {
    const list = callsByCourse.get(call.courseId);
    if (list) {
      list.push(call);
    } else {
      callsByCourse.set(call.courseId, [call]);
    }
  }

  // Ordina ogni lista di appelli per data
  for (const [, calls] of callsByCourse) {
    calls.sort((a, b) => a.dataOra.getTime() - b.dataOra.getTime());
  }

  // 3. Verifica che ogni corso abbia almeno un appello
  for (const courseId of courseIds) {
    const calls = callsByCourse.get(courseId);
    if (!calls || calls.length === 0) {
      throw new UnfeasibleScheduleError(
        `Nessun appello disponibile per il corso "${courseId}"`
      );
    }
  }

  // 4. Backtracking con pruning sull'ordine topologico
  const state: { bestResult: { schedule: Map<string, ExamCall>; cost: number } | null } = {
    bestResult: null,
  };

  const currentSelection = new Map<string, ExamCall>();

  function backtrack(index: number): void {
    if (index === topoResult.order.length) {
      // Soluzione completa trovata → valuta il costo
      const validation = validateHardConstraints(currentSelection, adj);
      if (!validation.valid) return;

      const cost = computeScheduleCost(currentSelection, constraints);
      if (state.bestResult === null || cost < state.bestResult.cost) {
        state.bestResult = {
          schedule: new Map(currentSelection),
          cost,
        };
      }
      return;
    }

    const courseId = topoResult.order[index];
    const calls = callsByCourse.get(courseId) ?? [];

    for (const call of calls) {
      currentSelection.set(courseId, call);

      // Pruning veloce: verifica hard constraints parziali
      if (isPartiallyFeasible(currentSelection, adj, courseId)) {
        backtrack(index + 1);
      }

      currentSelection.delete(courseId);
    }
  }

  backtrack(0);

  if (state.bestResult === null) {
    throw new UnfeasibleScheduleError(
      "Nessuna combinazione di appelli soddisfa tutti i vincoli (sovrapposizioni o propedeuticità impossibili)"
    );
  }

  return {
    schedule: state.bestResult.schedule,
    cost: state.bestResult.cost,
  };
}

// ---------------------------------------------------------------------------
// Pruning parziale
// ---------------------------------------------------------------------------

/**
 * Verifica che l'ultimo corso aggiunto non violi hard constraints
 * con i corsi già selezionati.
 */
function isPartiallyFeasible(
  selection: Map<string, ExamCall>,
  adj: AdjacencyList,
  justAdded: string
): boolean {
  const addedCall = selection.get(justAdded)!;

  for (const [otherId, otherCall] of selection) {
    if (otherId === justAdded) continue;

    // 1. No sovrapposizione nello stesso giorno
    if (isSameDay(addedCall.dataOra, otherCall.dataOra)) {
      return false;
    }
  }

  // 2. Prerequisiti di justAdded devono essere PRIMA
  const prereqs = adj.prerequisites.get(justAdded);
  if (prereqs) {
    for (const prereqId of prereqs) {
      const prereqCall = selection.get(prereqId);
      if (prereqCall && prereqCall.dataOra.getTime() >= addedCall.dataOra.getTime()) {
        return false;
      }
    }
  }

  // 3. Corsi che dipendono da justAdded devono essere DOPO
  const deps = adj.dependents.get(justAdded);
  if (deps) {
    for (const depId of deps) {
      const depCall = selection.get(depId);
      if (depCall && depCall.dataOra.getTime() <= addedCall.dataOra.getTime()) {
        return false;
      }
    }
  }

  return true;
}
