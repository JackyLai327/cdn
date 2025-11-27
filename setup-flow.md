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

- Set up vpc
- Set up public subnets
- Set up private subnets
- Set up NAT gateway
- Set up Routing tables
- Set up outputs
- Define variables in module
