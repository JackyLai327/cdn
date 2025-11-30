# Notes for EKS

(ref: https://spacelift.io/blog/kubernetes-metrics#how-to-monitor-kubernetes-metrics-tools-for-collecting-and-monitoring)

## Important Metrics to consider

### 1. Cluster Metrics

Cluster-level metrics allow the measurements of the performance of the cluster's control plane. Components under this group include:

- Kubernetes API Server
- Controller Manager
- etcd
- Scheduler

Each provides detailed metrics in Prometheus format from its HTTP `/metrics` endpoint.

Some key metrics include:

- API server error rates (4xx and 5xx response codes)
- API server response times and sizes
- Average API server request latency
- Average scheduling attempts required for new Pods
- Number of Pods currently pending
- Controller reconciliation failure rates
- etcd read/write latency
- etcd leader election events

### 2. Node Metrics

Node-level metrics describe performance of cluster's Nodes. Metrics under this category relate to each node's resource consumption. It's also important to monitor the Kubelet process that runs on each node. (Kubelet manages communication with the cluster control plane, so any issues can prevent new actions from applying.)

Common node-level Kubernetes metrics include:

- CPU usage
- Memory usage
- Pod count
- Disk space usage
- Storage bandwidth saturation
- Network bandwidth saturation
- Desired vs running Pod count
- Kubelet operation rate
- Kubelet operation error rate
- Kubelet CPU and memory usage
- Time taken to start new pod

`P.S. Kubernetes DaemonSet can auto replicate a pod across all nodes in the cluster, ensuring monitoring coverage with minimal configuration.`

### 3. Pod, Container and Workload Metrics

Pod and container-level metrics allow the analysis of resource consumption, health and reliability at workload level. They show data on what's happening in workloads, to keep the apps running smoothly.

Some key metrics include:

- Pod-level CPU and memory consumption
- Container-level CPU and memory consumption
- Liveness, readiness and startup probe results
- Number of times that pods have been marked unhealthy (due to a failing liveness probe)
- Time taken for new pods to become ready (pass the first readiness probe)
- Number of pods in an error state (e.g. CrashLoopBackOff)
- Pod restart counts

This will be the first place to check when having issues with an app.

### 4. Network Metrics

Network metrics help track problems regarding latency, packet loss and incorrect routing.

Some frequently tracked values include:

- Overall packet loss
- Latency between services
- Average bandwidth usage
- Total network throughput
- Packet receive and transmit rates
- Ingress requests served per second
- Ingress error rates
- Ingress bandwidth usage
- Ingress requests per service
- Ingres requests served without a valid certificate

This metrics are usually provided by cluster's CNI (Container Network Interface) plugin. Ingress metrics are reported by ingress controllers such as Ingress-NGINX and Traefik.

### 5. Storage Metrics

Storage metrics monitor Kubernetes Persistent Volumes.

Some key metrics to monitor include:

- The number of volumes in the cluster
- The number of active storage classes and access modes
- Volume space usage
- Volume inodes usage
- Disk activity and utilisation

These metrics provide the data needed to reliably operate stateful apps in the cluster.

### 6. Application Metrics

Application metrics are often evaluated alongside other families discussed above. Developers create these metrics for the workloads to track the KPIs.

Suggestions for application metrics include:

- Application error rates
- Application uptime
- Successful user sign-ups
- The number of transactions processed
- Third-party integration request durations
- Job and message queue lengths

These metrics can be exposed using libraries provided by observability suites.

## Tools for Collecting and Monitoring

### Tools

- **Metrics-Server**: A Kubernetes project that provides basic Node and Pod-level resource utilization data. You can access live metrics using the kubectl top command.
- **Kube-State-Metrics**: This tool is maintained within the official Kubernetes repositories. It provides detailed metrics in Prometheus format that describe the state of the objects in your cluster, such as the number of running Pods and PVC utilization.
- **cAdvisor**: cAdvisor is an open-source container monitoring tool developed by Google. It provides metrics about running containers, including memory usage, CPU consumption, and total CPU seconds. cAdvisor is built into Kubelet, so you can access cAdvisor metrics from Kubelet’s metrics endpoint.
- **Prometheus**: Prometheus is a leading open-source time-series database that’s useful for storing and querying all types of metrics. You can use it to scrape metrics from Kubernetes control plane components, Nodes (via the Node-Exporter agent), and your own applications. Prometheus is easy to operate in Kubernetes clusters using the Kube-Prometheus-Stack community project (see below).
- **Grafana**: Grafana is a centralized observability solution that lets you build visual dashboards from your data. It works with data sources including Prometheus.
- **Kube-Prometheus-Stack**: A popular community-managed project, this Helm chart automates the installation and configuration of Prometheus and Grafana in your cluster.
- **Datadog**: Datadog is a popular observability platform that collects and stores Kubernetes metrics and logs. Deploying the Datadog Agent in your cluster automates the collection of metrics data from your environment.
- **AWS Cloud Watch and Container Insights**: These AWS-specific monitoring solutions provide deep visibility into Amazon EKS clusters and associated resources. You can analyze the metrics within your AWS account.
- **Google Cloud Monitoring**: Google’s cloud observability solution lets you monitor the health and performance of GKE clusters. You can enable cluster, Node, and workload metrics as configurable packages.

## Best Practices for Kubernetes Metrics Collection

1. Prioritise metrics that are tied to business outcomes
2. Consistently label the Kubernetes Resources
3. Only monitor relevant and actionable metrics
4. Correlate metrics changes to system activity with logs and traces
5. Use metrics to automate cluster operations
