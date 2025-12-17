# 🏭 Infrastructure Provisioning Guide

This document outlines the step-by-step process for provisioning the **Easy CDN** infrastructure on AWS using Terraform. It covers the creation of the VPC, EKS Cluster, Database, and supporting services.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed and configured:

- **Terraform** (v1.5+)
- **AWS CLI** (v2+)
- **kubectl** (compatible with EKS v1.30)
- **Helm** (v3+)
- **AWS Account** with Administrator privileges

---

## 1. 🏗️ Project Structure

The infrastructure code is organized into modular components:

```bash
infra/
├── envs/               # Environment-specific configurations
│   ├── dev/            # Development environment
│   └── prod/           # Production environment
├── modules/            # Reusable Terraform modules
│   ├── vpc/            # Networking (VPC, Subnets, NAT)
│   ├── eks/            # Kubernetes Cluster (EKS)
│   ├── rds/            # Database (PostgreSQL)
│   ├── s3/             # Object Storage
│   └── sqs/            # Message Queues
└── global/             # Global resources (e.g., Remote Backend)
```

---

## 2. 🌐 Networking (VPC)

The foundation of the infrastructure is a secure VPC.

1.  **Navigate to the environment directory**:
    ```bash
    cd infra/envs/dev
    ```
2.  **Initialize Terraform**:
    ```bash
    terraform init
    ```
3.  **Apply the VPC Configuration**:
    ```bash
    terraform apply -target=module.vpc
    ```

**What this creates:**
- VPC with public and private subnets across 3 Availability Zones.
- NAT Gateways for private subnet internet access.
- Internet Gateway and Route Tables.

---

## 3. ☸️ Kubernetes Cluster (EKS)

Provision the EKS cluster where the applications will run.

1.  **Apply the EKS Configuration**:
    ```bash
    terraform apply -target=module.eks
    ```
2.  **Configure kubectl**:
    ```bash
    aws eks update-kubeconfig --name dev-eks --region ap-southeast-2
    ```
3.  **Verify Connection**:
    ```bash
    kubectl get nodes
    ```

---

## 4. 🗄️ Database & Storage (RDS, S3, SQS)

Provision the stateful components.

1.  **Apply remaining resources**:
    ```bash
    terraform apply
    ```

**What this creates:**
- **RDS**: PostgreSQL instance in private subnets.
- **S3**: `cdn-raw` and `cdn-processed` buckets.
- **SQS**: Job queue and Dead Letter Queue (DLQ).
- **SSM Parameters**: Stores connection strings and secrets in AWS Systems Manager.

---

## 5. 🧩 Cluster Add-ons

Install essential Kubernetes controllers using Helm.

### AWS Load Balancer Controller
Required for creating ALBs from Ingress resources.

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=dev-eks \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=ap-southeast-2 \
  --set vpcId=$(aws eks describe-cluster --name dev-eks --query "cluster.resourcesVpcConfig.vpcId" --output text)
```

### ExternalDNS
Automatically manages Route53 records.

```bash
helm repo add external-dns https://kubernetes-sigs.github.io/external-dns/
helm install external-dns external-dns/external-dns \
  -n kube-system \
  --set provider=aws \
  --set policy=sync \
  --set txtOwnerId=dev-eks
```

---

## 6. 🚀 Application Deployment

Once infrastructure is ready, deploy the applications using the CI/CD pipelines or manually via kubectl.

1.  **Update ConfigMaps**:
    Ensure `k8s/configmap.yaml` references the correct RDS endpoint and SQS URL (or use the automated pipeline injection).

2.  **Deploy Manifests**:
    ```bash
    kubectl apply -f k8s/
    ```

---

## 🔍 Verification

- **API**: `curl https://api.dev.easy-cdn.com/health`
- **Worker**: Check logs `kubectl logs -l app=cdn-worker`

