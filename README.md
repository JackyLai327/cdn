# 🚀 Easy CDN Service

![Build Status](https://img.shields.io/github/actions/workflow/status/JackyLai327/cdn/ci-cdn-api.yaml?branch=main&label=API%20Build)
![Worker Status](https://img.shields.io/github/actions/workflow/status/JackyLai327/cdn/ci-cdn-worker.yaml?branch=main&label=Worker%20Build)
![Infrastructure](https://img.shields.io/github/actions/workflow/status/JackyLai327/cdn/infra-check.yaml?branch=main&label=Infrastructure)
![License](https://img.shields.io/github/license/JackyLai327/cdn)
![Version](https://img.shields.io/github/v/release/JackyLai327/cdn)

A high-performance, scalable **Content Delivery Network (CDN)** system designed for secure file management and automated image optimization. Built with a microservices architecture on AWS, it leverages **Kubernetes (EKS)** for orchestration and **Terraform** for Infrastructure as Code (IaC).

---

## 🏗 Architecture

The system follows a modern microservices pattern, ensuring scalability and separation of concerns:

- **🔌 CDN API (`apps/cdn-api`)**:
  - **Role**: The gateway to the system.
  - **Tech**: Node.js, Express, TypeScript.
  - **Features**: Secure file uploads via S3 Presigned URLs, JWT-based authentication, and metadata management.
  
- **⚙️ CDN Worker (`apps/cdn-worker`)**:
  - **Role**: Asynchronous background processor.
  - **Tech**: Node.js, Sharp, AWS SQS.
  - **Features**: Consumes upload events, performs image optimization (resizing, format conversion), and updates file status.

- **☁️ Infrastructure**:
  - **AWS EKS**: Kubernetes cluster for container orchestration.
  - **AWS S3**: Dual-bucket strategy (Raw vs. Processed) for secure storage.
  - **AWS SQS**: Decoupled message queue for reliable event processing.
  - **AWS RDS**: Managed PostgreSQL for persistent metadata storage.
  - **AWS CloudFront**: Global content delivery with low latency.

---

## 📂 Project Structure

This repository is organized as a monorepo:

```bash
.
├── apps/
│   ├── cdn-api/        # REST API Service
│   ├── cdn-worker/     # Background Image Processor
│   └── cdn-web/        # Web Dashboard (Frontend)
├── infra/              # Terraform Infrastructure as Code
│   ├── envs/           # Environment-specific configs (dev, prod)
│   └── modules/        # Reusable Terraform modules
├── k8s/                # Kubernetes Manifests (Helm/Plain YAML)
├── docs/               # Documentation & Runbooks
└── local/              # Local Development Environment (Docker Compose)
```

---

## 🚀 Getting Started

### Prerequisites

- **Docker** & **Docker Compose**
- **Node.js** v20+
- **AWS CLI** (configured)
- **Terraform** v1.5+

### 💻 Local Development

Run the entire stack locally using Docker Compose and LocalStack to emulate AWS services.

1.  **Initialize Local Environment**
    ```bash
    cd local
    docker-compose up -d
    ./localstack-init.sh # Seeds S3 buckets and SQS queues
    ```

2.  **Install Dependencies**
    ```bash
    # Install API dependencies
    cd apps/cdn-api && npm ci

    # Install Worker dependencies
    cd ../cdn-worker && npm ci
    ```

3.  **Start Services**
    ```bash
    # Terminal 1: Start API
    cd apps/cdn-api && npm run dev

    # Terminal 2: Start Worker
    cd apps/cdn-worker && npm run dev
    ```

---

## 🛠 Tech Stack

| Category           | Technology           |
| ------------------ | -------------------- |
| **Runtime**        | Node.js (TypeScript) |
| **Framework**      | Express.js           |
| **Database**       | PostgreSQL (AWS RDS) |
| **Queue**          | AWS SQS              |
| **Storage**        | AWS S3               |
| **Infrastructure** | Terraform            |
| **Orchestration**  | Kubernetes (EKS)     |
| **CI/CD**          | GitHub Actions       |

---

## 📖 Documentation

Detailed documentation can be found in the `docs/` directory:

- [**Setup Flow**](docs/setup-flow.md): Step-by-step guide to provisioning the infrastructure.
- [**Configuration**](docs/config.md): Environment variables and configuration reference.
- [**Operational Notes**](docs/notes.md): Monitoring and observability guide.

---

## 🤝 Contribution

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'feat: add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
