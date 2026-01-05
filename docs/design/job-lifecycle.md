# Job Lifecycle

## Purpose

This document defines the single source of truth for how a job moves through the system.
It prevents inconsistent behaviour across API, worker, retries and DLQ.

## Entities

- Job: a durable record in Postgres representing a unit of work
- Attempt: one processing attempt of a job by the worker
- Queue message: an SQS message that triggers an attempt. Messages may be duplicated. (Use JobID to deduplicate)

## State machine

### States

- `queued`: job exists and is eligible to be processed
- `processing`: a worker has claimed the job and is working on it
- `completed`: the job has been successfully processed
- `failed_retryable`: the job has failed to process but can be retried
- `failed`: the job has failed to process and cannot be retried

### Transitions

- `queued` -> `processing`: a worker claims the job
- `processing` -> `completed`: the job is successfully processed
- `processing` -> `failed_retryable`: the job fails to process but can be retried
- `processing` -> `failed`: the job fails to process and cannot be retried
- `failed_retryable` -> `processing`: the job is retried
- `failed_retryable` -> `failed`: the job fails to process and cannot be retried

### Forbidden transitions

- `completed` -> *any*
- `failed` -> *any*
- `queued` -> `failed_retryable`
- `queued` -> `failed`
- `queued` -> `completed`

## Ownership rules

- API **may**:
  - create a job with a `queued` state
  - read jobs
  - request cancellation/deletion by creating a new job type

- API **must not**:
  - mark jobs as `processing`, `completed` or `failed`

- Worker **may*:
  - claim a job (`queued` -> `processing`)
  - complete a job (`processing` -> `completed`)
  - fail a job (`processing` -> `failed_retryable` or `failed`)
  - retry a job (`failed_retryable` -> `processing`)
  - delete a job (`failed_retryable` -> `failed`)

## Idempotency and duplicates

- This system provides **effectively-once semantics via idempotency**
- SQS messages may be duplicated
- Job processing is made safe through:
  - atomicity of job claim
  - idempotency of job processing
  - terminal state of job processing ('completed' or 'failed')

## Claiming

- A worker claims a job before processing it
- `queued` -> `processing`
- If the job is locked by another worker and the lock is older than 10 minutes, the worker can claim the job
- If the job is locked by another worker and the lock is younger than 10 minutes, the worker will not claim the job
- A worker only picks up jobs that are in the `queued` or `failed_retryable` state, or when `processing` jobs are older than 10 minutes
- Job claim MUST be done via a single atomic DB update
- The update must:
  - match on job_id
  - require state = failed_retryable OR (state = processing AND locked_at < now - locked_timeout)
- If the update affects 0 rows, the claim failed and the worker must not claim the job
- Jobs in `completed` or `failed` state must not be claimed

## Retry semantics

- `processing` -> `failed_retryable`: the job fails to process but can be retried
- `failed_retryable` -> `processing`: the job is retried
- `processing` -> `failed`: the job fails to process and cannot be retried

## Observability expectations

For every attempt, the following must be logged:

- how long does it take to process the job
- if it failed, why
- how many times was it retried
- what's the current state of the job

## API metrics that are being collected using Prometheus (`prom-client`)

### `http_request_duration_seconds`

- histogram
- duration of HTTP requests
- labels: `method`, `route`, `status_code`
- buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10]

### `http_requests_total`

- counter
- total number of HTTP requests
- labels: `method`, `route`, `status_code`

### `upload_size_bytes`

- histogram
- upload size in bytes
- labels: `mime_type`
- buckets: [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576]

### `db_query_duration_seconds` (API)

- histogram
- duration of DB queries
- labels: `operation`, `table`
- buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10]

### `db_query_error_total`

- counter
- total number of DB query errors
- labels: `operation`, `table`, `error_code`

### `external_duration_seconds`

- histogram
- duration of external service calls
- labels: `service`, `operation`
- buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10]

### `external_error_total`

- counter
- total number of external service errors
- labels: `service`, `operation`, `error_code`

### Worker metrics that are being collected using Prometheus (`prom-client`)

### `job_processing_duration_seconds`

- histogram
- duration of job processing
- labels: `job_type`, `status`
- buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]

### `job_queue_latency_milliseconds`

- histogram
- duration of job queue latency
- labels: `job_type`
- buckets: [
    10, 30, 50, 70, 100, 300, 500, 700, 1000, 1500, 2000, 2500, 3000, 3500,
    4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500,
    10000,
  ]

### `job_processed_total`

- counter
- total number of jobs processed
- labels: `job_type`, `status`

### `image_processing_errors_total`

- counter
- total number of image processing errors
- labels: `error_type`

### `s3_operation_duration_seconds`

- histogram
- duration of S3 operations
- labels: `operation`, `bucket`
- buckets: [0.1, 0.3, 0.5, 1, 3, 5, 7, 10]

### `s3_operation_errors_total`

- counter
- total number of S3 operation errors
- labels: `operation`, `bucket`, `error_code`

### `db_query_duration_seconds` (worker)

- histogram
- duration of DB queries
- labels: `query_type`
- buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]

### `db_query_errors_total`

- counter
- total number of DB query errors
- labels: `query_type`, `error_type`

### `cloudfront_operation_duration_seconds`

- histogram
- duration of CloudFront operations
- labels: `operation`
- buckets: [0.1, 0.3, 0.5, 1, 3, 5, 7, 10]

### `cloudfront_operation_errors_total`

- counter
- total number of CloudFront operation errors
- labels: `operation`, `error_code`

### `job_active_count`

- gauge
- number of active jobs
- labels: `job_type`

### `job_queue_depth`

- gauge
- number of jobs in the queue
- labels: `job_type`
