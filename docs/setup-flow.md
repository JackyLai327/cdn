# Setup Flow

## Scaffold Project Structure

```bash
infra
├── README.md
├── envs
│   ├── dev
│   │   ├── eks.tf
│   │   ├── main.tf
│   │   ├── providers.tf
│   │   ├── rds.tf
│   │   ├── s3.tf
│   │   ├── sqs.tf
│   │   ├── variables.tf
│   │   ├── versions.tf
│   │   └── vpc.tf
│   └── prod
│       ├── eks.tf
│       ├── main.tf
│       ├── providers.tf
│       ├── rds.tf
│       ├── s3.tf
│       ├── sqs.tf
│       ├── versions.tf
│       └── vpc.tf
├── global
│   └── backend
│       └── main.tf
└── modules
    ├── eks
    │   ├── main.tf
    │   ├── outputs.tf
    │   └── variable.tf
    ├── rds
    │   ├── main.tf
    │   ├── outputs.tf
    │   └── variable.tf
    ├── s3
    │   ├── main.tf
    │   ├── outputs.tf
    │   └── variable.tf
    ├── sqs
    │   ├── main.tf
    │   ├── outputs.tf
    │   └── variable.tf
    └── vpc
        ├── main.tf
        ├── outputs.tf
        └── variable.tf
```

## Define Provider

- Define versions of terraform and providers in versions.tf
- Define provider in providers.tf
- Define backend in main.tf
- Define region in providers.tf

## Implement VPC module

- Set up variables
- Set up vpc
- Set up public subnets
- Set up private subnets
- Set up NAT gateway
- Set up Routing tables
- Set up outputs
- Define variables in module environment (in the dev folder's vpc.tf)
- Set up EIP for NAT
- Set up NAT Gateway
- Set up route table
- Set up route to public internet (Internet Gateway)
- Set up route association (for each public subnet)
- Set up private route table
- Set up private route (NAT Gateway)
- Set up route association (for each private subnet)

## Implement EKS module

- Set up variables
- Set up EKS module (Use AWS managed node group)
- Set up outputs (EKS need oidc provider arn for IRSA (IAM Role for Service Accounts))
- Set up EKS module environment (in the dev folder's eks.tf)
- Authenticate and authorise kubectl to EKS cluster
- Update kubectl config
- Test kubectl command

## Implement S3 module

- Set up variables
- Set up S3 module
- Set up outputs
- Set up S3 module environment (in the dev folder's s3.tf)

## Implement SQS module + DLQ

- Set up variables
- Set up SQS module
- Set up DLQ module
- Set up outputs
- Set up SQS module environment (in the dev folder's sqs.tf)

## Implement RDS module

- Set up variables
- Set up RDS module
- Set up outputs
- Set up RDS module environment (in the dev folder's rds.tf)
- Test RDS from inside EKS (Bastion Pod)
- `kubectl run bastion --image=postgres:15 -- sleep infinity` => create a temporary pod
- `kubectl exec -it bastion -- bash` => enter the pod
- `psql -h <RDS_ENDPOINT> -U <RDS_USERNAME> -d <RDS_DB_NAME>` => connect to RDS
- password = `aws secretsmanager get-secret-value --secret-id <SECRET_ARN> --query SecretString --output text | jq -r .password`

## Install Metrics Server

- Create a namespace: `kubectl create namespace kube-system --dry-run=client -o yaml`
- Apply official metrics server manifest: `kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`
- AWS/EKS nodes patching to support pod metrics behind AWS networking (--kubelet-insecure-tls is needed): `kubectl patch deployment metrics-server -n kube-system \
  --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'`
- Test with top nodes: `kubectl top node`

## Install AWS Load Balancer Controller

- Get cluster OIDC provider URL

  ```bash
  aws eks describe-cluster \
    --name <CLUSTER_NAME> \
    --region <CLUSTER_REGION> \
    --query "cluster.identity.oidc.issuer" \
    --output text
  ```

- Result should look something like this: `https://oidc.eks.ap-southeast-2.amazonaws.com/id/9C2F895A3D80F16F9E164D23BAB8CA41`

- Create IAM Role Trust policy for the controller:

  ```json
  # lb-controller-trust.json
  {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::791954933241:oidc-provider/oidc.eks.ap-southeast-2.amazonaws.com/id/9C2F895A3D80F16F9E164D23BAB8CA41"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.ap-southeast-2.amazonaws.com/id/9C2F895A3D80F16F9E164D23BAB8CA41:sub": "system:serviceaccount:kube-system:aws-load-balancer-controller"
        }
      }
    }
  ]
  }
  ```

- Create IAM Role Permissions Policy

  ```bash
  # IAM Permissions Policy
  curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json

  aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
  ```

  **This will return a policy ARN, make sure to save it for the next step**

  **Make sure only the controller service account has access to assume the role**

- Create IAM Role for the controller

  ```bash
  aws iam create-role \
    --role-name AmazonEKSLoadBalancerControllerRole \
    --assume-role-policy-document file://lb-controller-trust.json
  ```

- Attach the permissions policy to the role

  ```bash
  aws iam attach-role-policy \
    --role-name AmazonEKSLoadBalancerControllerRole \
    --policy-arn <POLICY_ARN>
  ```

- Deploy the Service Account for IRSA
  
  ```bash
  kubectl apply -f - <<EOF
  apiVersion: v1
  kind: ServiceAccount
  metadata:
    namespace: kube-system
    name: aws-load-balancer-controller
    annotations:
      eks.amazonaws.com/role-arn: arn:aws:iam::<ACCOUNT_ID>:role/AmazonEKSLoadBalancerControllerRole
  EOF
  ```

- Install the AWS Load Balancer Controller using Helm

  ```bash
  helm repo add eks https://aws.github.io/eks-charts
  helm repo update

  helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=dev-eks \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller \
    --set region=ap-southeast-2 \
    --set vpcId=$(aws eks describe-cluster --region ap-southeast-2 --name dev-eks --query "cluster.resourcesVpcConfig.vpcId" --output text)
  ```

- Verify Installation: `kubectl get deployment -n kube-system aws-load-balancer-controller` (should be in a ready state)

## Implement ExternalDNS

- Create IAM Policy for ExternalDNS

  ```json
  // external-dns-policy.json
  {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "route53:ChangeResourceRecordSets"
      ],
      "Resource": [
        "arn:aws:route53:::hostedzone/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets"
      ],
      "Resource": ["*"]
    }
  ]
  }
  ```

- Apply IAM Policy for ExternalDNS

  ```bash
  aws iam create-policy \
    --policy-name ExternalDNSPolicy \
    --policy-document file://external-dns-policy.json
  ```

  **Save the output arn for the next step**

- Create IAM Role Trust Policy for ExternalDNS

  ```json
  {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::791954933241:oidc-provider/oidc.eks.ap-southeast-2.amazonaws.com/id/9C2F895A3D80F16F9E164D23BAB8CA41"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.ap-southeast-2.amazonaws.com/id/9C2F895A3D80F16F9E164D23BAB8CA41:sub": "system:serviceaccount:kube-system:external-dns"
        }
      }
    }
  ]
  }
  ```

- Create the role:

  ```bash
  aws iam create-role \
    --role-name ExternalDNSRole \
    --assume-role-policy-document file://external-dns-trust.json
  ```

- Attach the policy to the role:

  ```bash
  aws iam attach-role-policy \
    --role-name ExternalDNSRole \
    --policy-arn arn:aws:iam::791954933241:policy/ExternalDNSPolicy
  ```

- Install ExternalDNS using Helm

  ```bash
  helm repo add external-dns https://kubernetes-sigs.github.io/external-dns/
  helm repo update


  helm install external-dns external-dns/external-dns \
  -n kube-system \
  --set provider=aws \
  --set policy=sync \
  --set registry=txt \
  --set txtOwnerId=dev-eks \
  --set serviceAccount.create=false \
  --set serviceAccount.name=external-dns \
  --set logLevel=info \
  --set aws.zoneType=public
  ```

- Test ExternalDNS running in nodes: `kubectl get pods -n kube-system | grep external`

## Deploy Ingress

- Create a namespace
- Create a deployment for the app
- Create a service for the app (NodePort)
- Create an ingress for the app
- Check ALB status `kubectl get ingress -n app`

### Application Delivery + HTTPS + CI/CD

- Enable HTTPS using ACM certificates
  - Go to AWS -> ACM -> Request a certificate
  - Request a public certificate
  - Domain: *.dev.easy-cdn.com
  - Validation: DNS Validation
  - ACM will give 1-2 CNAME records -> create them in Route53
  - Wait for certificate to be issued
- Update ingress for HTTPS

### Build apps

- API Server
- Worker (Queue + Processor)
- Frontend

### Setup CloudFront

- Set up variables
- Set up CloudFront module
- Set up outputs
- Set up CloudFront module environment (in the dev folder's cloudfront.tf)
- Add S3 Policy for CloudFront to access

### Setup Route53

- Set up variables
- Set up Route53 module
- Set up Route53 module environment (in the dev folder's dns.tf)
