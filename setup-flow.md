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
