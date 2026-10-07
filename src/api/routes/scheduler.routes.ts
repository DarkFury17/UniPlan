// ============================================================================
// UniPlan — Scheduler Routes
// Controller per la pianificazione degli esami e l'esportazione iCalendar
// ============================================================================

import type { FastifyPluginAsync } from "fastify";
import {
  PlanRequestSchema,
  ExportIcsRequestSchema,
} from "../schemas/scheduler.schema";
import { buildAdjacencyList, topologicalSort } from "../../core/dag-engine";
import { scheduleExams } from "../../core/exam-scheduler";
import { buildTimeline } from "../../core/timeline-builder";
import { buildIcsCalendar } from "../../calendar/ics-builder";
import type { Course, ExamCall } from "../../core/types";

export const schedulerRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /api/scheduler/plan
   * Riceve i dati di esami, appelli, propedeuticità e vincoli;
   * esegue DAG check, CSP scheduling e timeline backward building;
   * restituisce il piano completo e le metriche di fattibilità.
   */
  fastify.post("/plan", async (request, reply) => {
    const validatedInput = PlanRequestSchema.parse(request.body);
    const { courses, prerequisites, examCalls, constraints } = validatedInput;

    const courseIds = courses.map((c) => c.id);
    const courseMap = new Map<string, Course>(courses.map((c) => [c.id, c]));

    // 1. Verifica ordinamento topologico e assenza di cicli nel DAG
    const adj = buildAdjacencyList(courseIds, prerequisites);
    topologicalSort(adj);

    // 2. Risoluzione degli appelli tramite Constraint Satisfaction & Backtracking
    const scheduleResult = scheduleExams(
      courseIds,
      prerequisites,
      examCalls,
      constraints
    );

    // 3. Generazione della timeline di studio a ritroso
    const plan = buildTimeline({
      courses,
      scheduleResult,
      constraints,
    });

    // 4. Formattazione dell'output JSON e calcolo delle metriche
    const scheduledExamsList = Array.from(plan.examSchedule.entries()).map(
      ([courseId, call]) => {
        const course = courseMap.get(courseId);
        return {
          courseId,
          courseName: course?.nome ?? courseId,
          examCall: call,
        };
      }
    );

    const studySessionsList = plan.studySessions.map((session) => {
      const course = courseMap.get(session.courseId);
      return {
        courseId: session.courseId,
        courseName: course?.nome ?? session.courseId,
        data: session.data.toISOString(),
        orePianificate: session.orePianificate,
      };
    });

    const totalStudyHours = Math.round(
      plan.studySessions.reduce((acc, s) => acc + s.orePianificate, 0) * 10
    ) / 10;

    const uniqueStudyDays = new Set(
      plan.studySessions.map((s) => s.data.toISOString().slice(0, 10))
    ).size;

    const examDates = Array.from(plan.examSchedule.values()).map((c) =>
      new Date(c.dataOra).getTime()
    );
    const lastExamTimestamp = examDates.length > 0 ? Math.max(...examDates) : null;
    const firstStudyDate =
      plan.studySessions.length > 0
        ? plan.studySessions[0].data.toISOString()
        : constraints.dataInizioPianificazione.toISOString();

    const metrics = {
      totalCourses: courses.length,
      totalStudyHours,
      totalStudyDays: uniqueStudyDays,
      totalExamDays: plan.examSchedule.size,
      totalCost: plan.totalCost,
      startDate: firstStudyDate,
      lastExamDate: lastExamTimestamp ? new Date(lastExamTimestamp).toISOString() : null,
    };

    return reply.status(200).send({
      success: true,
      plan: {
        examSchedule: scheduledExamsList,
        studySessions: studySessionsList,
        totalCost: plan.totalCost,
      },
      metrics,
    });
  });

  /**
   * POST /api/scheduler/export-ics
   * Esporta il piano calcolato in formato standard RFC 5545 iCalendar (.ics).
   */
  fastify.post("/export-ics", async (request, reply) => {
    const validated = ExportIcsRequestSchema.parse(request.body);

    let icsContent: string;

    if ("constraints" in validated) {
      // Caso 1: Ricevuto payload grezzo di pianificazione
      const { courses, prerequisites, examCalls, constraints } = validated;
      const courseIds = courses.map((c) => c.id);

      const adj = buildAdjacencyList(courseIds, prerequisites);
      topologicalSort(adj);

      const scheduleResult = scheduleExams(
        courseIds,
        prerequisites,
        examCalls,
        constraints
      );

      const plan = buildTimeline({
        courses,
        scheduleResult,
        constraints,
      });

      icsContent = buildIcsCalendar({
        calendarName: "Piano di Studi UniPlan",
        courses,
        examSchedule: plan.examSchedule,
        studySessions: plan.studySessions,
      });
    } else {
      // Caso 2: Ricevuto piano pre-calcolato
      const { calendarName, courses, examSchedule, studySessions } = validated;
      icsContent = buildIcsCalendar({
        calendarName: calendarName ?? "Piano di Studi UniPlan",
        courses,
        examSchedule,
        studySessions,
      });
    }

    return reply
      .status(200)
      .header("Content-Type", "text/calendar; charset=utf-8")
      .header(
        "Content-Disposition",
        'attachment; filename="piano-studi.ics"'
      )
      .send(icsContent);
  });
};
