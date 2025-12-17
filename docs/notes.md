# 📊 Kubernetes Observability & Monitoring

This document outlines the key metrics and tools used to monitor the EKS cluster and CDN workloads.

## 🎯 Key Metrics Strategy

We follow the **USE Method** (Utilization, Saturation, Errors) for infrastructure and **RED Method** (Rate, Errors, Duration) for services.

### 1. Cluster Health (Control Plane)
- **API Server**: Error rates (4xx/5xx), Request latency.
- **Etcd**: Database size, Leader changes.
- **Scheduler**: Pending pods count.

### 2. Node Health (Data Plane)
- **Resources**: CPU/Memory utilization vs. capacity.
- **Disk**: IOPS, Throughput, Disk Pressure.
- **Network**: Bandwidth usage, Packet drops.
- **Kubelet**: Status, Pod start latency.

### 3. Workload Health (Pods/Containers)
- **Liveness**: Is the pod running? (Restarts count).
- **Readiness**: Is the pod ready to serve traffic?
- **Resources**: CPU Throttling, OOM Kills (Memory limits).

### 4. Application Performance (APM)
- **Throughput**: Requests per second (RPS).
- **Latency**: p95 and p99 response times.
- **Error Rate**: % of failed requests.
- **Queue Depth**: SQS visible messages (Worker scaling metric).

---

## 🛠 Tooling Stack

| Tool                   | Purpose                                | Integration                  |
| ---------------------- | -------------------------------------- | ---------------------------- |
| **Metrics Server**     | Basic resource metrics (`kubectl top`) | Installed via Helm           |
| **Prometheus**         | Time-series metric collection          | Scrapes `/metrics` endpoints |
| **Grafana**            | Visualization & Dashboards             | Connects to Prometheus       |
| **AWS CloudWatch**     | Managed monitoring & Logs              | Native AWS integration       |
| **Container Insights** | EKS-specific observability             | AWS Managed                  |

---

## 📝 Best Practices

1.  **Labels**: consistently label resources (`app`, `env`, `team`) for filtering.
2.  **Probes**: Always define `livenessProbe` and `readinessProbe`.
3.  **Limits**: Set Resource Requests & Limits to avoid "Noisy Neighbor" issues.
4.  **Alerting**: Alert on **symptoms** (High Error Rate), not just causes (High CPU).

