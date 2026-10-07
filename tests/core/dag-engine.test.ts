// ============================================================================
// UniPlan — DAG Engine Tests
// ============================================================================

import { describe, it, expect } from "vitest";
import {
  buildAdjacencyList,
  topologicalSort,
  CyclicDependencyError,
  criticalPathLength,
  getRootCourses,
  getLeafCourses,
} from "../../src/core/dag-engine";
import type { PrerequisiteEdge } from "../../src/core/types";

// ---------------------------------------------------------------------------
// Helper per costruire edges concisi
// ---------------------------------------------------------------------------
function edge(courseId: string, prerequisiteCourseId: string): PrerequisiteEdge {
  return { courseId, prerequisiteCourseId };
}

// ===========================================================================
// SUITE: Grafi Aciclici
// ===========================================================================

describe("DAG Engine — Grafi Aciclici", () => {
  it("ordina correttamente una catena lineare A → B → C", () => {
    const ids = ["A", "B", "C"];
    // B richiede A, C richiede B
    const edges = [edge("B", "A"), edge("C", "B")];
    const adj = buildAdjacencyList(ids, edges);
    const result = topologicalSort(adj);

    // A deve apparire prima di B, B prima di C
    const orderIndex = new Map(result.order.map((id, i) => [id, i]));
    expect(orderIndex.get("A")!).toBeLessThan(orderIndex.get("B")!);
    expect(orderIndex.get("B")!).toBeLessThan(orderIndex.get("C")!);
    expect(result.order).toHaveLength(3);
  });

  it("gestisce un grafo a diamante: A → B, A → C, B → D, C → D", () => {
    const ids = ["A", "B", "C", "D"];
    const edges = [edge("B", "A"), edge("C", "A"), edge("D", "B"), edge("D", "C")];
    const adj = buildAdjacencyList(ids, edges);
    const result = topologicalSort(adj);

    const orderIndex = new Map(result.order.map((id, i) => [id, i]));
    // A deve venire prima di B e C
    expect(orderIndex.get("A")!).toBeLessThan(orderIndex.get("B")!);
    expect(orderIndex.get("A")!).toBeLessThan(orderIndex.get("C")!);
    // B e C devono venire prima di D
    expect(orderIndex.get("B")!).toBeLessThan(orderIndex.get("D")!);
    expect(orderIndex.get("C")!).toBeLessThan(orderIndex.get("D")!);
    expect(result.order).toHaveLength(4);
  });

  it("gestisce nodi isolati (senza archi)", () => {
    const ids = ["X", "Y", "Z"];
    const edges: PrerequisiteEdge[] = [];
    const adj = buildAdjacencyList(ids, edges);
    const result = topologicalSort(adj);

    expect(result.order).toHaveLength(3);
    expect(new Set(result.order)).toEqual(new Set(["X", "Y", "Z"]));
  });

  it("gestisce un singolo nodo", () => {
    const ids = ["SOLO"];
    const edges: PrerequisiteEdge[] = [];
    const adj = buildAdjacencyList(ids, edges);
    const result = topologicalSort(adj);

    expect(result.order).toEqual(["SOLO"]);
    expect(result.depth.get("SOLO")).toBe(0);
  });

  it("ordina correttamente un DAG complesso con 8 nodi (scenario Informatica)", () => {
    const ids = [
      "analisi1", "prog1", "algebra", "architettura",
      "analisi2", "asd", "basi_dati", "so"
    ];
    const edges = [
      edge("analisi2", "analisi1"),
      edge("algebra", "analisi1"),
      edge("asd", "prog1"),
      edge("basi_dati", "prog1"),
      edge("basi_dati", "asd"),
      edge("so", "prog1"),
      edge("so", "architettura"),
    ];
    const adj = buildAdjacencyList(ids, edges);
    const result = topologicalSort(adj);

    const idx = new Map(result.order.map((id, i) => [id, i]));

    // Verifica vincoli di precedenza
    expect(idx.get("analisi1")!).toBeLessThan(idx.get("analisi2")!);
    expect(idx.get("analisi1")!).toBeLessThan(idx.get("algebra")!);
    expect(idx.get("prog1")!).toBeLessThan(idx.get("asd")!);
    expect(idx.get("prog1")!).toBeLessThan(idx.get("basi_dati")!);
    expect(idx.get("asd")!).toBeLessThan(idx.get("basi_dati")!);
    expect(idx.get("prog1")!).toBeLessThan(idx.get("so")!);
    expect(idx.get("architettura")!).toBeLessThan(idx.get("so")!);

    expect(result.order).toHaveLength(8);
  });
});

// ===========================================================================
// SUITE: Profondità e Percorso Critico
// ===========================================================================

describe("DAG Engine — Profondità e Percorso Critico", () => {
  it("calcola la profondità corretta per una catena lineare", () => {
    const ids = ["A", "B", "C", "D"];
    const edges = [edge("B", "A"), edge("C", "B"), edge("D", "C")];
    const adj = buildAdjacencyList(ids, edges);
    const result = topologicalSort(adj);

    expect(result.depth.get("A")).toBe(0);
    expect(result.depth.get("B")).toBe(1);
    expect(result.depth.get("C")).toBe(2);
    expect(result.depth.get("D")).toBe(3);
    expect(criticalPathLength(result)).toBe(3);
  });

  it("calcola la profondità massima in un diamante", () => {
    const ids = ["A", "B", "C", "D"];
    const edges = [edge("B", "A"), edge("C", "A"), edge("D", "B"), edge("D", "C")];
    const adj = buildAdjacencyList(ids, edges);
    const result = topologicalSort(adj);

    expect(result.depth.get("A")).toBe(0);
    expect(result.depth.get("D")).toBe(2);
    expect(criticalPathLength(result)).toBe(2);
  });

  it("identifica correttamente radici e foglie", () => {
    const ids = ["R1", "R2", "M", "L1", "L2"];
    const edges = [edge("M", "R1"), edge("M", "R2"), edge("L1", "M"), edge("L2", "M")];
    const adj = buildAdjacencyList(ids, edges);

    const roots = getRootCourses(adj).sort();
    const leaves = getLeafCourses(adj).sort();

    expect(roots).toEqual(["R1", "R2"]);
    expect(leaves).toEqual(["L1", "L2"]);
  });
});

// ===========================================================================
// SUITE: Rilevamento Cicli
// ===========================================================================

describe("DAG Engine — Rilevamento Cicli", () => {
  it("rileva un ciclo diretto a 2 nodi: A ↔ B", () => {
    const ids = ["A", "B"];
    // A richiede B, B richiede A
    const edges = [edge("A", "B"), edge("B", "A")];
    const adj = buildAdjacencyList(ids, edges);

    expect(() => topologicalSort(adj)).toThrow(CyclicDependencyError);

    try {
      topologicalSort(adj);
    } catch (e) {
      const err = e as CyclicDependencyError;
      expect(err.cycle.length).toBeGreaterThanOrEqual(2);
      // Il ciclo deve contenere sia A che B
      expect(err.cycle).toEqual(expect.arrayContaining(["A", "B"]));
    }
  });

  it("rileva un ciclo a 3 nodi: A → B → C → A", () => {
    const ids = ["A", "B", "C"];
    const edges = [edge("B", "A"), edge("C", "B"), edge("A", "C")];
    const adj = buildAdjacencyList(ids, edges);

    expect(() => topologicalSort(adj)).toThrow(CyclicDependencyError);

    try {
      topologicalSort(adj);
    } catch (e) {
      const err = e as CyclicDependencyError;
      expect(err.cycle.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("rileva un ciclo a 4 nodi in un grafo misto (alcuni nodi non nel ciclo)", () => {
    // Grafo: X → A → B → C → D → A (ciclo a 4: A-B-C-D), X è una radice legittima
    const ids = ["X", "A", "B", "C", "D"];
    const edges = [
      edge("A", "X"),  // A richiede X — legittimo
      edge("B", "A"),  // B richiede A
      edge("C", "B"),  // C richiede B
      edge("D", "C"),  // D richiede C
      edge("A", "D"),  // A richiede D — crea il ciclo A→B→C→D→A
    ];
    const adj = buildAdjacencyList(ids, edges);

    expect(() => topologicalSort(adj)).toThrow(CyclicDependencyError);

    try {
      topologicalSort(adj);
    } catch (e) {
      const err = e as CyclicDependencyError;
      // Il ciclo deve contenere A, B, C, D
      expect(err.cycle).toEqual(expect.arrayContaining(["A", "B", "C", "D"]));
      expect(err.message).toContain("ciclica");
    }
  });

  it("non rileva cicli in un grafo aciclico complesso", () => {
    const ids = ["A", "B", "C", "D", "E"];
    const edges = [
      edge("B", "A"),
      edge("C", "A"),
      edge("D", "B"),
      edge("D", "C"),
      edge("E", "D"),
    ];
    const adj = buildAdjacencyList(ids, edges);

    expect(() => topologicalSort(adj)).not.toThrow();
  });
});
