import http from "http";
import client from "prom-client";
import { logger } from "../../lib/logger.js";

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: "cdn_api_" });

type DBError = Error & {
  code?: string;
  message?: string;
  stack?: string;
}

export const httpDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const uploadSize = new client.Histogram({
  name: "upload_size_bytes",
  help: "Upload size in bytes",
  labelNames: ["mime_type"],
  buckets: [
    1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288,
    1048576,
  ],
  registers: [register],
});

export const dbQueryDuration = new client.Histogram({
  name: "db_query_duration_seconds",
  help: "DB query duration in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const dbQueryErrorTotal = new client.Counter({
  name: "db_query_error_total",
  help: "Total number of DB query errors",
  labelNames: ["operation", "table", "error_code"],
  registers: [register],
})

export const externalDuration = new client.Histogram({
  name: "external_duration_seconds",
  help: "External service duration in seconds",
  labelNames: ["service", "operation"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
  registers: [register],
})

export const externalErrorTotal = new client.Counter({
  name: "external_error_total",
  help: "Total number of external service errors",
  labelNames: ["service", "operation", "error_code"],
  registers: [register],
})

export const measureDBQueryDuration = async <T>(
  operation: string,
  table: string,
  fn: () => Promise<T>
): Promise<T> => {
  const endTimer = dbQueryDuration.startTimer({ operation, table });

  try {
    const result = await fn();
    endTimer();
    return result;
  } catch (error: unknown) {
    endTimer();
    const code = (error as DBError).code || (error as DBError).message || "unknown";
    dbQueryErrorTotal.inc({ operation, table, error_code: String(code) });
    throw error;
  }
}

export const measureExternalDuration = async <T>(
  service: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const endTimer = externalDuration.startTimer({ service, operation });

  try {
    const result = await fn();
    endTimer();
    return result;
  } catch (error: unknown) {
    endTimer();
    const code = (error as DBError).code || (error as DBError).message || "unknown";
    externalErrorTotal.inc({ service, operation, error_code: String(code) });
    throw error;
  }
}

export const startMetricsServer = (port: number) => {
  const server = http.createServer(async (req, res) => {
    if (req.url === "/metrics" && req.method === "GET") {
      res.setHeader("Content-Type", register.contentType);
      res.end(await register.metrics());
    } else {
      res.writeHead(404);
      res.end();
    }
  })

  server.listen(port, () => {
    logger.info(`Metrics server listening on port ${port}`);
  })
}

export { register };
