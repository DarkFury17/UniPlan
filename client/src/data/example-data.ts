// ============================================================================
// UniPlan — Example Dataset (Informatica / Computer Science)
// Preset realistico per test istantaneo in 1 click
// ============================================================================

import type { Course, PrerequisiteEdge, ExamCall, SchedulingConstraints } from "../types";

export const DEFAULT_CONSTRAINTS: SchedulingConstraints = {
  oreStudioGiornaliereMax: 6,
  giorniBufferMinimi: 3,
  dataInizioPianificazione: "2026-05-15",
};

export const EXAMPLE_COURSES: Course[] = [
  {
    id: "anal1",
    codice: "MAT/05",
    nome: "Analisi Matematica 1",
    cfu: 9,
    semestre: 1,
    annoCorso: 1,
    difficoltaStimata: 5,
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
  {
    id: "arch1",
    codice: "ING-INF/05",
    nome: "Architettura degli Elaboratori",
    cfu: 6,
    semestre: 2,
    annoCorso: 1,
    difficoltaStimata: 4,
  },
  {
    id: "alg1",
    codice: "INF/01",
    nome: "Algoritmi e Strutture Dati",
    cfu: 9,
    semestre: 1,
    annoCorso: 2,
    difficoltaStimata: 5,
  },
  {
    id: "so1",
    codice: "ING-INF/05",
    nome: "Sistemi Operativi",
    cfu: 9,
    semestre: 1,
    annoCorso: 2,
    difficoltaStimata: 4,
  },
  {
    id: "db1",
    codice: "ING-INF/05",
    nome: "Basi di Dati",
    cfu: 6,
    semestre: 2,
    annoCorso: 2,
    difficoltaStimata: 3,
  },
  {
    id: "ret1",
    codice: "ING-INF/05",
    nome: "Reti di Calcolatori",
    cfu: 6,
    semestre: 2,
    annoCorso: 2,
    difficoltaStimata: 3,
  },
  {
    id: "ing1",
    codice: "INF/01",
    nome: "Ingegneria del Software",
    cfu: 6,
    semestre: 1,
    annoCorso: 3,
    difficoltaStimata: 3,
  },
];

export const EXAMPLE_PREREQUISITES: PrerequisiteEdge[] = [
  // Algoritmi richiede Programmazione 1
  { courseId: "alg1", prerequisiteCourseId: "prog1" },
  // Sistemi Operativi richiede Architettura degli Elaboratori
  { courseId: "so1", prerequisiteCourseId: "arch1" },
  // Basi di Dati richiede Algoritmi e Strutture Dati
  { courseId: "db1", prerequisiteCourseId: "alg1" },
  // Reti richiede Architettura degli Elaboratori
  { courseId: "ret1", prerequisiteCourseId: "arch1" },
  // Ingegneria del Software richiede Programmazione 1
  { courseId: "ing1", prerequisiteCourseId: "prog1" },
];

export const EXAMPLE_EXAM_CALLS: ExamCall[] = [
  // Analisi 1
  {
    id: "call-anal1-1",
    courseId: "anal1",
    dataOra: "2026-06-10T09:00:00.000Z",
    aula: "Aula Magna Matematica",
    tipoProva: "SCRITTO",
  },
  {
    id: "call-anal1-2",
    courseId: "anal1",
    dataOra: "2026-07-02T09:00:00.000Z",
    aula: "Aula Magna Matematica",
    tipoProva: "SCRITTO",
  },
  // Programmazione 1
  {
    id: "call-prog1-1",
    courseId: "prog1",
    dataOra: "2026-06-15T09:00:00.000Z",
    aula: "Laboratorio Turing",
    tipoProva: "SCRITTO_ORALE",
  },
  {
    id: "call-prog1-2",
    courseId: "prog1",
    dataOra: "2026-07-08T09:00:00.000Z",
    aula: "Laboratorio Turing",
    tipoProva: "SCRITTO_ORALE",
  },
  // Architettura
  {
    id: "call-arch1-1",
    courseId: "arch1",
    dataOra: "2026-06-18T14:30:00.000Z",
    aula: "Aula 4",
    tipoProva: "SCRITTO",
  },
  {
    id: "call-arch1-2",
    courseId: "arch1",
    dataOra: "2026-07-12T14:30:00.000Z",
    aula: "Aula 4",
    tipoProva: "SCRITTO",
  },
  // Algoritmi
  {
    id: "call-alg1-1",
    courseId: "alg1",
    dataOra: "2026-06-25T09:00:00.000Z",
    aula: "Aula 1",
    tipoProva: "SCRITTO_ORALE",
  },
  {
    id: "call-alg1-2",
    courseId: "alg1",
    dataOra: "2026-07-18T09:00:00.000Z",
    aula: "Aula 1",
    tipoProva: "SCRITTO_ORALE",
  },
  // Sistemi Operativi
  {
    id: "call-so1-1",
    courseId: "so1",
    dataOra: "2026-06-29T10:00:00.000Z",
    aula: "Aula Magna Ingegneria",
    tipoProva: "SCRITTO_ORALE",
  },
  {
    id: "call-so1-2",
    courseId: "so1",
    dataOra: "2026-07-22T10:00:00.000Z",
    aula: "Aula Magna Ingegneria",
    tipoProva: "SCRITTO_ORALE",
  },
  // Basi di Dati
  {
    id: "call-db1-1",
    courseId: "db1",
    dataOra: "2026-07-05T09:30:00.000Z",
    aula: "Laboratorio Hopper",
    tipoProva: "PROGETTO",
  },
  {
    id: "call-db1-2",
    courseId: "db1",
    dataOra: "2026-07-25T09:30:00.000Z",
    aula: "Laboratorio Hopper",
    tipoProva: "PROGETTO",
  },
  // Reti di Calcolatori
  {
    id: "call-ret1-1",
    courseId: "ret1",
    dataOra: "2026-07-10T11:00:00.000Z",
    aula: "Aula 5",
    tipoProva: "ORALE",
  },
  {
    id: "call-ret1-2",
    courseId: "ret1",
    dataOra: "2026-07-28T11:00:00.000Z",
    aula: "Aula 5",
    tipoProva: "ORALE",
  },
  // Ingegneria del Software
  {
    id: "call-ing1-1",
    courseId: "ing1",
    dataOra: "2026-07-15T15:00:00.000Z",
    aula: "Aula 2",
    tipoProva: "PROGETTO",
  },
  {
    id: "call-ing1-2",
    courseId: "ing1",
    dataOra: "2026-07-30T15:00:00.000Z",
    aula: "Aula 2",
    tipoProva: "PROGETTO",
  },
];
