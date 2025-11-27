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
- Define variables in module (in the dev folder's vpc.tf)
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
- Set up EKS module (in the dev folder's eks.tf)
