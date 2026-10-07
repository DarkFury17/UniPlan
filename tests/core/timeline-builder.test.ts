// ============================================================================
// UniPlan — Timeline Builder Tests
// ============================================================================

import { describe, it, expect } from "vitest";
import {
  buildTimeline,
  computeStudyHours,
} from "../../src/core/timeline-builder";
import type { Course, ExamCall, SchedulingConstraints } from "../../src/core/types";
import type { ScheduleResult } from "../../src/core/exam-scheduler";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCourse(overrides: Partial<Course> & { id: string; nome: string }): Course {
  return {
    cfu: 6,
    semestre: 1,
    annoCorso: 1,
    difficoltaStimata: 3,
    ...overrides,
  };
}

function makeExamCall(courseId: string, dateStr: string): ExamCall {
  return {
    id: `exam-${courseId}`,
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
// SUITE: Calcolo Fabbisogno Orario
// ===========================================================================

describe("Timeline Builder — Fabbisogno Orario", () => {
  it("calcola correttamente le ore per un esame standard (6 CFU, difficoltà 3)", () => {
    const course = makeCourse({ id: "test", nome: "Test" });
    const hours = computeStudyHours(course);
    // 6 × 25 × (3/3) × 0.4 = 60
    expect(hours).toBe(60);
  });

  it("calcola correttamente per un esame difficile (9 CFU, difficoltà 5)", () => {
    const course = makeCourse({
      id: "hard",
      nome: "Hard Exam",
      cfu: 9,
      difficoltaStimata: 5,
    });
    const hours = computeStudyHours(course);
    // 9 × 25 × (5/3) × 0.4 = 150
    expect(hours).toBe(150);
  });

  it("calcola correttamente per un esame facile (6 CFU, difficoltà 1)", () => {
    const course = makeCourse({
      id: "easy",
      nome: "Easy Exam",
      cfu: 6,
      difficoltaStimata: 1,
    });
    const hours = computeStudyHours(course);
    // 6 × 25 × (1/3) × 0.4 = 20
    expect(hours).toBe(20);
  });

  it("le ore aumentano con i CFU e la difficoltà", () => {
    const easy = makeCourse({ id: "e", nome: "Easy", cfu: 6, difficoltaStimata: 1 });
    const hard = makeCourse({ id: "h", nome: "Hard", cfu: 12, difficoltaStimata: 5 });

    expect(computeStudyHours(hard)).toBeGreaterThan(computeStudyHours(easy));
  });
});

// ===========================================================================
// SUITE: Allocazione a Ritroso
// ===========================================================================

describe("Timeline Builder — Allocazione a Ritroso", () => {
  it("genera sessioni di studio per un singolo esame", () => {
    const courses = [
      makeCourse({ id: "A", nome: "Corso A", cfu: 6, difficoltaStimata: 1 }),
    ];
    // 6 × 25 × (1/3) × 0.4 = 20 ore necessarie

    const scheduleResult: ScheduleResult = {
      schedule: new Map([
        ["A", makeExamCall("A", "2027-01-20T09:00:00+01:00")],
      ]),
      cost: 0,
    };

    const plan = buildTimeline({ courses, scheduleResult, constraints: defaultConstraints });

    expect(plan.studySessions.length).toBeGreaterThan(0);
    expect(plan.examSchedule.size).toBe(1);

    // Tutte le sessioni devono essere per il corso A
    for (const session of plan.studySessions) {
      expect(session.courseId).toBe("A");
    }
  });

  it("tutte le sessioni sono PRIMA della data dell'esame meno il buffer", () => {
    const courses = [
      makeCourse({ id: "A", nome: "Corso A", cfu: 6, difficoltaStimata: 2 }),
    ];
    const examDate = new Date("2027-02-01T09:00:00+01:00");

    const scheduleResult: ScheduleResult = {
      schedule: new Map([["A", makeExamCall("A", "2027-02-01T09:00:00+01:00")]]),
      cost: 0,
    };

    const plan = buildTimeline({ courses, scheduleResult, constraints: defaultConstraints });

    // L'ultimo giorno di studio deve essere almeno (buffer + 1) giorni prima dell'esame
    const bufferCutoff = new Date(examDate);
    bufferCutoff.setDate(bufferCutoff.getDate() - defaultConstraints.giorniBufferMinimi);

    for (const session of plan.studySessions) {
      expect(session.data.getTime()).toBeLessThan(bufferCutoff.getTime());
    }
  });

  it("tutte le sessioni sono DOPO la data di inizio pianificazione", () => {
    const courses = [
      makeCourse({ id: "A", nome: "Corso A", cfu: 6, difficoltaStimata: 2 }),
    ];

    const scheduleResult: ScheduleResult = {
      schedule: new Map([["A", makeExamCall("A", "2027-02-01T09:00:00+01:00")]]),
      cost: 0,
    };

    const plan = buildTimeline({ courses, scheduleResult, constraints: defaultConstraints });

    const startDate = new Date("2027-01-01");
    startDate.setHours(0, 0, 0, 0);

    for (const session of plan.studySessions) {
      expect(session.data.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
    }
  });

  it("le sessioni sono ordinate cronologicamente", () => {
    const courses = [
      makeCourse({ id: "A", nome: "Corso A", cfu: 9, difficoltaStimata: 3 }),
      makeCourse({ id: "B", nome: "Corso B", cfu: 6, difficoltaStimata: 2 }),
    ];

    const scheduleResult: ScheduleResult = {
      schedule: new Map([
        ["A", makeExamCall("A", "2027-01-20T09:00:00+01:00")],
        ["B", makeExamCall("B", "2027-02-10T09:00:00+01:00")],
      ]),
      cost: 0,
    };

    const plan = buildTimeline({ courses, scheduleResult, constraints: defaultConstraints });

    for (let i = 1; i < plan.studySessions.length; i++) {
      expect(plan.studySessions[i].data.getTime()).toBeGreaterThanOrEqual(
        plan.studySessions[i - 1].data.getTime()
      );
    }
  });
});

// ===========================================================================
// SUITE: Vincolo Ore Massime Giornaliere
// ===========================================================================

describe("Timeline Builder — Vincolo Ore Giornaliere", () => {
  it("nessun giorno supera il tetto massimo di ore", () => {
    const courses = [
      makeCourse({ id: "A", nome: "Corso A", cfu: 9, difficoltaStimata: 4 }),
      makeCourse({ id: "B", nome: "Corso B", cfu: 9, difficoltaStimata: 3 }),
    ];

    const scheduleResult: ScheduleResult = {
      schedule: new Map([
        ["A", makeExamCall("A", "2027-01-20T09:00:00+01:00")],
        ["B", makeExamCall("B", "2027-01-25T09:00:00+01:00")],
      ]),
      cost: 0,
    };

    const plan = buildTimeline({ courses, scheduleResult, constraints: defaultConstraints });

    // Raggruppa per giorno e verifica il totale
    const dailyTotals = new Map<string, number>();
    for (const session of plan.studySessions) {
      const key = session.data.toISOString().slice(0, 10);
      dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + session.orePianificate);
    }

    for (const [day, total] of dailyTotals) {
      // Permettiamo un piccolo margine per arrotondamenti a 0.5h
      expect(total).toBeLessThanOrEqual(
        defaultConstraints.oreStudioGiornaliereMax + 1
      );
    }
  });

  it("distribuisce il carico su più giorni quando le ore sono tante", () => {
    const courses = [
      makeCourse({ id: "HARD", nome: "Esame Difficile", cfu: 12, difficoltaStimata: 5 }),
    ];
    // 12 × 25 × (5/3) × 0.4 = 200 ore → richiede molti giorni

    const scheduleResult: ScheduleResult = {
      schedule: new Map([
        ["HARD", makeExamCall("HARD", "2027-03-01T09:00:00+01:00")],
      ]),
      cost: 0,
    };

    const plan = buildTimeline({ courses, scheduleResult, constraints: defaultConstraints });

    // Con max 6 ore/giorno e 200 ore necessarie → almeno ~33 sessioni
    expect(plan.studySessions.length).toBeGreaterThanOrEqual(20);

    // Verifica che ci siano sessioni distribuite su molti giorni diversi
    const uniqueDays = new Set(
      plan.studySessions.map((s) => s.data.toISOString().slice(0, 10))
    );
    expect(uniqueDays.size).toBeGreaterThanOrEqual(20);
  });
});

// ===========================================================================
// SUITE: Rispetto Buffer
// ===========================================================================

describe("Timeline Builder — Rispetto Buffer", () => {
  it("non schedula sessioni nei giorni di buffer prima dell'esame", () => {
    const bufferDays = 5;
    const constraints: SchedulingConstraints = {
      oreStudioGiornaliereMax: 8,
      giorniBufferMinimi: bufferDays,
      dataInizioPianificazione: new Date("2027-01-01"),
    };

    const courses = [
      makeCourse({ id: "X", nome: "Corso X", cfu: 6, difficoltaStimata: 2 }),
    ];

    const examDateStr = "2027-02-01T09:00:00+01:00";
    const examDate = new Date(examDateStr);

    const scheduleResult: ScheduleResult = {
      schedule: new Map([["X", makeExamCall("X", examDateStr)]]),
      cost: 0,
    };

    const plan = buildTimeline({ courses, scheduleResult, constraints });

    // Calcola la data limite: exam - buffer
    const bufferStart = new Date(examDate);
    bufferStart.setDate(bufferStart.getDate() - bufferDays);
    bufferStart.setHours(0, 0, 0, 0);

    for (const session of plan.studySessions) {
      const sessionDay = new Date(session.data);
      sessionDay.setHours(0, 0, 0, 0);
      expect(sessionDay.getTime()).toBeLessThan(bufferStart.getTime());
    }
  });

  it("rispetta buffer diversi per corsi diversi (via constraints globale)", () => {
    const constraints: SchedulingConstraints = {
      oreStudioGiornaliereMax: 6,
      giorniBufferMinimi: 7, // Buffer alto
      dataInizioPianificazione: new Date("2027-01-01"),
    };

    const courses = [
      makeCourse({ id: "A", nome: "A", cfu: 6, difficoltaStimata: 2 }),
    ];

    const examDate = new Date("2027-01-25T09:00:00+01:00");

    const scheduleResult: ScheduleResult = {
      schedule: new Map([["A", makeExamCall("A", "2027-01-25T09:00:00+01:00")]]),
      cost: 0,
    };

    const plan = buildTimeline({ courses, scheduleResult, constraints });

    const bufferStart = new Date(examDate);
    bufferStart.setDate(bufferStart.getDate() - 7);
    bufferStart.setHours(0, 0, 0, 0);

    for (const session of plan.studySessions) {
      const sessionDay = new Date(session.data);
      sessionDay.setHours(0, 0, 0, 0);
      expect(sessionDay.getTime()).toBeLessThan(bufferStart.getTime());
    }
  });
});
