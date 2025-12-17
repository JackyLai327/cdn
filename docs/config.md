# ⚙️ Configuration Reference

This document lists the environment variables required to run the CDN services.

## 🔌 CDN API (`apps/cdn-api`)

| Variable              | Description                                    | Required |     Default      |
| --------------------- | ---------------------------------------------- | :------: | :--------------: |
| `NODE_ENV`            | Environment mode (`development`, `production`) |    ✅     |  `development`   |
| `APP_PORT`            | Port to run the API server                     |    ❌     |      `3000`      |
| `DB_HOST`             | PostgreSQL Hostname                            |    ✅     |        -         |
| `DB_PORT`             | PostgreSQL Port                                |    ❌     |      `5432`      |
| `DB_USER`             | PostgreSQL Username                            |    ✅     |        -         |
| `DB_PASSWORD`         | PostgreSQL Password                            |    ✅     |        -         |
| `DB_NAME`             | PostgreSQL Database Name                       |    ✅     |        -         |
| `S3_REGION`           | AWS Region for S3                              |    ✅     | `ap-southeast-2` |
| `S3_BUCKET_RAW`       | Bucket for raw file uploads                    |    ✅     |        -         |
| `S3_BUCKET_PROCESSED` | Bucket for processed files                     |    ✅     |        -         |
| `QUEUE_URL`           | SQS Queue URL for job dispatch                 |    ✅     |        -         |
| `JWT_SECRET`          | Secret key for signing JWTs                    |    ✅     |        -         |

## ⚙️ CDN Worker (`apps/cdn-worker`)

| Variable              | Description                        | Required |     Default      |
| --------------------- | ---------------------------------- | :------: | :--------------: |
| `NODE_ENV`            | Environment mode                   |    ✅     |  `development`   |
| `SQS_REGION`          | AWS Region for SQS                 |    ✅     | `ap-southeast-2` |
| `QUEUE_URL`           | SQS Queue URL to poll              |    ✅     |        -         |
| `S3_REGION`           | AWS Region for S3                  |    ✅     | `ap-southeast-2` |
| `S3_BUCKET_RAW`       | Bucket to read raw files from      |    ✅     |        -         |
| `S3_BUCKET_PROCESSED` | Bucket to write processed files to |    ✅     |        -         |
| `DB_HOST`             | PostgreSQL Hostname                |    ✅     |        -         |
| `DB_USER`             | PostgreSQL Username                |    ✅     |        -         |
| `DB_PASSWORD`         | PostgreSQL Password                |    ✅     |        -         |
| `DB_NAME`             | PostgreSQL Database Name           |    ✅     |        -         |

## 🔐 Secrets Management

In production (Kubernetes), these values are injected via:
1.  **ConfigMaps**: For non-sensitive data (URLs, Regions).
2.  **Secrets**: For sensitive data (Passwords, Keys).

These values are sourced from **AWS SSM Parameter Store** during the deployment pipeline.
