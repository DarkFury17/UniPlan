// ============================================================================
// UniPlan — iCalendar RFC 5545 Builder Tests
// ============================================================================

import { describe, it, expect } from "vitest";
import {
  buildIcsCalendar,
  formatIcsUtc,
  escapeIcsText,
  foldIcsLine,
} from "../../src/calendar/ics-builder";
import type { Course, ExamCall, StudySessionSlot } from "../../src/core/types";

describe("iCalendar (RFC 5545) Builder", () => {
  const sampleCourses: Course[] = [
    {
      id: "course-1",
      codice: "INF-01",
      nome: "Algoritmi e Strutture Dati",
      cfu: 9,
      semestre: 1,
      annoCorso: 2,
      difficoltaStimata: 4,
    },
    {
      id: "course-2",
      codice: "MAT-01",
      nome: "Analisi Matematica 1",
      cfu: 9,
      semestre: 1,
      annoCorso: 1,
      difficoltaStimata: 5,
    },
  ];

  const sampleExamSchedule: ExamCall[] = [
    {
      id: "call-1",
      courseId: "course-1",
      dataOra: new Date("2026-06-20T09:00:00Z"),
      aula: "Aula Magna",
      tipoProva: "SCRITTO_ORALE",
    },
  ];

  const sampleStudySessions: StudySessionSlot[] = [
    {
      courseId: "course-1",
      data: new Date("2026-06-15T00:00:00Z"),
      orePianificate: 4,
    },
    {
      courseId: "course-1",
      data: new Date("2026-06-16T00:00:00Z"),
      orePianificate: 3.5,
    },
  ];

  describe("formatIcsUtc", () => {
    it("formatta correttamente una data in formato UTC YYYYMMDDTHHmmssZ", () => {
      const date = new Date("2026-07-15T14:30:45Z");
      expect(formatIcsUtc(date)).toBe("20260715T143045Z");
    });
  });

  describe("escapeIcsText", () => {
    it("effettua l'escape dei caratteri speciali per RFC 5545", () => {
      const input = "Test; con, virgole\ne backslash \\ fine";
      const escaped = escapeIcsText(input);
      expect(escaped).toBe("Test\\; con\\, virgole\\ne backslash \\\\ fine");
    });
  });

  describe("foldIcsLine", () => {
    it("non altera righe sotto i 75 caratteri", () => {
      const short = "SUMMARY:Esame di Algoritmi";
      expect(foldIcsLine(short)).toBe(short);
    });

    it("spezza righe più lunghe di 75 caratteri con CRLF e spazio", () => {
      const long =
        "DESCRIPTION:Questa è una riga estremamente lunga che supera abbondantemente i settantacinque caratteri previsti dallo standard RFC 5545";
      const folded = foldIcsLine(long);
      expect(folded).toContain("\r\n ");
      const lines = folded.split("\r\n");
      expect(lines[0].length).toBeLessThanOrEqual(75);
    });
  });

  describe("buildIcsCalendar", () => {
    it("genera un file iCalendar valido con tag obbligatori, VEVENT e VALARM", () => {
      const ics = buildIcsCalendar({
        calendarName: "Sessione Estiva 2026",
        courses: sampleCourses,
        examSchedule: sampleExamSchedule,
        studySessions: sampleStudySessions,
      });

      // Tag RFC 5545 obbligatori
      expect(ics).toContain("BEGIN:VCALENDAR\r\n");
      expect(ics).toContain("VERSION:2.0\r\n");
      expect(ics).toContain("PRODID:-//UniPlan//Study Plan Generator//IT\r\n");
      expect(ics).toContain("CALSCALE:GREGORIAN\r\n");
      expect(ics).toContain("METHOD:PUBLISH\r\n");
      expect(ics).toContain("X-WR-CALNAME:Sessione Estiva 2026\r\n");

      // VEVENT Esame
      expect(ics).toContain("BEGIN:VEVENT\r\n");
      expect(ics).toContain("UID:exam-course-1-call-1@uniplan.local\r\n");
      expect(ics).toContain("SUMMARY:Esame: Algoritmi e Strutture Dati [INF-01]\r\n");
      expect(ics).toContain("LOCATION:Aula Magna\r\n");
      expect(ics).toContain("DTSTART:20260620T090000Z\r\n");
      expect(ics).toContain("DTEND:20260620T110000Z\r\n"); // +2 ore default

      // VALARM Promemoria 24 ore prima
      expect(ics).toContain("BEGIN:VALARM\r\n");
      expect(ics).toContain("ACTION:DISPLAY\r\n");
      expect(ics).toContain("TRIGGER:-P1D\r\n");
      expect(ics).toContain("END:VALARM\r\n");

      // VEVENT Studio
      expect(ics).toContain("SUMMARY:Studio: Algoritmi e Strutture Dati (4h)\r\n");
      expect(ics).toContain("SUMMARY:Studio: Algoritmi e Strutture Dati (3.5h)\r\n");

      // Chiusura
      expect(ics).toContain("END:VCALENDAR\r\n");
    });
  });
});
