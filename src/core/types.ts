// ============================================================================
// UniPlan — Core Types
// Interfacce TypeScript pure, completamente disaccoppiate dall'ORM
// ============================================================================

/**
 * Esame universitario con metadati per lo scheduling.
 */
export interface Course {
  readonly id: string;
  readonly codice?: string;
  readonly nome: string;
  readonly cfu: number;
  /** 1 o 2 */
  readonly semestre: 1 | 2;
  /** Anno di corso previsto (1-5) */
  readonly annoCorso: number;
  /** Difficoltà stimata (1-5), usata per calcolare il fabbisogno orario */
  readonly difficoltaStimata: number;
}

/**
 * Arco orientato nel DAG di propedeuticità.
 * Semantica: "courseId richiede prerequisiteCourseId".
 */
export interface PrerequisiteEdge {
  readonly courseId: string;
  readonly prerequisiteCourseId: string;
}

/**
 * Appello d'esame con data, luogo e tipo di prova.
 */
export interface ExamCall {
  readonly id: string;
  readonly courseId: string;
  readonly dataOra: Date;
  readonly aula?: string;
  readonly tipoProva: "SCRITTO" | "ORALE" | "PROGETTO" | "LABORATORIO" | "SCRITTO_ORALE";
}

/**
 * Vincoli per lo scheduler di esami.
 */
export interface SchedulingConstraints {
  /** Ore massime di studio al giorno */
  readonly oreStudioGiornaliereMax: number;
  /** Giorni di buffer minimo tra un esame e il successivo */
  readonly giorniBufferMinimi: number;
  /** Data di inizio pianificazione (da quando si può iniziare a studiare) */
  readonly dataInizioPianificazione: Date;
}

/**
 * Slot di studio singolo nella timeline generata.
 */
export interface StudySessionSlot {
  readonly courseId: string;
  readonly data: Date;
  readonly orePianificate: number;
}

/**
 * Piano generato dallo scheduler — contiene le date d'esame scelte
 * e le sessioni di studio distribuite sulla timeline.
 */
export interface GeneratedPlan {
  /** Mappa courseId → ExamCall scelto */
  readonly examSchedule: ReadonlyMap<string, ExamCall>;
  /** Sessioni di studio ordinate cronologicamente */
  readonly studySessions: readonly StudySessionSlot[];
  /** Costo totale del piano (più basso = migliore) */
  readonly totalCost: number;
}

/**
 * Risultato dell'ordinamento topologico con metadati di profondità.
 */
export interface TopologicalResult {
  /** Ordine topologico dei courseId */
  readonly order: readonly string[];
  /** Mappa courseId → profondità nel DAG (0 = nessun prerequisito) */
  readonly depth: ReadonlyMap<string, number>;
}
