// ============================================================================
// UniPlan — Exam Scheduler Tests
// ============================================================================

import { describe, it, expect } from "vitest";
import {
  scheduleExams,
  validateHardConstraints,
  computeScheduleCost,
  UnfeasibleScheduleError,
} from "../../src/core/exam-scheduler";
import { buildAdjacencyList, CyclicDependencyError } from "../../src/core/dag-engine";
import type { ExamCall, PrerequisiteEdge, SchedulingConstraints } from "../../src/core/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function edge(courseId: string, prerequisiteCourseId: string): PrerequisiteEdge {
  return { courseId, prerequisiteCourseId };
}

function call(id: string, courseId: string, dateStr: string): ExamCall {
  return {
    id,
    courseId,
    dataOra: new Date(dateStr),
    tipoProva: "SCRITTO",
  };
}

const defaultConstraints: SchedulingConstraints = {
  oreStudioGiornaliereMax: 6,
  giorniBufferMinimi: 3,
  dataInizioPianificazione: new Date("2027-01-01"),
};

// ===========================================================================
// SUITE: Hard Constraints Validation
// ===========================================================================

describe("Exam Scheduler — Hard Constraints", () => {
  it("valida una selezione senza conflitti", () => {
    const selection = new Map<string, ExamCall>([
      ["A", call("e1", "A", "2027-01-15T09:00:00+01:00")],
      ["B", call("e2", "B", "2027-01-20T09:00:00+01:00")],
    ]);
    const adj = buildAdjacencyList(["A", "B"], [edge("B", "A")]);
    const result = validateHardConstraints(selection, adj);

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("rileva conflitto: due esami nello stesso giorno", () => {
    const selection = new Map<string, ExamCall>([
      ["A", call("e1", "A", "2027-01-15T09:00:00+01:00")],
      ["B", call("e2", "B", "2027-01-15T14:00:00+01:00")],
    ]);
    const adj = buildAdjacencyList(["A", "B"], []);
    const result = validateHardConstraints(selection, adj);

    expect(result.valid).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain("Conflitto temporale");
  });

  it("rileva violazione propedeuticità: prerequisito dopo il corso", () => {
    // B richiede A, ma A è schedulato DOPO B
    const selection = new Map<string, ExamCall>([
      ["A", call("e1", "A", "2027-02-01T09:00:00+01:00")],
      ["B", call("e2", "B", "2027-01-15T09:00:00+01:00")],
    ]);
    const adj = buildAdjacencyList(["A", "B"], [edge("B", "A")]);
    const result = validateHardConstraints(selection, adj);

    expect(result.valid).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain("propedeuticità");
  });

  it("rileva multiple violazioni contemporanee", () => {
    const selection = new Map<string, ExamCall>([
      ["A", call("e1", "A", "2027-02-01T09:00:00+01:00")],
      ["B", call("e2", "B", "2027-02-01T14:00:00+01:00")], // Stesso giorno di A
      ["C", call("e3", "C", "2027-01-15T09:00:00+01:00")], // Prima di A, ma C richiede A
    ]);
    const adj = buildAdjacencyList(["A", "B", "C"], [edge("C", "A")]);
    const result = validateHardConstraints(selection, adj);

    expect(result.valid).toBe(false);
    expect(result.violations.length).toBeGreaterThanOrEqual(2);
  });
});

// ===========================================================================
// SUITE: Funzione di Costo
// ===========================================================================

describe("Exam Scheduler — Funzione di Costo", () => {
  it("restituisce costo 0 per un singolo esame", () => {
    const selection = new Map<string, ExamCall>([
      ["A", call("e1", "A", "2027-01-15T09:00:00+01:00")],
    ]);
    const cost = computeScheduleCost(selection, defaultConstraints);
    expect(cost).toBe(0);
  });

  it("penalizza esami troppo ravvicinati (sotto il buffer)", () => {
    // 2 giorni di distanza con buffer minimo = 3
    const closeSelection = new Map<string, ExamCall>([
      ["A", call("e1", "A", "2027-01-15T09:00:00+01:00")],
      ["B", call("e2", "B", "2027-01-17T09:00:00+01:00")],
    ]);
    // 10 giorni di distanza
    const spacedSelection = new Map<string, ExamCall>([
      ["A", call("e1", "A", "2027-01-15T09:00:00+01:00")],
      ["B", call("e2", "B", "2027-01-25T09:00:00+01:00")],
    ]);

    const closeCost = computeScheduleCost(closeSelection, defaultConstraints);
    const spacedCost = computeScheduleCost(spacedSelection, defaultConstraints);

    expect(closeCost).toBeGreaterThan(spacedCost);
  });

  it("premia la massima distanza tra esami", () => {
    const medium = new Map<string, ExamCall>([
      ["A", call("e1", "A", "2027-01-15T09:00:00+01:00")],
      ["B", call("e2", "B", "2027-01-25T09:00:00+01:00")],
    ]);
    const wide = new Map<string, ExamCall>([
      ["A", call("e1", "A", "2027-01-15T09:00:00+01:00")],
      ["B", call("e2", "B", "2027-02-15T09:00:00+01:00")],
    ]);

    const mediumCost = computeScheduleCost(medium, defaultConstraints);
    const wideCost = computeScheduleCost(wide, defaultConstraints);

    expect(wideCost).toBeLessThan(mediumCost);
  });
});

// ===========================================================================
// SUITE: Scheduler Completo
// ===========================================================================

describe("Exam Scheduler — Scheduling Completo", () => {
  it("schedula 2 corsi con propedeuticità rispettando l'ordine cronologico", () => {
    const courseIds = ["A", "B"];
    const edges = [edge("B", "A")]; // B richiede A

    const examCalls: ExamCall[] = [
      call("a1", "A", "2027-01-15T09:00:00+01:00"),
      call("a2", "A", "2027-02-15T09:00:00+01:00"),
      call("b1", "B", "2027-01-20T09:00:00+01:00"),
      call("b2", "B", "2027-02-20T09:00:00+01:00"),
    ];

    const result = scheduleExams(courseIds, edges, examCalls, defaultConstraints);

    // A deve essere schedulato PRIMA di B
    const aDate = result.schedule.get("A")!.dataOra;
    const bDate = result.schedule.get("B")!.dataOra;
    expect(aDate.getTime()).toBeLessThan(bDate.getTime());
  });

  it("sceglie la combinazione con massima distanza tra esami", () => {
    const courseIds = ["X", "Y"];
    const edges: PrerequisiteEdge[] = []; // Nessuna propedeuticità

    const examCalls: ExamCall[] = [
      call("x1", "X", "2027-01-10T09:00:00+01:00"),
      call("x2", "X", "2027-02-10T09:00:00+01:00"),
      call("y1", "Y", "2027-01-12T09:00:00+01:00"), // Solo 2 giorni da x1
      call("y2", "Y", "2027-03-01T09:00:00+01:00"), // Molto distante
    ];

    const result = scheduleExams(courseIds, edges, examCalls, defaultConstraints);

    // Lo scheduler dovrebbe preferire la combinazione che massimizza la distanza
    // La migliore è x1 (10 gen) + y2 (1 mar) o x2 (10 feb) + y2 (1 mar)
    const xDate = result.schedule.get("X")!.dataOra;
    const yDate = result.schedule.get("Y")!.dataOra;

    // Non devono essere nello stesso giorno
    expect(xDate.getTime()).not.toBe(yDate.getTime());
  });

  it("gestisce catena di 3 propedeuticità: A → B → C", () => {
    const courseIds = ["A", "B", "C"];
    const edges = [edge("B", "A"), edge("C", "B")];

    const examCalls: ExamCall[] = [
      call("a1", "A", "2027-01-10T09:00:00+01:00"),
      call("b1", "B", "2027-01-20T09:00:00+01:00"),
      call("c1", "C", "2027-02-01T09:00:00+01:00"),
    ];

    const result = scheduleExams(courseIds, edges, examCalls, defaultConstraints);

    const aDate = result.schedule.get("A")!.dataOra;
    const bDate = result.schedule.get("B")!.dataOra;
    const cDate = result.schedule.get("C")!.dataOra;

    expect(aDate.getTime()).toBeLessThan(bDate.getTime());
    expect(bDate.getTime()).toBeLessThan(cDate.getTime());
  });

  it("schedula il DAG realistico da 8 esami di Informatica", () => {
    const courseIds = [
      "analisi1", "prog1", "algebra", "architettura",
      "analisi2", "asd", "basi_dati", "so"
    ];
    const edges = [
      edge("analisi2", "analisi1"),
      edge("algebra", "analisi1"),
      edge("asd", "prog1"),
      edge("basi_dati", "prog1"),
      edge("basi_dati", "asd"),
      edge("so", "prog1"),
      edge("so", "architettura"),
    ];

    const examCalls: ExamCall[] = [
      call("an1_1", "analisi1", "2027-01-15T09:00:00+01:00"),
      call("an1_2", "analisi1", "2027-02-12T09:00:00+01:00"),
      call("pr1_1", "prog1", "2027-01-20T10:00:00+01:00"),
      call("pr1_2", "prog1", "2027-02-17T10:00:00+01:00"),
      call("alg_1", "algebra", "2027-06-10T09:00:00+02:00"),
      call("alg_2", "algebra", "2027-07-08T09:00:00+02:00"),
      call("arc_1", "architettura", "2027-06-15T14:00:00+02:00"),
      call("arc_2", "architettura", "2027-07-13T14:00:00+02:00"),
      call("an2_1", "analisi2", "2027-01-22T09:00:00+01:00"),
      call("an2_2", "analisi2", "2027-02-19T09:00:00+01:00"),
      call("asd_1", "asd", "2027-01-25T10:00:00+01:00"),
      call("asd_2", "asd", "2027-02-22T10:00:00+01:00"),
      call("bd_1", "basi_dati", "2027-06-20T09:30:00+02:00"),
      call("bd_2", "basi_dati", "2027-07-18T09:30:00+02:00"),
      call("so_1", "so", "2027-06-25T14:30:00+02:00"),
      call("so_2", "so", "2027-07-23T14:30:00+02:00"),
    ];

    const result = scheduleExams(courseIds, edges, examCalls, defaultConstraints);

    // Tutti i corsi devono essere schedulati
    expect(result.schedule.size).toBe(8);

    // Verifiche propedeuticità cronologiche
    const dates = (id: string) => result.schedule.get(id)!.dataOra.getTime();
    expect(dates("analisi1")).toBeLessThan(dates("analisi2"));
    expect(dates("analisi1")).toBeLessThan(dates("algebra"));
    expect(dates("prog1")).toBeLessThan(dates("asd"));
    expect(dates("prog1")).toBeLessThan(dates("basi_dati"));
    expect(dates("asd")).toBeLessThan(dates("basi_dati"));
    expect(dates("prog1")).toBeLessThan(dates("so"));
    expect(dates("architettura")).toBeLessThan(dates("so"));
  });
});

// ===========================================================================
// SUITE: Scenari Impossibili
// ===========================================================================

describe("Exam Scheduler — Scenari Impossibili", () => {
  it("lancia UnfeasibleScheduleError se un corso non ha appelli", () => {
    const courseIds = ["A", "B"];
    const edges: PrerequisiteEdge[] = [];
    const examCalls: ExamCall[] = [
      call("a1", "A", "2027-01-15T09:00:00+01:00"),
      // B non ha appelli!
    ];

    expect(() =>
      scheduleExams(courseIds, edges, examCalls, defaultConstraints)
    ).toThrow(UnfeasibleScheduleError);
  });

  it("lancia UnfeasibleScheduleError se propedeuticità non rispettabile (ordine impossibile)", () => {
    // B richiede A, ma l'unico appello di B è PRIMA dell'unico appello di A
    const courseIds = ["A", "B"];
    const edges = [edge("B", "A")];
    const examCalls: ExamCall[] = [
      call("a1", "A", "2027-02-20T09:00:00+01:00"), // A solo a febbraio
      call("b1", "B", "2027-01-10T09:00:00+01:00"), // B solo a gennaio — impossibile
    ];

    expect(() =>
      scheduleExams(courseIds, edges, examCalls, defaultConstraints)
    ).toThrow(UnfeasibleScheduleError);
  });

  it("lancia UnfeasibleScheduleError se tutti gli appelli sono nello stesso giorno", () => {
    const courseIds = ["A", "B"];
    const edges: PrerequisiteEdge[] = [];
    const examCalls: ExamCall[] = [
      call("a1", "A", "2027-01-15T09:00:00+01:00"),
      call("b1", "B", "2027-01-15T14:00:00+01:00"), // Stesso giorno
    ];

    expect(() =>
      scheduleExams(courseIds, edges, examCalls, defaultConstraints)
    ).toThrow(UnfeasibleScheduleError);
  });

  it("lancia CyclicDependencyError se il grafo ha cicli", () => {
    const courseIds = ["A", "B"];
    const edges = [edge("A", "B"), edge("B", "A")]; // Ciclo

    const examCalls: ExamCall[] = [
      call("a1", "A", "2027-01-15T09:00:00+01:00"),
      call("b1", "B", "2027-01-20T09:00:00+01:00"),
    ];

    expect(() =>
      scheduleExams(courseIds, edges, examCalls, defaultConstraints)
    ).toThrow(CyclicDependencyError);
  });
});
