// ============================================================================
// UniPlan — Health Check Route
// ============================================================================

import type { FastifyPluginAsync } from "fastify";

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/health", async (_request, reply) => {
    return reply.status(200).send({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: "UniPlan API",
      version: "1.0.0",
    });
  });
};
