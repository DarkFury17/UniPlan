// ============================================================================
// UniPlan — Centralized Global Error Handler Middleware (Fastify)
// Mappatura semantica:
// - ZodError -> 400 Bad Request
// - CyclicDependencyError -> 422 Unprocessable Entity
// - UnfeasibleScheduleError -> 409 Conflict
// - Default -> 500 Internal Server Error
// ============================================================================

import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { CyclicDependencyError } from "../../core/dag-engine";
import { UnfeasibleScheduleError } from "../../core/exam-scheduler";

export function globalErrorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // 1. Errori di validazione Zod
  if (
    error instanceof ZodError ||
    error.name === "ZodError" ||
    (error as any)?.name === "ZodError" ||
    Array.isArray((error as any)?.issues)
  ) {
    const rawIssues = (error as any).issues || (error as any).errors || [];
    reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: "I dati della richiesta non rispettano lo schema previsto",
      issues: rawIssues.map((err: any) => ({
        path: Array.isArray(err.path) ? err.path.join(".") : String(err.path ?? ""),
        message: err.message,
        code: err.code,
      })),
    });
    return;
  }

  // 2. Dipendenza ciclica nel grafo di propedeuticità
  if (error instanceof CyclicDependencyError) {
    reply.status(422).send({
      statusCode: 422,
      error: "Unprocessable Entity",
      message: error.message,
      cycle: error.cycle,
    });
    return;
  }

  // 3. Impossibilità di soddisfare i vincoli temporali/appelli
  if (error instanceof UnfeasibleScheduleError) {
    reply.status(409).send({
      statusCode: 409,
      error: "Conflict",
      message: error.message,
      reason: error.reason,
    });
    return;
  }

  // 4. Errori di parsing/validazione interni a Fastify
  if ("statusCode" in error && typeof error.statusCode === "number") {
    reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name || "Error",
      message: error.message,
    });
    return;
  }

  // 5. Errore generico non gestito
  reply.status(500).send({
    statusCode: 500,
    error: "Internal Server Error",
    message: "Si è verificato un errore interno durante l'elaborazione del piano",
  });
}
