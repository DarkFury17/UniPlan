// ============================================================================
// UniPlan — Template per Corsi di Laurea / Facoltà Preconfigurate
// Consente di precompilare il piano di studio in 1 click riducendo i click a zero.
// ============================================================================

import type { Course, PrerequisiteEdge, ExamCall, SchedulingConstraints } from "../types";

export interface DegreePreset {
  id: string;
  name: string;
  university: string;
  department: string;
  tag: string;
  description: string;
  constraints: SchedulingConstraints;
  courses: Course[];
  prerequisites: PrerequisiteEdge[];
  examCalls: ExamCall[];
}

export const DEGREE_PRESETS: DegreePreset[] = [
  {
    id: "cs-triennale",
    name: "Informatica (L-31)",
    university: "Università degli Studi",
    department: "Scienze e Tecnologie Informatiche",
    tag: "Scienze / STEM",
    description: "Sessione estiva con propedeuticità matematiche, programmazione, basi di dati e sistemi.",
    constraints: {
      oreStudioGiornaliereMax: 6,
      giorniBufferMinimi: 3,
      dataInizioPianificazione: "2026-05-15",
    },
    courses: [
      { id: "anal1", codice: "MAT/05", nome: "Analisi Matematica 1", cfu: 9, semestre: 1, annoCorso: 1, difficoltaStimata: 5 },
      { id: "prog1", codice: "INF/01", nome: "Programmazione 1 & Lab", cfu: 9, semestre: 1, annoCorso: 1, difficoltaStimata: 3 },
      { id: "arch1", codice: "ING-INF/05", nome: "Architettura degli Elaboratori", cfu: 6, semestre: 2, annoCorso: 1, difficoltaStimata: 4 },
      { id: "alg1", codice: "INF/01", nome: "Algoritmi e Strutture Dati", cfu: 9, semestre: 1, annoCorso: 2, difficoltaStimata: 5 },
      { id: "so1", codice: "ING-INF/05", nome: "Sistemi Operativi", cfu: 9, semestre: 1, annoCorso: 2, difficoltaStimata: 4 },
      { id: "db1", codice: "ING-INF/05", nome: "Basi di Dati", cfu: 6, semestre: 2, annoCorso: 2, difficoltaStimata: 3 },
      { id: "ret1", codice: "ING-INF/05", nome: "Reti di Calcolatori", cfu: 6, semestre: 2, annoCorso: 2, difficoltaStimata: 3 },
      { id: "ing1", codice: "INF/01", nome: "Ingegneria del Software", cfu: 6, semestre: 1, annoCorso: 3, difficoltaStimata: 3 },
    ],
    prerequisites: [
      { courseId: "alg1", prerequisiteCourseId: "prog1" },
      { courseId: "so1", prerequisiteCourseId: "arch1" },
      { courseId: "db1", prerequisiteCourseId: "alg1" },
      { courseId: "ret1", prerequisiteCourseId: "arch1" },
      { courseId: "ing1", prerequisiteCourseId: "prog1" },
    ],
    examCalls: [
      { id: "call-anal1-1", courseId: "anal1", dataOra: "2026-06-10T09:00:00.000Z", aula: "Aula Magna Matematica", tipoProva: "SCRITTO" },
      { id: "call-anal1-2", courseId: "anal1", dataOra: "2026-07-02T09:00:00.000Z", aula: "Aula Magna Matematica", tipoProva: "SCRITTO" },
      { id: "call-prog1-1", courseId: "prog1", dataOra: "2026-06-15T09:00:00.000Z", aula: "Laboratorio Turing", tipoProva: "SCRITTO_ORALE" },
      { id: "call-prog1-2", courseId: "prog1", dataOra: "2026-07-08T09:00:00.000Z", aula: "Laboratorio Turing", tipoProva: "SCRITTO_ORALE" },
      { id: "call-arch1-1", courseId: "arch1", dataOra: "2026-06-18T14:30:00.000Z", aula: "Aula 4", tipoProva: "SCRITTO" },
      { id: "call-arch1-2", courseId: "arch1", dataOra: "2026-07-12T14:30:00.000Z", aula: "Aula 4", tipoProva: "SCRITTO" },
      { id: "call-alg1-1", courseId: "alg1", dataOra: "2026-06-25T09:00:00.000Z", aula: "Aula 1", tipoProva: "SCRITTO_ORALE" },
      { id: "call-alg1-2", courseId: "alg1", dataOra: "2026-07-18T09:00:00.000Z", aula: "Aula 1", tipoProva: "SCRITTO_ORALE" },
      { id: "call-so1-1", courseId: "so1", dataOra: "2026-06-29T10:00:00.000Z", aula: "Aula Magna Ingegneria", tipoProva: "SCRITTO_ORALE" },
      { id: "call-so1-2", courseId: "so1", dataOra: "2026-07-22T10:00:00.000Z", aula: "Aula Magna Ingegneria", tipoProva: "SCRITTO_ORALE" },
      { id: "call-db1-1", courseId: "db1", dataOra: "2026-07-05T09:30:00.000Z", aula: "Laboratorio Hopper", tipoProva: "PROGETTO" },
      { id: "call-db1-2", courseId: "db1", dataOra: "2026-07-25T09:30:00.000Z", aula: "Laboratorio Hopper", tipoProva: "PROGETTO" },
      { id: "call-ret1-1", courseId: "ret1", dataOra: "2026-07-10T11:00:00.000Z", aula: "Aula 5", tipoProva: "ORALE" },
      { id: "call-ret1-2", courseId: "ret1", dataOra: "2026-07-28T11:00:00.000Z", aula: "Aula 5", tipoProva: "ORALE" },
      { id: "call-ing1-1", courseId: "ing1", dataOra: "2026-07-15T15:00:00.000Z", aula: "Aula 2", tipoProva: "PROGETTO" },
      { id: "call-ing1-2", courseId: "ing1", dataOra: "2026-07-30T15:00:00.000Z", aula: "Aula 2", tipoProva: "PROGETTO" },
    ],
  },
  {
    id: "econ-triennale",
    name: "Economia e Management (L-18)",
    university: "Università degli Studi",
    department: "Dipartimento di Scienze Aziendali",
    tag: "Economico",
    description: "Percorso con microeconomia, contabilità di bilancio, statistica ed economia aziendale.",
    constraints: {
      oreStudioGiornaliereMax: 5,
      giorniBufferMinimi: 3,
      dataInizioPianificazione: "2026-05-20",
    },
    courses: [
      { id: "micro1", codice: "SECS-P/01", nome: "Microeconomia", cfu: 9, semestre: 1, annoCorso: 1, difficoltaStimata: 4 },
      { id: "mat-gen", codice: "SECS-S/06", nome: "Matematica Generale", cfu: 9, semestre: 1, annoCorso: 1, difficoltaStimata: 4 },
      { id: "ec-az", codice: "SECS-P/07", nome: "Economia Aziendale", cfu: 9, semestre: 2, annoCorso: 1, difficoltaStimata: 3 },
      { id: "bil1", codice: "SECS-P/07", nome: "Bilancio e Contabilità", cfu: 6, semestre: 1, annoCorso: 2, difficoltaStimata: 4 },
      { id: "stat1", codice: "SECS-S/01", nome: "Statistica Metodologica", cfu: 9, semestre: 2, annoCorso: 1, difficoltaStimata: 4 },
      { id: "dir-priv", codice: "IUS/01", nome: "Diritto Privato", cfu: 9, semestre: 1, annoCorso: 1, difficoltaStimata: 3 },
    ],
    prerequisites: [
      { courseId: "micro1", prerequisiteCourseId: "mat-gen" },
      { courseId: "bil1", prerequisiteCourseId: "ec-az" },
      { courseId: "stat1", prerequisiteCourseId: "mat-gen" },
    ],
    examCalls: [
      { id: "call-matgen-1", courseId: "mat-gen", dataOra: "2026-06-08T09:00:00.000Z", aula: "Aula 3", tipoProva: "SCRITTO" },
      { id: "call-matgen-2", courseId: "mat-gen", dataOra: "2026-06-29T09:00:00.000Z", aula: "Aula 3", tipoProva: "SCRITTO" },
      { id: "call-micro-1", courseId: "micro1", dataOra: "2026-06-18T10:00:00.000Z", aula: "Aula Magna Economia", tipoProva: "SCRITTO" },
      { id: "call-micro-2", courseId: "micro1", dataOra: "2026-07-09T10:00:00.000Z", aula: "Aula Magna Economia", tipoProva: "SCRITTO" },
      { id: "call-ecaz-1", courseId: "ec-az", dataOra: "2026-06-12T14:00:00.000Z", aula: "Aula 7", tipoProva: "SCRITTO_ORALE" },
      { id: "call-ecaz-2", courseId: "ec-az", dataOra: "2026-07-03T14:00:00.000Z", aula: "Aula 7", tipoProva: "SCRITTO_ORALE" },
      { id: "call-stat-1", courseId: "stat1", dataOra: "2026-06-23T09:00:00.000Z", aula: "Aula 10", tipoProva: "SCRITTO" },
      { id: "call-stat-2", courseId: "stat1", dataOra: "2026-07-14T09:00:00.000Z", aula: "Aula 10", tipoProva: "SCRITTO" },
      { id: "call-bil-1", courseId: "bil1", dataOra: "2026-07-06T09:30:00.000Z", aula: "Aula 8", tipoProva: "SCRITTO" },
      { id: "call-bil-2", courseId: "bil1", dataOra: "2026-07-24T09:30:00.000Z", aula: "Aula 8", tipoProva: "SCRITTO" },
      { id: "call-dir-1", courseId: "dir-priv", dataOra: "2026-06-16T09:00:00.000Z", aula: "Aula 1", tipoProva: "ORALE" },
      { id: "call-dir-2", courseId: "dir-priv", dataOra: "2026-07-07T09:00:00.000Z", aula: "Aula 1", tipoProva: "ORALE" },
    ],
  },
  {
    id: "giur-magistrale",
    name: "Giurisprudenza (LMG/01)",
    university: "Università degli Studi",
    department: "Dipartimento di Scienze Giuridiche",
    tag: "Giuridico",
    description: "Sessione esami istituzionali: Diritto Privato, Costituzionale, Romano e Diritto Pubblico.",
    constraints: {
      oreStudioGiornaliereMax: 6,
      giorniBufferMinimi: 4,
      dataInizioPianificazione: "2026-05-18",
    },
    courses: [
      { id: "cost1", codice: "IUS/08", nome: "Diritto Costituzionale", cfu: 12, semestre: 1, annoCorso: 1, difficoltaStimata: 4 },
      { id: "priv1", codice: "IUS/01", nome: "Istituzioni di Diritto Privato 1", cfu: 9, semestre: 1, annoCorso: 1, difficoltaStimata: 4 },
      { id: "rom1", codice: "IUS/18", nome: "Diritto Romano (Istituzioni)", cfu: 9, semestre: 2, annoCorso: 1, difficoltaStimata: 4 },
      { id: "civ1", codice: "IUS/01", nome: "Diritto Civile", cfu: 12, semestre: 1, annoCorso: 2, difficoltaStimata: 5 },
    ],
    prerequisites: [
      { courseId: "civ1", prerequisiteCourseId: "priv1" },
    ],
    examCalls: [
      { id: "call-cost-1", courseId: "cost1", dataOra: "2026-06-11T09:00:00.000Z", aula: "Aula Magna Giurisprudenza", tipoProva: "ORALE" },
      { id: "call-cost-2", courseId: "cost1", dataOra: "2026-07-02T09:00:00.000Z", aula: "Aula Magna Giurisprudenza", tipoProva: "ORALE" },
      { id: "call-priv-1", courseId: "priv1", dataOra: "2026-06-18T09:00:00.000Z", aula: "Aula 5", tipoProva: "ORALE" },
      { id: "call-priv-2", courseId: "priv1", dataOra: "2026-07-10T09:00:00.000Z", aula: "Aula 5", tipoProva: "ORALE" },
      { id: "call-rom-1", courseId: "rom1", dataOra: "2026-06-25T09:00:00.000Z", aula: "Aula 2", tipoProva: "ORALE" },
      { id: "call-rom-2", courseId: "rom1", dataOra: "2026-07-17T09:00:00.000Z", aula: "Aula 2", tipoProva: "ORALE" },
      { id: "call-civ-1", courseId: "civ1", dataOra: "2026-07-01T09:00:00.000Z", aula: "Aula 4", tipoProva: "ORALE" },
      { id: "call-civ-2", courseId: "civ1", dataOra: "2026-07-23T09:00:00.000Z", aula: "Aula 4", tipoProva: "ORALE" },
    ],
  },
];
