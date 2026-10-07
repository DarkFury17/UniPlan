// ============================================================================
// UniPlan — iCalendar RFC 5545 Builder
// Generatore conforme alle specifiche RFC 5545 per esportazione calendario
// ============================================================================

import type { Course, ExamCall, StudySessionSlot } from "../core/types";

/**
 * Opzioni per la generazione del file .ics
 */
export interface IcsCalendarOptions {
  /** Nome del calendario / piano di studi */
  readonly calendarName?: string;
  /** Elenco dei corsi per risolvere i nomi e metadati */
  readonly courses: readonly Course[];
  /** Mappa o lista degli appelli d'esame schedulati */
  readonly examSchedule: ReadonlyMap<string, ExamCall> | readonly ExamCall[];
  /** Sessioni di studio pianificate */
  readonly studySessions: readonly StudySessionSlot[];
  /** Durata stimata in ore per gli esami (default: 2 ore) */
  readonly examDurationHours?: number;
}

// ---------------------------------------------------------------------------
// Utilità RFC 5545
// ---------------------------------------------------------------------------

/**
 * Formatta un oggetto Date nel formato UTC iCalendar: YYYYMMDDTHHmmssZ
 */
export function formatIcsUtc(date: Date): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const mins = pad(d.getUTCMinutes());
  const secs = pad(d.getUTCSeconds());
  return `${year}${month}${day}T${hours}${mins}${secs}Z`;
}

/**
 * Effettua l'escape dei caratteri speciali nei campi di testo secondo RFC 5545:
 * '\\' -> '\\\\'
 * ';'  -> '\\;'
 * ','  -> '\\,'
 * '\n' -> '\\n'
 */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Esegue il line folding RFC 5545 (massimo 75 ottetti per riga).
 * Le righe successive iniziano con uno spazio.
 */
export function foldIcsLine(line: string): string {
  if (line.length <= 75) {
    return line;
  }
  let result = "";
  let remaining = line;
  
  result += remaining.substring(0, 75);
  remaining = remaining.substring(75);

  while (remaining.length > 74) {
    result += "\r\n " + remaining.substring(0, 74);
    remaining = remaining.substring(74);
  }

  if (remaining.length > 0) {
    result += "\r\n " + remaining;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Builder Principale
// ---------------------------------------------------------------------------

/**
 * Costruisce una stringa iCalendar (RFC 5545) completa contenente
 * sia gli esami schedulati (con allarme 24h prima) che le sessioni di studio.
 */
export function buildIcsCalendar(options: IcsCalendarOptions): string {
  const {
    calendarName = "Piano di Studi UniPlan",
    courses,
    examSchedule,
    studySessions,
    examDurationHours = 2,
  } = options;

  const courseMap = new Map<string, Course>(courses.map((c) => [c.id, c]));
  const now = new Date();
  const dtstamp = formatIcsUtc(now);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UniPlan//Study Plan Generator//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    "X-WR-TIMEZONE:UTC",
  ];

  // 1. Normalizza examSchedule in array di ExamCall
  const exams: ExamCall[] =
    examSchedule instanceof Map
      ? Array.from(examSchedule.values())
      : Array.isArray(examSchedule)
      ? examSchedule
      : Object.values(examSchedule);

  // 2. Aggiungi VEVENT per ogni esame schedulato
  for (const exam of exams) {
    const course = courseMap.get(exam.courseId);
    const courseName = course ? course.nome : `Esame ${exam.courseId}`;
    const courseCode = course?.codice ? ` [${course.codice}]` : "";
    const startDate = new Date(exam.dataOra);
    const endDate = new Date(startDate.getTime() + examDurationHours * 3600 * 1000);

    const summary = `Esame: ${courseName}${courseCode}`;
    const description = `Prova d'esame (${exam.tipoProva}) per ${courseName}. CFU: ${course?.cfu ?? "N/A"}.`;
    const location = exam.aula ?? "Da definire";
    const uid = `exam-${exam.courseId}-${exam.id}@uniplan.local`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART:${formatIcsUtc(startDate)}`);
    lines.push(`DTEND:${formatIcsUtc(endDate)}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push(`LOCATION:${escapeIcsText(location)}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("CATEGORIES:EXAM,ACADEMIC");

    // Allarme promemoria 24 ore prima (RFC 5545: -P1D)
    lines.push("BEGIN:VALARM");
    lines.push("ACTION:DISPLAY");
    lines.push(`DESCRIPTION:Promemoria: ${escapeIcsText(summary)} domani alle ${startDate.toISOString().substring(11, 16)} UTC`);
    lines.push("TRIGGER:-P1D");
    lines.push("END:VALARM");

    lines.push("END:VEVENT");
  }

  // 3. Aggiungi VEVENT per ogni blocco/sessione di studio
  studySessions.forEach((session, index) => {
    const course = courseMap.get(session.courseId);
    const courseName = course ? course.nome : `Corso ${session.courseId}`;
    const sessionDate = new Date(session.data);
    
    // Default orario inizio studio: ore 09:00 UTC se non specificato
    const startDate = new Date(sessionDate);
    if (startDate.getUTCHours() === 0 && startDate.getUTCMinutes() === 0) {
      startDate.setUTCHours(9, 0, 0, 0);
    }
    const durationMs = session.orePianificate * 3600 * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);

    const dateStr = sessionDate.toISOString().substring(0, 10);
    const uid = `study-${session.courseId}-${dateStr}-${index}@uniplan.local`;
    const summary = `Studio: ${courseName} (${session.orePianificate}h)`;
    const description = `Sessione di studio pianificata per ${courseName}. Monte ore previsto: ${session.orePianificate} ore.`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART:${formatIcsUtc(startDate)}`);
    lines.push(`DTEND:${formatIcsUtc(endDate)}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("CATEGORIES:STUDY,PLANNING");
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  // Applica line folding e join con CRLF standard RFC 5545
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}
