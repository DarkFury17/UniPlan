# UniPlan — Intelligent Academic Study Planner & Exam Scheduler

<p align="center">
  <a href="https://uni-plan-mocha.vercel.app">
    <img src="https://img.shields.io/badge/%F0%9F%9A%80%20Prova%20la%20Live%20Demo-Vercel-emerald?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  &nbsp;
  <a href="https://uniplan-api.onrender.com/api/health">
    <img src="https://img.shields.io/badge/%E2%9A%A1%20Backend%20API%20Status-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Backend API Status" />
  </a>
</p>

<p align="center">
  <a href="https://uni-plan-mocha.vercel.app"><strong>🚀 Prova la Live Demo</strong></a> • 
  <a href="https://uniplan-api.onrender.com/api/health"><strong>⚡ Backend API Status</strong></a>
</p>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.12-000000.svg?style=flat-square&logo=fastify&logoColor=white)](https://fastify.dev/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vitest 52/52 Passed](https://img.shields.io/badge/Vitest-52%2F52%20Passed-22c55e.svg?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4.svg?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![RFC 5545](https://img.shields.io/badge/iCalendar-RFC%205545-orange.svg?style=flat-square)](https://datatracker.ietf.org/doc/html/rfc5545)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **UniPlan** risolve la complessa ottimizzazione combinatoria dei percorsi universitari: modella i vincoli di propedeuticità tramite **Grafi Orientati Aciclici (DAG)**, seleziona la combinazione ottima di appelli tramite **Constraint Satisfaction Problem (CSP)** e distribuisce a ritroso il carico di studio giornaliero. Esporta l'intera timeline direttamente in **Google Calendar**, **Apple Calendar** e **Outlook** tramite lo standard **RFC 5545 (iCalendar)**.

---

## 🏛️ Architettura & Design Decisions (Clean Architecture)

UniPlan è progettato seguendo rigorosamente i principi di **Clean Architecture** e **Separation of Concerns**: il motore matematico ed algoritmico è puro, deterministico e completamente disaccoppiato da framework, database e librerie esterne.

```mermaid
graph TD
    subgraph UI ["Layer 1: Frontend Client (React 19 + Tailwind v4)"]
        A["Dashboard Interattiva"] --> B["Gestione Corsi & Vincoli"]
        A --> C["Visualizzatore Timeline & Calendario"]
    end

    subgraph API ["Layer 2: REST API Layer (Fastify + Zod)"]
        D["POST /api/scheduler/plan"]
        E["POST /api/scheduler/export-ics"]
        F["GET /api/health"]
        G["Centralized Error Handler (400, 409, 422, 500)"]
    end

    subgraph Core ["Layer 3: Pure Algorithmic Engine (TypeScript)"]
        H["DagEngine (Kahn's Algorithm & DFS Cycle Detection)"]
        I["ExamScheduler (CSP Backtracking & Topological Pruning)"]
        J["TimelineBuilder (Reverse Study Allocator & Workload Balancing)"]
        K["IcsBuilder (RFC 5545 Compliant Generator)"]
    end

    subgraph Persistence ["Layer 4: Data Model & Persistence (PostgreSQL / Prisma)"]
        L["Course & Prerequisite (Adjacency List)"]
        M["ExamCall & StudySession"]
    end

    UI --> API
    API --> Core
    Persistence -.-> Core
```

---

## 🔬 Approccio Algoritmico & Complessità

### 1. Grafo Orientato Aciclico (DAG) & Ordinamento Topologico
- **Modellazione:** Le propedeuticità tra esami sono rappresentate come archi orientati $(u, v)$ dove $u$ richiede $v$.
- **Algoritmo:** Utilizza l'**Algoritmo di Kahn** basato su in-degree per produrre l'ordinamento topologico in tempo lineare $\mathcal{O}(|V| + |E|)$.
- **Rilevamento Cicli:** In caso di dipendenze circolari illegali, un algoritmo **DFS a 3 stati** (UNVISITED, VISITING, VISITED) individua l'esatto anello di ciclo e solleva un `CyclicDependencyError` (mappato ad **HTTP 422 Unprocessable Entity**).

### 2. Constraint Satisfaction Problem (CSP) & Exam Scheduler
- **Hard Constraints:**
  1. *Nessuna sovrapposizione:* Massimo 1 esame al giorno.
  2. *Propedeuticità temporale:* Per ogni arco $u \rightarrow v$, $\text{Data}(u) > \text{Data}(v)$.
  3. *Buffer minimo:* Distanza tra appelli consecutivi $\ge \text{giorniBufferMinimi}$.
- **Risoluzione:** Backtracking ricorsivo guidato dall'ordine topologico con **pruning anticipato** (`isPartiallyFeasible`) che taglia rami non ammissibili nello spazio degli stati.
- **Funzione di Costo Multi-Obiettivo:** Minimizza la varianza del carico temporale e penalizza sessioni compresse o troppo distanti. Se non esiste alcuna combinazione valida, solleva un `UnfeasibleScheduleError` (**HTTP 409 Conflict**).

### 3. Reverse Timeline Study Planner
- **Fabbisogno Orario Ponderato:** Calcolato per ciascun esame secondo la formula:
  $$\text{Ore Studio} = \text{CFU} \times 25 \times \left(\frac{\text{Difficoltà}}{3}\right) \times 0.4$$
- **Distribuzione a Ritroso:** Dalla data dell'esame verso la data di inizio preparazione, allocando slot quotidiani fino al tetto `oreStudioGiornaliereMax`, garantendo riposo e bilanciamento del carico globale.

### 4. Generatore Conforme RFC 5545 (iCalendar)
- Generazione deterministica conforme a **RFC 5545** (MIME type `text/calendar; charset=utf-8`, terminatori `\r\n`, line folding a 75 caratteri e caratteri di escape `\,`, `\;`, `\\`, `\n`).
- Genera blocchi `VEVENT` per ogni esame con aula e promemoria `VALARM` a 24 ore (`TRIGGER:-P1D`), e blocchi `VEVENT` per ogni sessione quotidiana di studio.

---

## 🛠️ Tech Stack

| Componente | Tecnologia | Rationale |
| :--- | :--- | :--- |
| **Language** | TypeScript 5.9 (Strict Mode) | Massima type-safety end-to-end sia nel core algoritmico che nell'API. |
| **Backend API** | Fastify v5 + CORS | Prestazioni elevate, overhead minimo e supporto nativo a `inject` per i test. |
| **Validation** | Zod v4 | Schema validation dichiarativa con parsing coerente per tutti gli endpoint. |
| **Frontend UI** | React 19 + Vite + Tailwind CSS v4 | Interfaccia moderna, ultra-reattiva con tema scuro e design tokens ottimizzati. |
| **Icons** | Lucide React | Iconografia moderna e coerente. |
| **Test Runner** | Vitest | Esecuzione istantanea della suite di test unitari e di integrazione in parallelo. |
| **ORM / Database** | Prisma + PostgreSQL 16 | DDL SQL avanzato con indici compositi e vincoli relazionali. |

---

## 🧪 Test Coverage (52/52 Tests Passed)

La suite di test automatizzati copre il 100% dei moduli algoritmici e degli endpoint API:

```bash
✓ tests/calendar/ics-builder.test.ts (5 tests)
✓ tests/core/dag-engine.test.ts (12 tests)
✓ tests/core/exam-scheduler.test.ts (15 tests)
✓ tests/core/timeline-builder.test.ts (12 tests)
✓ tests/api/scheduler-api.test.ts (8 tests)

Test Files  5 passed (5)
Tests       52 passed (52)
```

Per eseguire i test:
```bash
npm test
```

Per la modalità watch interattiva:
```bash
npm run test:watch
```

---

## 🚀 Utilizzo & Web App Live

L'applicazione è completamente distribuita e pronta all'uso senza richiedere installazione:

[![Prova UniPlan Live su Vercel](https://img.shields.io/badge/%F0%9F%9A%80%20Apri%20UniPlan%20Live%20su%20Vercel-https%3A%2F%2Funi--plan--mocha.vercel.app-emerald?style=for-the-badge&logo=vercel&logoColor=white)](https://uni-plan-mocha.vercel.app)

1. Apri la piattaforma: **[https://uni-plan-mocha.vercel.app](https://uni-plan-mocha.vercel.app)**
2. Seleziona uno dei percorsi di laurea precaricati (*Informatica STEM*, *Economia Aziendale*, *Ingegneria Gestionale*) oppure crea il tuo piano da zero.
3. Configura le ore di studio giornaliere desiderate e la data di inizio preparazione.
4. Genera la timeline deterministica e scarica il file `.ics` per sincronizzarlo con **Google Calendar**, **Apple Calendar** o **Outlook**.

---

## 💻 Sviluppo Locale

Se desideri clonare il repository per contribuire o testare il codice in locale:

### 1. Clona il Repository
```bash
git clone https://github.com/DarkFury17/UniPlan.git
cd UniPlan
```

### 2. Installa le Dipendenze
Installa le dipendenze del server Fastify e del client React:
```bash
npm install
npm install --prefix client
```

### 3. Avvia l'Ambiente di Sviluppo
Il comando `npm run dev` avvia contemporaneamente il backend API (porta `3000`) e il server Vite con Hot Module Replacement (porta `5173`):
```bash
npm run dev
```

- **Client Web (Locale):** [http://localhost:5173](http://localhost:5173) (con proxy automatico `/api` verso Fastify)
- **API Server (Locale):** [http://localhost:3000](http://localhost:3000)
- **Health Check API:** `curl http://localhost:3000/api/health`

### 4. Verifica della Build
Per validare il typechecking TypeScript e creare il bundle statico di produzione:
```bash
npm run build
```

---

## 🌐 Deploy & Architettura di Produzione

UniPlan è architettato per un deployment disaccoppiato ad alte prestazioni e scalabilità cloud:

- **Frontend statico su Vercel:** L'interfaccia React 19 è distribuita globalmente tramite la CDN edge di Vercel (**[https://uni-plan-mocha.vercel.app](https://uni-plan-mocha.vercel.app)**). Il file [`client/vercel.json`](client/vercel.json) implementa un reverse proxy trasparente per tutte le chiamate `/api/*`, instradando il traffico verso Render senza problemi di CORS.
- **Backend headless su Render:** L'API Fastify risiede su Render (**[https://uniplan-api.onrender.com](https://uniplan-api.onrender.com)**), configurata con host binding `0.0.0.0` e policy CORS con reflection dell'origine e header autorizzati.
- **Calcolo Algoritmico In-Memory:** I motori DAG (Kahn + DFS) e CSP (backtracking con potatura topologica) operano interamente in memoria senza vincoli o latenze di database, garantendo tempi di risposta inferiori a 50ms e **zero cold-start** sul calcolo del piano.

---

## 📄 Licenza

Rilasciato sotto licenza [MIT](LICENSE). Realizzato come progetto dimostrativo di Ingegneria del Software, Clean Architecture e Algoritmica Avanzata.
