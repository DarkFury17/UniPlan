// ============================================================================
// UniPlan — Scheduler API Integration Tests (Fastify & Vitest)
// ============================================================================

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/api/app";

describe("UniPlan REST API Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // ---------------------------------------------------------------------------
  // 1. Health Check
  // ---------------------------------------------------------------------------
  describe("GET /api/health", () => {
    it("restituisce HTTP 200 con status ok e uptime", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/health",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe("ok");
      expect(typeof body.uptime).toBe("number");
      expect(body.service).toBe("UniPlan API");
    });
  });

  // ---------------------------------------------------------------------------
  // 2. POST /api/scheduler/plan
  // ---------------------------------------------------------------------------
  describe("POST /api/scheduler/plan", () => {
    it("restituisce HTTP 200 con piano calcolato, timeline e metriche per richiesta valida", async () => {
      const payload = {
        courses: [
          {
            id: "anal1",
            codice: "MAT/05",
            nome: "Analisi Matematica 1",
            cfu: 9,
            semestre: 1,
            annoCorso: 1,
            difficoltaStimata: 4,
          },
          {
            id: "prog1",
            codice: "ING-INF/05",
            nome: "Programmazione 1",
            cfu: 9,
            semestre: 1,
            annoCorso: 1,
            difficoltaStimata: 3,
          },
        ],
        prerequisites: [],
        examCalls: [
          {
            id: "call-anal1-1",
            courseId: "anal1",
            dataOra: "2026-06-15T09:00:00.000Z",
            aula: "Aula 3",
            tipoProva: "SCRITTO",
          },
          {
            id: "call-prog1-1",
            courseId: "prog1",
            dataOra: "2026-06-25T09:00:00.000Z",
            aula: "Lab Turing",
            tipoProva: "SCRITTO_ORALE",
          },
        ],
        constraints: {
          oreStudioGiornaliereMax: 6,
          giorniBufferMinimi: 3,
          dataInizioPianificazione: "2026-05-01T00:00:00.000Z",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/scheduler/plan",
        payload,
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);

      expect(json.success).toBe(true);
      expect(json.plan).toBeDefined();
      expect(json.plan.examSchedule).toHaveLength(2);
      expect(json.plan.studySessions.length).toBeGreaterThan(0);
      expect(typeof json.plan.totalCost).toBe("number");

      // Verifica metriche
      expect(json.metrics).toBeDefined();
      expect(json.metrics.totalCourses).toBe(2);
      expect(json.metrics.totalExamDays).toBe(2);
      expect(json.metrics.totalStudyHours).toBeGreaterThan(0);
      expect(json.metrics.totalStudyDays).toBeGreaterThan(0);
      expect(json.metrics.startDate).toBeDefined();
      expect(json.metrics.lastExamDate).toBeDefined();
    });

    it("supporta gli alias per i vincoli (oreGiornaliereMax, bufferGiorniMinimo, dataInizioPreparazione)", async () => {
      const payload = {
        courses: [
          {
            id: "c1",
            nome: "Fisica 1",
            cfu: 6,
            semestre: 2,
            annoCorso: 1,
            difficoltaStimata: 3,
          },
        ],
        prerequisites: [],
        examCalls: [
          {
            id: "call-c1",
            courseId: "c1",
            dataOra: "2026-07-10T09:00:00.000Z",
            tipoProva: "SCRITTO",
          },
        ],
        constraints: {
          oreGiornaliereMax: 5,
          bufferGiorniMinimo: 2,
          dataInizioPreparazione: "2026-06-01T00:00:00.000Z",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/scheduler/plan",
        payload,
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.body);
      expect(json.success).toBe(true);
    });

    it("restituisce HTTP 422 quando il grafo presenta un ciclo di propedeuticità", async () => {
      const cyclicPayload = {
        courses: [
          { id: "A", nome: "Esame A", cfu: 6, semestre: 1, annoCorso: 1, difficoltaStimata: 3 },
          { id: "B", nome: "Esame B", cfu: 6, semestre: 1, annoCorso: 1, difficoltaStimata: 3 },
          { id: "C", nome: "Esame C", cfu: 6, semestre: 1, annoCorso: 1, difficoltaStimata: 3 },
        ],
        prerequisites: [
          { courseId: "B", prerequisiteCourseId: "A" }, // B richiede A
          { courseId: "C", prerequisiteCourseId: "B" }, // C richiede B
          { courseId: "A", prerequisiteCourseId: "C" }, // A richiede C -> CICLO A->B->C->A
        ],
        examCalls: [
          { id: "c-a", courseId: "A", dataOra: "2026-06-10T09:00:00.000Z", tipoProva: "ORALE" },
          { id: "c-b", courseId: "B", dataOra: "2026-06-20T09:00:00.000Z", tipoProva: "ORALE" },
          { id: "c-c", courseId: "C", dataOra: "2026-06-30T09:00:00.000Z", tipoProva: "ORALE" },
        ],
        constraints: {
          oreStudioGiornaliereMax: 6,
          giorniBufferMinimi: 2,
          dataInizioPianificazione: "2026-05-01T00:00:00.000Z",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/scheduler/plan",
        payload: cyclicPayload,
      });

      expect(response.statusCode).toBe(422);
      const json = JSON.parse(response.body);
      expect(json.error).toBe("Unprocessable Entity");
      expect(json.message).toContain("Dipendenza ciclica rilevata");
      expect(json.cycle).toBeDefined();
    });

    it("restituisce HTTP 409 quando non esiste alcuna combinazione di appelli che soddisfi i vincoli", async () => {
      const unfeasiblePayload = {
        courses: [
          { id: "A", nome: "Esame A", cfu: 6, semestre: 1, annoCorso: 1, difficoltaStimata: 3 },
          { id: "B", nome: "Esame B", cfu: 6, semestre: 2, annoCorso: 1, difficoltaStimata: 3 },
        ],
        prerequisites: [
          { courseId: "B", prerequisiteCourseId: "A" }, // B richiede A prima
        ],
        // Appello di B è PRIMA dell'appello di A -> impossibile soddisfare la propedeuticità
        examCalls: [
          { id: "call-a", courseId: "A", dataOra: "2026-07-20T09:00:00.000Z", tipoProva: "SCRITTO" },
          { id: "call-b", courseId: "B", dataOra: "2026-06-10T09:00:00.000Z", tipoProva: "SCRITTO" },
        ],
        constraints: {
          oreStudioGiornaliereMax: 6,
          giorniBufferMinimi: 3,
          dataInizioPianificazione: "2026-05-01T00:00:00.000Z",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/scheduler/plan",
        payload: unfeasiblePayload,
      });

      expect(response.statusCode).toBe(409);
      const json = JSON.parse(response.body);
      expect(json.error).toBe("Conflict");
      expect(json.message).toContain("Pianificazione impossibile");
      expect(json.reason).toBeDefined();
    });

    it("restituisce HTTP 400 se la richiesta fallisce la validazione Zod", async () => {
      const invalidPayload = {
        courses: [
          {
            id: "c1",
            nome: "", // Nome vuoto non valido
            cfu: -5, // CFU negativi non validi
          },
        ],
        // Manca examCalls e constraints
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/scheduler/plan",
        payload: invalidPayload,
      });

      expect(response.statusCode).toBe(400);
      const json = JSON.parse(response.body);
      expect(json.error).toBe("Bad Request");
      expect(json.issues).toBeDefined();
      expect(json.issues.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. POST /api/scheduler/export-ics
  // ---------------------------------------------------------------------------
  describe("POST /api/scheduler/export-ics", () => {
    it("restituisce HTTP 200 con file .ics valido e header corretti", async () => {
      const payload = {
        courses: [
          {
            id: "ret1",
            codice: "ING-INF/05",
            nome: "Reti di Calcolatori",
            cfu: 6,
            semestre: 2,
            annoCorso: 2,
            difficoltaStimata: 3,
          },
        ],
        prerequisites: [],
        examCalls: [
          {
            id: "call-ret1-1",
            courseId: "ret1",
            dataOra: "2026-07-05T10:00:00.000Z",
            aula: "Aula N2",
            tipoProva: "ORALE",
          },
        ],
        constraints: {
          oreStudioGiornaliereMax: 4,
          giorniBufferMinimi: 2,
          dataInizioPianificazione: "2026-06-01T00:00:00.000Z",
        },
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/scheduler/export-ics",
        payload,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("text/calendar; charset=utf-8");
      expect(response.headers["content-disposition"]).toBe(
        'attachment; filename="piano-studi.ics"'
      );

      const icsBody = response.body;
      expect(icsBody).toContain("BEGIN:VCALENDAR");
      expect(icsBody).toContain("VERSION:2.0");
      expect(icsBody).toContain("PRODID:-//UniPlan//Study Plan Generator//IT");
      expect(icsBody).toContain("BEGIN:VEVENT");
      expect(icsBody).toContain("SUMMARY:Esame: Reti di Calcolatori [ING-INF/05]");
      expect(icsBody).toContain("LOCATION:Aula N2");
      expect(icsBody).toContain("BEGIN:VALARM");
      expect(icsBody).toContain("TRIGGER:-P1D");
      expect(icsBody).toContain("END:VALARM");
      expect(icsBody).toContain("SUMMARY:Studio: Reti di Calcolatori");
      expect(icsBody).toContain("END:VCALENDAR");
    });

    it("supporta l'esportazione ICS anche passando direttamente un piano pre-calcolato", async () => {
      const payload = {
        calendarName: "Sessione Straordinaria",
        courses: [
          {
            id: "so1",
            nome: "Sistemi Operativi",
            cfu: 9,
            semestre: 1,
            annoCorso: 2,
            difficoltaStimata: 4,
          },
        ],
        examSchedule: [
          {
            id: "call-so1",
            courseId: "so1",
            dataOra: "2026-09-10T14:00:00.000Z",
            aula: "Lab Alpha",
            tipoProva: "PROGETTO",
          },
        ],
        studySessions: [
          {
            courseId: "so1",
            data: "2026-09-01T00:00:00.000Z",
            orePianificate: 5,
          },
        ],
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/scheduler/export-ics",
        payload,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("text/calendar; charset=utf-8");
      expect(response.body).toContain("X-WR-CALNAME:Sessione Straordinaria");
      expect(response.body).toContain("SUMMARY:Esame: Sistemi Operativi");
      expect(response.body).toContain("SUMMARY:Studio: Sistemi Operativi (5h)");
    });
  });
});
