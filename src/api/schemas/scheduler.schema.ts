// ============================================================================
// UniPlan — Scheduler Request & Response Validation Schemas (Zod)
// ============================================================================

import { z } from "zod";

/** Schema di validazione per un singolo Corso */
export const CourseSchema = z.object({
  id: z.string().min(1, "L'id del corso è obbligatorio"),
  codice: z.string().optional(),
  nome: z.string().min(1, "Il nome del corso è obbligatorio"),
  cfu: z.number().int().min(1, "I CFU devono essere almeno 1"),
  semestre: z.union([z.literal(1), z.literal(2)]),
  annoCorso: z.number().int().min(1).max(6),
  difficoltaStimata: z.number().int().min(1).max(5),
});

/** Schema per l'arco di propedeuticità (DAG) */
export const PrerequisiteEdgeSchema = z.object({
  courseId: z.string().min(1, "courseId è obbligatorio"),
  prerequisiteCourseId: z.string().min(1, "prerequisiteCourseId è obbligatorio"),
});

/** Schema per l'appello d'esame */
export const ExamCallSchema = z.object({
  id: z.string().min(1, "L'id dell'appello è obbligatorio"),
  courseId: z.string().min(1, "courseId è obbligatorio"),
  dataOra: z.coerce.date({
    message: "dataOra deve essere una data valida ISO-8601",
  }),
  aula: z.string().optional(),
  tipoProva: z.enum(["SCRITTO", "ORALE", "PROGETTO", "LABORATORIO", "SCRITTO_ORALE"]),
});

/**
 * Schema per i vincoli di scheduling.
 * Supporta sia i nomi canonici (oreStudioGiornaliereMax, giorniBufferMinimi, dataInizioPianificazione)
 * sia gli alias abbreviati (oreGiornaliereMax, bufferGiorniMinimo, dataInizioPreparazione).
 */
export const SchedulingConstraintsSchema = z
  .object({
    oreStudioGiornaliereMax: z.number().positive().max(24).optional(),
    oreGiornaliereMax: z.number().positive().max(24).optional(),
    giorniBufferMinimi: z.number().int().min(0).optional(),
    bufferGiorniMinimo: z.number().int().min(0).optional(),
    dataInizioPianificazione: z.coerce.date().optional(),
    dataInizioPreparazione: z.coerce.date().optional(),
  })
  .transform((val, ctx) => {
    const oreMax = val.oreStudioGiornaliereMax ?? val.oreGiornaliereMax;
    const buffer = val.giorniBufferMinimi ?? val.bufferGiorniMinimo;
    const dataInizio = val.dataInizioPianificazione ?? val.dataInizioPreparazione;

    if (oreMax === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "È obbligatorio specificare 'oreStudioGiornaliereMax' o 'oreGiornaliereMax'",
        path: ["oreStudioGiornaliereMax"],
      });
    }
    if (buffer === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "È obbligatorio specificare 'giorniBufferMinimi' o 'bufferGiorniMinimo'",
        path: ["giorniBufferMinimi"],
      });
    }
    if (dataInizio === undefined || isNaN(dataInizio.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "È obbligatorio specificare 'dataInizioPianificazione' o 'dataInizioPreparazione' valida",
        path: ["dataInizioPianificazione"],
      });
    }

    return {
      oreStudioGiornaliereMax: oreMax ?? 6,
      giorniBufferMinimi: buffer ?? 3,
      dataInizioPianificazione: dataInizio ?? new Date(),
    };
  });

/** Schema per la richiesta di generazione del piano di studio */
export const PlanRequestSchema = z.object({
  courses: z.array(CourseSchema).min(1, "Devi specificare almeno un corso"),
  prerequisites: z.array(PrerequisiteEdgeSchema).default([]),
  examCalls: z.array(ExamCallSchema).min(1, "Devi specificare almeno un appello d'esame"),
  constraints: SchedulingConstraintsSchema,
});

export type PlanRequestInput = z.infer<typeof PlanRequestSchema>;

/** Schema per la sessione di studio esportata */
export const StudySessionSlotSchema = z.object({
  courseId: z.string(),
  data: z.coerce.date(),
  orePianificate: z.number(),
});

/** Schema flessibile per export-ics */
export const ExportIcsRequestSchema = z.union([
  PlanRequestSchema,
  z.object({
    calendarName: z.string().optional(),
    courses: z.array(CourseSchema).min(1),
    examSchedule: z.array(ExamCallSchema),
    studySessions: z.array(StudySessionSlotSchema),
  }),
]);

export type ExportIcsRequestInput = z.infer<typeof ExportIcsRequestSchema>;
