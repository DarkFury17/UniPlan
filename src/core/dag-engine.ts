// ============================================================================
// UniPlan — DAG Engine
// Ordinamento topologico, rilevamento cicli, percorso critico
// ============================================================================

import type { PrerequisiteEdge, TopologicalResult } from "./types";

// ---------------------------------------------------------------------------
// Errori personalizzati
// ---------------------------------------------------------------------------

/**
 * Lanciato quando il grafo di propedeuticità contiene un ciclo.
 * Il campo `cycle` contiene il percorso esatto del ciclo rilevato.
 */
export class CyclicDependencyError extends Error {
  public readonly cycle: readonly string[];

  constructor(cycle: readonly string[]) {
    const path = cycle.join(" → ");
    super(`Dipendenza ciclica rilevata: ${path}`);
    this.name = "CyclicDependencyError";
    this.cycle = cycle;
  }
}

// ---------------------------------------------------------------------------
// Lista di adiacenza
// ---------------------------------------------------------------------------

export interface AdjacencyList {
  /** Mappa courseId → Set di courseId prerequisiti (archi entranti) */
  readonly prerequisites: ReadonlyMap<string, ReadonlySet<string>>;
  /** Mappa courseId → Set di courseId dipendenti (archi uscenti) */
  readonly dependents: ReadonlyMap<string, ReadonlySet<string>>;
  /** Tutti i nodi del grafo */
  readonly nodes: ReadonlySet<string>;
}

/**
 * Costruisce la lista di adiacenza bidirezionale dal set di archi.
 *
 * @param courseIds - Tutti gli ID dei corsi (inclusi quelli senza archi)
 * @param edges - Archi di propedeuticità
 */
export function buildAdjacencyList(
  courseIds: readonly string[],
  edges: readonly PrerequisiteEdge[]
): AdjacencyList {
  const prerequisites = new Map<string, Set<string>>();
  const dependents = new Map<string, Set<string>>();
  const nodes = new Set<string>(courseIds);

  // Inizializza tutti i nodi
  for (const id of courseIds) {
    prerequisites.set(id, new Set());
    dependents.set(id, new Set());
  }

  // Popola archi
  for (const edge of edges) {
    // courseId richiede prerequisiteCourseId
    // Quindi prerequisiteCourseId → courseId è un arco "dipendente"
    const prereqSet = prerequisites.get(edge.courseId);
    if (prereqSet) {
      prereqSet.add(edge.prerequisiteCourseId);
    } else {
      prerequisites.set(edge.courseId, new Set([edge.prerequisiteCourseId]));
      nodes.add(edge.courseId);
    }

    const depSet = dependents.get(edge.prerequisiteCourseId);
    if (depSet) {
      depSet.add(edge.courseId);
    } else {
      dependents.set(edge.prerequisiteCourseId, new Set([edge.courseId]));
      nodes.add(edge.prerequisiteCourseId);
    }
  }

  return { prerequisites, dependents, nodes };
}

// ---------------------------------------------------------------------------
// Ordinamento Topologico — Algoritmo di Kahn
// ---------------------------------------------------------------------------

/**
 * Esegue l'ordinamento topologico usando l'algoritmo di Kahn (BFS).
 * Se il grafo contiene cicli, lancia `CyclicDependencyError`.
 *
 * @returns Ordine topologico e profondità di ciascun nodo
 */
export function topologicalSort(adj: AdjacencyList): TopologicalResult {
  // Calcola l'in-degree mutabile
  const inDegree = new Map<string, number>();
  for (const node of adj.nodes) {
    const prereqs = adj.prerequisites.get(node);
    inDegree.set(node, prereqs ? prereqs.size : 0);
  }

  // Coda iniziale: nodi senza prerequisiti
  const queue: string[] = [];
  const depth = new Map<string, number>();

  for (const [node, deg] of inDegree) {
    if (deg === 0) {
      queue.push(node);
      depth.set(node, 0);
    }
  }

  const order: string[] = [];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];
    order.push(current);

    const currentDepth = depth.get(current)!;
    const deps = adj.dependents.get(current);
    if (!deps) continue;

    for (const dependent of deps) {
      const newDeg = inDegree.get(dependent)! - 1;
      inDegree.set(dependent, newDeg);

      // Aggiorna la profondità: max tra la profondità corrente e quella dal nuovo predecessore
      const existingDepth = depth.get(dependent);
      const candidateDepth = currentDepth + 1;
      if (existingDepth === undefined || candidateDepth > existingDepth) {
        depth.set(dependent, candidateDepth);
      }

      if (newDeg === 0) {
        queue.push(dependent);
      }
    }
  }

  // Se non tutti i nodi sono stati visitati, c'è un ciclo
  if (order.length !== adj.nodes.size) {
    const cycle = detectCycleDFS(adj);
    throw new CyclicDependencyError(cycle);
  }

  return { order, depth };
}

// ---------------------------------------------------------------------------
// Rilevamento cicli (DFS a 3 stati) — per il messaggio d'errore dettagliato
// ---------------------------------------------------------------------------

const enum VisitState {
  UNVISITED = 0,
  IN_STACK = 1,
  DONE = 2,
}

/**
 * Rileva un ciclo nel grafo usando DFS a tre stati.
 * Restituisce il percorso del ciclo (es. ["A", "B", "C", "A"]).
 */
function detectCycleDFS(adj: AdjacencyList): string[] {
  const state = new Map<string, VisitState>();
  for (const node of adj.nodes) {
    state.set(node, VisitState.UNVISITED);
  }

  const parent = new Map<string, string | null>();

  for (const startNode of adj.nodes) {
    if (state.get(startNode) !== VisitState.UNVISITED) continue;

    const stack: string[] = [startNode];
    parent.set(startNode, null);

    while (stack.length > 0) {
      const node = stack[stack.length - 1];
      const nodeState = state.get(node)!;

      if (nodeState === VisitState.UNVISITED) {
        state.set(node, VisitState.IN_STACK);

        // Visita i prerequisiti: node richiede prereq, quindi l'arco nel grafo delle
        // dipendenze va da prereq → node. Per cercare cicli, seguiamo gli archi
        // "node ha prerequisito prereq" che equivale a "node dipende da prereq".
        // In termini di ciclo: se prereq è IN_STACK, abbiamo un ciclo.
        const prereqs = adj.prerequisites.get(node);
        if (prereqs) {
          for (const prereq of prereqs) {
            const prereqState = state.get(prereq);

            if (prereqState === VisitState.IN_STACK) {
              // Ciclo trovato! Ricostruisci il percorso
              return reconstructCycle(parent, node, prereq);
            }

            if (prereqState === VisitState.UNVISITED) {
              parent.set(prereq, node);
              stack.push(prereq);
            }
          }
        }
      } else {
        // Backtrack
        state.set(node, VisitState.DONE);
        stack.pop();
      }
    }
  }

  // Fallback (non dovrebbe accadere se chiamato dopo aver rilevato un ciclo con Kahn)
  return [];
}

/**
 * Ricostruisce il percorso ciclico dal nodo corrente al nodo back-edge.
 */
function reconstructCycle(
  parent: Map<string, string | null>,
  from: string,
  to: string
): string[] {
  const cycle: string[] = [to, from];
  let current = from;

  while (current !== to) {
    const p = parent.get(current);
    if (p === null || p === undefined) break;
    cycle.push(p);
    current = p;
  }

  return cycle.reverse();
}

// ---------------------------------------------------------------------------
// Percorso critico
// ---------------------------------------------------------------------------

/**
 * Calcola la lunghezza del percorso critico (la profondità massima nel DAG).
 * Utile per stimare il tempo minimo di completamento del curriculum.
 */
export function criticalPathLength(result: TopologicalResult): number {
  let max = 0;
  for (const d of result.depth.values()) {
    if (d > max) max = d;
  }
  return max;
}

/**
 * Restituisce i corsi "foglia" (nessun esame dipende da loro).
 * Questi sono tipicamente gli esami da fare per ultimi.
 */
export function getLeafCourses(adj: AdjacencyList): string[] {
  const leaves: string[] = [];
  for (const node of adj.nodes) {
    const deps = adj.dependents.get(node);
    if (!deps || deps.size === 0) {
      leaves.push(node);
    }
  }
  return leaves;
}

/**
 * Restituisce i corsi "radice" (nessun prerequisito).
 * Questi sono i corsi che possono essere sostenuti immediatamente.
 */
export function getRootCourses(adj: AdjacencyList): string[] {
  const roots: string[] = [];
  for (const node of adj.nodes) {
    const prereqs = adj.prerequisites.get(node);
    if (!prereqs || prereqs.size === 0) {
      roots.push(node);
    }
  }
  return roots;
}
