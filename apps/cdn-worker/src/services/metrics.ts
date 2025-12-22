import http from "http";
import client from "prom-client";

export const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: "cdn_worker_" });

export const jobDuration = new client.Histogram({
  name: "job_processing_duration_seconds",
  help: "job processing duration in seconds",
  labelNames: ["job_type", "status"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const jobQueueLatency = new client.Histogram({
  name: "job_queue_latency_milliseconds",
  help: "job queue latency in milliseconds",
  labelNames: ["job_type"],
  buckets: [
    10, 30, 50, 70, 100, 300, 500, 700, 1000, 1500, 2000, 2500, 3000, 3500,
    4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500,
    10000,
  ],
  registers: [register],
});

export const jobProcessedTotal = new client.Counter({
  name: "job_processed_total",
  help: "total number of jobs processed",
  labelNames: ["job_type", "status"],
  registers: [register],
});

export const imageProcessingErrorsTotal = new client.Counter({
  name: "image_processing_errors_total",
  help: "total number of image processing errors",
  labelNames: ["error_type"],
  registers: [register],
});

export const s3OperationDuration = new client.Histogram({
  name: "s3_operation_duration_seconds",
  help: "s3 operation duration in seconds",
  labelNames: ["operation", "bucket"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const s3OperationErrorsTotal = new client.Counter({
  name: "s3_operation_errors_total",
  help: "total number of s3 operation errors",
  labelNames: ["operation", "bucket", "error_type"],
  registers: [register],
});

export const dbQueryDuration = new client.Histogram({
  name: "db_query_duration_seconds",
  help: "db query duration in seconds",
  labelNames: ["query_type"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const dbQueryErrorsTotal = new client.Counter({
  name: "db_query_errors_total",
  help: "total number of db query errors",
  labelNames: ["query_type", "error_type"],
  registers: [register],
});

export const cloudFrontOperationDuration = new client.Histogram({
  name: "cloudfront_operation_duration_seconds",
  help: "cloudfront operation duration in seconds",
  labelNames: ["operation"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const cloudFrontOperationErrorsTotal = new client.Counter({
  name: "cloudfront_operation_errors_total",
  help: "total number of cloudfront operation errors",
  labelNames: ["operation", "error_type"],
  registers: [register],
});

export const jobActiveCount = new client.Gauge({
  name: "job_active_count",
  help: "number of in flight jobs (being processed)",
  labelNames: ["job_type"],
  registers: [register],
})

export const jobQueueDepth = new client.Gauge({
  name: "job_queue_depth",
  help: "number of jobs waiting in the queue",
  labelNames: ["job_type"],
  registers: [register],
})

export const measureJobDuration = async <T>(
  jobType: string,
  status: string,
  fn: () => Promise<T>
): Promise<T> => {
  jobActiveCount.inc({ job_type: jobType });

  const endTime = jobDuration.startTimer({
    job_type: jobType,
    status,
  });

  try {
    const result = await fn();
    endTime({ status: "success" });
    jobProcessedTotal.inc({
      job_type: jobType,
      status: "success",
    });

    jobActiveCount.dec({ job_type: jobType });

    return result;
  } catch (error) {
    endTime({ status: "failed" });
    jobProcessedTotal.inc({
      job_type: jobType,
      status: "failed",
    });

    jobActiveCount.dec({ job_type: jobType });

    throw error;
  }
};

export const measureDBDuration = async <T>(
  queryType: string,
  fn: () => Promise<T>
): Promise<T> => {
  const endTimer = dbQueryDuration.startTimer({
    query_type: queryType,
  });

  try {
    const result = await fn();
    endTimer();
    return result;
  } catch (error) {
    endTimer();
    dbQueryErrorsTotal.inc({
      query_type: queryType,
      error_type: error instanceof Error ? error.name : "unknown",
    });
    throw error;
  }
};

export const measureS3Duration = async <T>(
  operation: string,
  bucket: string,
  fn: () => Promise<T>
): Promise<T> => {
  const endTimer = s3OperationDuration.startTimer({
    operation,
    bucket,
  });

  try {
    const result = await fn();
    endTimer();
    return result;
  } catch (error) {
    endTimer();
    s3OperationErrorsTotal.inc({
      operation,
      error_type: error instanceof Error ? error.name : "unknown",
    });
    throw error;
  }
};

export const measureCloudFrontDuration = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const endTimer = cloudFrontOperationDuration.startTimer({
    operation,
  });

  try {
    const result = await fn();
    endTimer();
    return result;
  } catch (error) {
    endTimer();
    cloudFrontOperationErrorsTotal.inc({
      operation,
      error_type: error instanceof Error ? error.name : "unknown",
    });
    throw error;
  }
};

export const startMetricsServer = (port: number) => {
  const server = http.createServer(async (req, res) => {
    if (req.url === "/metrics" && req.method === "GET") {
      res.setHeader("Content-Type", register.contentType);
      res.end(await register.metrics());
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(port, () => {
    console.log(`Metrics server listening on port ${port}`);
  });
};
