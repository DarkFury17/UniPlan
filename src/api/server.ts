// ============================================================================
// UniPlan — API Server Entrypoint
// Avvio del server HTTP Fastify con supporto Graceful Shutdown
// ============================================================================

import { buildApp } from "./app";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

async function startServer() {
  const app = buildApp();

  // ---------------------------------------------------------------------------
  // Graceful Shutdown
  // ---------------------------------------------------------------------------
  const shutdown = async (signal: string) => {
    app.log.info(`Ricevuto segnale ${signal}. Avvio della procedura di graceful shutdown...`);
    try {
      await app.close();
      app.log.info("Server Fastify terminato correttamente.");
      process.exit(0);
    } catch (err) {
      app.log.error(err, "Errore durante la chiusura del server Fastify.");
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // ---------------------------------------------------------------------------
  // Avvio ascolto HTTP
  // ---------------------------------------------------------------------------
  try {
    const address = await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 UniPlan API Server in ascolto su ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Avvia il server solo se eseguito direttamente
if (require.main === module || process.env.NODE_ENV !== "test") {
  startServer();
}
