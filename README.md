# CDN Service

A scalable Content Delivery Network (CDN) system designed for high-performance file management and image processing. This project consists of a robust API for file operations and a background worker for asynchronous image optimization, backed by AWS infrastructure.

## 🏗 Architecture

The system is built with a microservices approach:

- **[cdn-api](apps/cdn-api/)**: An Express.js REST API that handles:
  - Secure file uploads (presigned URLs)
  - Authentication & Authorization
  - File metadata management
- **[cdn-worker](apps/cdn-worker/)**: A background worker service that:
  - Consumes tasks from an SQS queue
  - Processes and optimizes images using `sharp`
  - Updates file status in the database
- **Infrastructure**: Managed via Terraform, utilizing AWS services:
  - **S3**: Object storage for raw and processed files
  - **SQS**: Message queue for decoupling uploads from processing
  - **CloudFront**: Content delivery network for low-latency access
  - **RDS (PostgreSQL)**: Relational database for metadata

## 📂 Project Structure

```
├── apps/
│   ├── cdn-api/      # API Service (Express, TypeScript)
│   ├── cdn-worker/   # Background Worker (Node.js, Sharp)
│   └── cdn-web/      # Web Interface
├── infra/            # Infrastructure as Code (Terraform)
└── local/            # Local development setup (Docker Compose, LocalStack)
```

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) or npm

### Local Development

1.  **Start Local Infrastructure**
    Navigate to the `local` directory and start the services (Postgres, LocalStack for S3/SQS).
    ```bash
    cd local
    docker-compose up -d
    ```

2.  **Install Dependencies**
    Install dependencies for all applications.
    ```bash
    # In apps/cdn-api
    cd apps/cdn-api
    npm install

    # In apps/cdn-worker
    cd ../cdn-worker
    npm install
    ```

3.  **Run Services**
    You can run the services in development mode with hot-reloading.
    ```bash
    # Terminal 1: API
    cd apps/cdn-api
    npm run dev

    # Terminal 2: Worker
    cd apps/cdn-worker
    npm run dev
    ```

## 🛠 Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Queue**: AWS SQS (LocalStack for local dev)
- **Storage**: AWS S3 (LocalStack for local dev)
- **DevOps**: Docker, Terraform

## 📄 License

[ISC](LICENSE)
