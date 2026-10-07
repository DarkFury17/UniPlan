// ============================================================================
// UniPlan — Seed Script
// Dati realistici: Corso di Laurea in Informatica / Ingegneria Informatica
// ============================================================================

import { PrismaClient, ExamType, StudySessionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database UniPlan...\n");

  // =========================================================================
  // 1. COURSES — Esami realistici di un CdL in Informatica
  // =========================================================================

  const courses = await Promise.all([
    prisma.course.create({
      data: {
        id: "corso_analisi1",
        codice: "MAT/05",
        nome: "Analisi Matematica 1",
        cfu: 9,
        semestre: 1,
        annoCorso: 1,
        difficoltaStimata: 4,
      },
    }),
    prisma.course.create({
      data: {
        id: "corso_prog1",
        codice: "INF/01",
        nome: "Programmazione 1",
        cfu: 12,
        semestre: 1,
        annoCorso: 1,
        difficoltaStimata: 3,
      },
    }),
    prisma.course.create({
      data: {
        id: "corso_algebra",
        codice: "MAT/02",
        nome: "Algebra Lineare e Geometria",
        cfu: 6,
        semestre: 2,
        annoCorso: 1,
        difficoltaStimata: 3,
      },
    }),
    prisma.course.create({
      data: {
        id: "corso_architettura",
        codice: "ING-INF/05",
        nome: "Architettura degli Elaboratori",
        cfu: 6,
        semestre: 2,
        annoCorso: 1,
        difficoltaStimata: 3,
      },
    }),
    prisma.course.create({
      data: {
        id: "corso_analisi2",
        codice: "MAT/05",
        nome: "Analisi Matematica 2",
        cfu: 6,
        semestre: 1,
        annoCorso: 2,
        difficoltaStimata: 5,
      },
    }),
    prisma.course.create({
      data: {
        id: "corso_asd",
        codice: "INF/01",
        nome: "Algoritmi e Strutture Dati",
        cfu: 9,
        semestre: 1,
        annoCorso: 2,
        difficoltaStimata: 4,
      },
    }),
    prisma.course.create({
      data: {
        id: "corso_basi_dati",
        codice: "ING-INF/05",
        nome: "Basi di Dati",
        cfu: 9,
        semestre: 2,
        annoCorso: 2,
        difficoltaStimata: 3,
      },
    }),
    prisma.course.create({
      data: {
        id: "corso_so",
        codice: "ING-INF/05",
        nome: "Sistemi Operativi",
        cfu: 9,
        semestre: 2,
        annoCorso: 2,
        difficoltaStimata: 4,
      },
    }),
  ]);

  console.log(`✅ Creati ${courses.length} esami`);

  // =========================================================================
  // 2. PREREQUISITES — Grafo di propedeuticità realistico
  // =========================================================================
  //
  //   Analisi 1 ──────────► Analisi 2
  //   Analisi 1 ──────────► Algebra Lineare (consigliato/formale)
  //   Prog 1 ─────────────► ASD
  //   Prog 1 ─────────────► Basi di Dati
  //   Prog 1 ─────────────► Sistemi Operativi
  //   Architettura ────────► Sistemi Operativi
  //   ASD ─────────────────► Basi di Dati (rafforza)
  //

  const prerequisites = await Promise.all([
    // Analisi 1 → Analisi 2
    prisma.prerequisite.create({
      data: {
        courseId: "corso_analisi2",
        prerequisiteCourseId: "corso_analisi1",
      },
    }),
    // Analisi 1 → Algebra Lineare
    prisma.prerequisite.create({
      data: {
        courseId: "corso_algebra",
        prerequisiteCourseId: "corso_analisi1",
      },
    }),
    // Prog 1 → ASD
    prisma.prerequisite.create({
      data: {
        courseId: "corso_asd",
        prerequisiteCourseId: "corso_prog1",
      },
    }),
    // Prog 1 → Basi di Dati
    prisma.prerequisite.create({
      data: {
        courseId: "corso_basi_dati",
        prerequisiteCourseId: "corso_prog1",
      },
    }),
    // ASD → Basi di Dati (ASD è anche prerequisito di BD)
    prisma.prerequisite.create({
      data: {
        courseId: "corso_basi_dati",
        prerequisiteCourseId: "corso_asd",
      },
    }),
    // Prog 1 → Sistemi Operativi
    prisma.prerequisite.create({
      data: {
        courseId: "corso_so",
        prerequisiteCourseId: "corso_prog1",
      },
    }),
    // Architettura → Sistemi Operativi
    prisma.prerequisite.create({
      data: {
        courseId: "corso_so",
        prerequisiteCourseId: "corso_architettura",
      },
    }),
  ]);

  console.log(`✅ Creati ${prerequisites.length} vincoli di propedeuticità`);

  // =========================================================================
  // 3. EXAM CALLS — 2 appelli per ciascun esame (sessione estiva + autunnale)
  // =========================================================================

  const examCallsData: {
    courseId: string;
    dataOra: Date;
    aula: string;
    tipoProva: ExamType;
  }[] = [
    // --- Analisi Matematica 1 ---
    { courseId: "corso_analisi1", dataOra: new Date("2027-01-15T09:00:00+01:00"), aula: "Aula Magna", tipoProva: ExamType.SCRITTO },
    { courseId: "corso_analisi1", dataOra: new Date("2027-02-12T09:00:00+01:00"), aula: "Aula T1",    tipoProva: ExamType.SCRITTO },

    // --- Programmazione 1 ---
    { courseId: "corso_prog1", dataOra: new Date("2027-01-20T10:00:00+01:00"), aula: "Lab Informatica 1", tipoProva: ExamType.SCRITTO },
    { courseId: "corso_prog1", dataOra: new Date("2027-02-17T10:00:00+01:00"), aula: "Lab Informatica 1", tipoProva: ExamType.SCRITTO },

    // --- Algebra Lineare ---
    { courseId: "corso_algebra", dataOra: new Date("2027-06-10T09:00:00+02:00"), aula: "Aula B2", tipoProva: ExamType.SCRITTO_ORALE },
    { courseId: "corso_algebra", dataOra: new Date("2027-07-08T09:00:00+02:00"), aula: "Aula B2", tipoProva: ExamType.SCRITTO_ORALE },

    // --- Architettura degli Elaboratori ---
    { courseId: "corso_architettura", dataOra: new Date("2027-06-15T14:00:00+02:00"), aula: "Aula C1", tipoProva: ExamType.SCRITTO },
    { courseId: "corso_architettura", dataOra: new Date("2027-07-13T14:00:00+02:00"), aula: "Aula C1", tipoProva: ExamType.SCRITTO },

    // --- Analisi Matematica 2 ---
    { courseId: "corso_analisi2", dataOra: new Date("2027-01-22T09:00:00+01:00"), aula: "Aula Magna", tipoProva: ExamType.SCRITTO },
    { courseId: "corso_analisi2", dataOra: new Date("2027-02-19T09:00:00+01:00"), aula: "Aula T1",    tipoProva: ExamType.SCRITTO },

    // --- Algoritmi e Strutture Dati ---
    { courseId: "corso_asd", dataOra: new Date("2027-01-25T10:00:00+01:00"), aula: "Aula A3",    tipoProva: ExamType.SCRITTO },
    { courseId: "corso_asd", dataOra: new Date("2027-02-22T10:00:00+01:00"), aula: "Aula A3",    tipoProva: ExamType.SCRITTO_ORALE },

    // --- Basi di Dati ---
    { courseId: "corso_basi_dati", dataOra: new Date("2027-06-20T09:30:00+02:00"), aula: "Lab Informatica 2", tipoProva: ExamType.PROGETTO },
    { courseId: "corso_basi_dati", dataOra: new Date("2027-07-18T09:30:00+02:00"), aula: "Lab Informatica 2", tipoProva: ExamType.PROGETTO },

    // --- Sistemi Operativi ---
    { courseId: "corso_so", dataOra: new Date("2027-06-25T14:30:00+02:00"), aula: "Aula D1",    tipoProva: ExamType.SCRITTO_ORALE },
    { courseId: "corso_so", dataOra: new Date("2027-07-23T14:30:00+02:00"), aula: "Aula D1",    tipoProva: ExamType.SCRITTO_ORALE },
  ];

  const examCalls = await Promise.all(
    examCallsData.map((ec) => prisma.examCall.create({ data: ec }))
  );

  console.log(`✅ Creati ${examCalls.length} appelli d'esame`);

  // =========================================================================
  // 4. STUDY PLAN — Piano di studio di esempio
  // =========================================================================

  const plan = await prisma.studyPlan.create({
    data: {
      id: "piano_sessione_invernale",
      nomePiano: "Sessione Invernale 2027 — Primo anno completamento",
      oreStudioGiornaliereTarget: 5.0,
      giorniBufferMinimi: 3,
    },
  });

  console.log(`✅ Creato piano di studio: "${plan.nomePiano}"`);

  // =========================================================================
  // 5. STUDY SESSIONS — Sessioni di studio per il piano
  //    Simulano 2 settimane di preparazione per Analisi 1 e Prog 1
  // =========================================================================

  const sessionsData: {
    studyPlanId: string;
    courseId: string;
    examCallId?: string;
    data: Date;
    orePianificate: number;
    stato: StudySessionStatus;
    note?: string;
  }[] = [
    // --- Settimana 1: focus Analisi 1 (appello 15 gen) ---
    { studyPlanId: plan.id, courseId: "corso_analisi1", data: new Date("2027-01-02T09:00:00+01:00"), orePianificate: 3,   stato: StudySessionStatus.COMPLETED, note: "Ripasso limiti e continuità" },
    { studyPlanId: plan.id, courseId: "corso_analisi1", data: new Date("2027-01-03T09:00:00+01:00"), orePianificate: 3.5, stato: StudySessionStatus.COMPLETED, note: "Derivate e teoremi fondamentali" },
    { studyPlanId: plan.id, courseId: "corso_prog1",    data: new Date("2027-01-03T14:00:00+01:00"), orePianificate: 2,   stato: StudySessionStatus.COMPLETED, note: "Esercizi su ricorsione" },
    { studyPlanId: plan.id, courseId: "corso_analisi1", data: new Date("2027-01-04T09:00:00+01:00"), orePianificate: 4,   stato: StudySessionStatus.COMPLETED, note: "Integrali e serie" },
    { studyPlanId: plan.id, courseId: "corso_prog1",    data: new Date("2027-01-05T10:00:00+01:00"), orePianificate: 3,   stato: StudySessionStatus.COMPLETED, note: "Strutture dati base: liste, pile, code" },

    // --- Settimana 2: intensificazione ---
    { studyPlanId: plan.id, courseId: "corso_analisi1", data: new Date("2027-01-07T09:00:00+01:00"), orePianificate: 5,   stato: StudySessionStatus.PLANNED, note: "Simulazione prova d'esame #1" },
    { studyPlanId: plan.id, courseId: "corso_prog1",    data: new Date("2027-01-08T10:00:00+01:00"), orePianificate: 4,   stato: StudySessionStatus.PLANNED, note: "OOP: ereditarietà e polimorfismo" },
    { studyPlanId: plan.id, courseId: "corso_analisi1", data: new Date("2027-01-09T09:00:00+01:00"), orePianificate: 4,   stato: StudySessionStatus.PLANNED, note: "Simulazione prova d'esame #2" },
    { studyPlanId: plan.id, courseId: "corso_prog1",    data: new Date("2027-01-10T10:00:00+01:00"), orePianificate: 3.5, stato: StudySessionStatus.PLANNED, note: "Gestione eccezioni e I/O" },

    // Buffer day prima degli esami
    { studyPlanId: plan.id, courseId: "corso_analisi1", data: new Date("2027-01-13T09:00:00+01:00"), orePianificate: 2,   stato: StudySessionStatus.PLANNED, note: "Ripasso leggero pre-esame" },
    { studyPlanId: plan.id, courseId: "corso_prog1",    data: new Date("2027-01-18T10:00:00+01:00"), orePianificate: 2,   stato: StudySessionStatus.PLANNED, note: "Ripasso leggero pre-esame" },
  ];

  const sessions = await Promise.all(
    sessionsData.map((s) => prisma.studySession.create({ data: s }))
  );

  console.log(`✅ Create ${sessions.length} sessioni di studio`);

  // =========================================================================
  // Riepilogo finale
  // =========================================================================

  console.log("\n" + "=".repeat(60));
  console.log("🎓 Seed completato con successo!");
  console.log("=".repeat(60));
  console.log(`   Esami:                  ${courses.length}`);
  console.log(`   Propedeuticità (archi): ${prerequisites.length}`);
  console.log(`   Appelli:                ${examCalls.length}`);
  console.log(`   Piani di studio:        1`);
  console.log(`   Sessioni di studio:     ${sessions.length}`);
  console.log("=".repeat(60));

  // Stampa il DAG in formato leggibile
  console.log("\n📊 Grafo propedeuticità (DAG):");
  const allPrereqs = await prisma.prerequisite.findMany({
    include: {
      course: { select: { nome: true } },
      prerequisiteCourse: { select: { nome: true } },
    },
  });
  for (const p of allPrereqs) {
    console.log(`   ${p.prerequisiteCourse.nome}  ──►  ${p.course.nome}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Errore durante il seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
