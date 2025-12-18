# Observability Metrics Plan

## 1. API Metrics (`cdn-api`)

**Goal:** Monitor User Experience and HTTP Traffic.

| Metric Name                     | Type      | Labels                           | Criticality                                               |
| :------------------------------ | :-------- | :------------------------------- | :-------------------------------------------------------- |
| `http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` | **Golden Metric**. Tracks p95/p99 latency per endpoint.   |
| `http_requests_total`           | Counter   | `method`, `route`, `status_code` | Measures traffic volume and error rates (5xx vs 2xx).     |
| `upload_size_bytes`             | Histogram | `mime_type`                      | Tracks distribution of uploaded file sizes.               |
| `db_query_duration_seconds`     | Histogram | `operation`, `table`             | Detects slow database queries before they impact the API. |

## 2. Worker Metrics (`cdn-worker`)

**Goal:** Monitor Throughput, Processing Efficiency, and Reliability.

| Metric Name                       | Type      | Labels                | Criticality                                                             |
| :-------------------------------- | :-------- | :-------------------- | :---------------------------------------------------------------------- |
| `job_processing_duration_seconds` | Histogram | `job_type`, `status`  | Capacity planning. How long does resizing take?                         |
| `job_queue_latency_seconds`       | Histogram | `job_type`            | **Lag**. Time difference between `job.created_at` and processing start. |
| `jobs_processed_total`            | Counter   | `job_type`, `status`  | Success/Failure counts. Alert on `status=failed` spikes.                |
| `image_processing_errors_total`   | Counter   | `error_type`          | Specific failures (e.g., "corrupt_image", "s3_timeout").                |
| `s3_operation_duration_seconds`   | Histogram | `operation`, `bucket` | Distinguishes between S3 slowness and code slowness.                    |

## 3. Business Metrics (Global)

**Goal:** High-level KPIs for dashboards.

* `total_storage_used_bytes` (Gauge)
* `total_files_count` (Gauge)
* `active_workers_count` (Gauge) - Verifies autoscaling behavior.

## 4. Node.js Runtime Metrics (Standard)

Enable default `prom-client` metrics to get these for free:

* `process_cpu_seconds_total` (CPU Usage)
* `process_resident_memory_bytes` (RAM Usage - detect leaks)
* `nodejs_eventloop_lag_seconds` (Main thread blocking detection)

## Implementation Plan

1. **Install**: `npm install prom-client` in both apps.
2. **Middleware**: Add response time middleware to `cdn-api`.
3. **Endpoint**: Expose `/metrics` in `cdn-api` (and separate internal port for `cdn-worker`).
4. **Grafana**: Visualize `rate(http_requests_total[5m])` and `histogram_quantile(0.95, ...)`.
