// ============================================================================
// UniPlan — Fastify App Factory
// Configura middleware, routing e gestione centralizzata degli errori
// ============================================================================

import fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import { globalErrorHandler } from "./middleware/error-handler";
import { schedulerRoutes } from "./routes/scheduler.routes";
import { healthRoutes } from "./routes/health.routes";

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = fastify({
    logger:
      process.env.NODE_ENV === "test"
        ? false
        : {
            level: process.env.LOG_LEVEL || "info",
          },
    ...options,
  });

  // 1. Registrazione CORS
  app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  // 2. Registrazione Global Error Handler
  app.setErrorHandler(globalErrorHandler);

  // 3. Registrazione Route con prefisso /api
  app.register(healthRoutes, { prefix: "/api" });
  app.register(healthRoutes); // Per comodità espone anche /health
  app.register(schedulerRoutes, { prefix: "/api/scheduler" });

  return app;
}
