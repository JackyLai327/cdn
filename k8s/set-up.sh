#!/bin/bash

# Set -e to exit on error
set -e

# Set -x to print each command before it is executed
set -x

EKS_NAME="dev-eks"
EKS_REGION="ap-southeast-2"
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

# Update kubeconfig
aws eks update-kubeconfig \
    --name $EKS_NAME \
    --region $EKS_REGION

# Create kube-system namespace (idempotent)
kubectl create namespace kube-system --dry-run=client -o yaml | kubectl apply -f -

# Apply metrics server manifest
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Patch metrics server to support pod metrics behind AWS networking
kubectl patch deployment metrics-server \
    -n kube-system \
    --type='json' \
    -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'

# Test metrics server (allow failure as it takes time)
kubectl top node || true

# Install aws load balancer controller

OIDC_PROVIDER_URL=$(aws eks describe-cluster \
    --name $EKS_NAME \
    --region $EKS_REGION \
    --query "cluster.identity.oidc.issuer" \
    --output text)

# Extract the OIDC ID (remove https://)
OIDC_PROVIDER_ID=${OIDC_PROVIDER_URL#https://}

# Create IAM Role Trust policy for the load balancer controller
cat <<EOF > lb-controller-trust.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER_ID}"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "${OIDC_PROVIDER_ID}:sub": "system:serviceaccount:kube-system:aws-load-balancer-controller"
                }
            }
        }
    ]
}
EOF

# Create IAM Role Permissions Policy if not existed
if [ ! -f iam_policy.json ]; then
    curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json
fi

# Apply IAM Role Permissions Policy
if ! aws iam get-policy --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy; then
    aws iam create-policy \
        --policy-name AWSLoadBalancerControllerIAMPolicy \
        --policy-document file://iam_policy.json
fi

PERMISSIONS_POLICY_ARN=arn:aws:iam::${ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy

# Create IAM Role for Load Balancer Controller
if ! aws iam get-role --role-name AmazonEKSLoadBalancerControllerRole; then
    aws iam create-role \
        --role-name AmazonEKSLoadBalancerControllerRole \
        --assume-role-policy-document file://lb-controller-trust.json
else
    aws iam update-assume-role-policy \
        --role-name AmazonEKSLoadBalancerControllerRole \
        --policy-document file://lb-controller-trust.json
fi

# Attach IAM Role Permissions Policy to the role
aws iam attach-role-policy \
    --role-name AmazonEKSLoadBalancerControllerRole \
    --policy-arn $PERMISSIONS_POLICY_ARN

# Deploy the Service Account for IRSA
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  namespace: kube-system
  name: aws-load-balancer-controller
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::${ACCOUNT_ID}:role/AmazonEKSLoadBalancerControllerRole
EOF

# Install AWS Load Balancer Controller using Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=$EKS_NAME \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=$EKS_REGION \
  --set vpcId=$(aws eks describe-cluster --region $EKS_REGION --name $EKS_NAME --query "cluster.resourcesVpcConfig.vpcId" --output text)

# Test AWS Load Balancer Controller
kubectl get deployment -n kube-system aws-load-balancer-controller

# Implement ExternalDNS

# Create IAM Permissions Policy for ExternalDNS
cat <<EOF > external-dns-policy.json
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
EOF

# Apply IAM Permissions Policy for ExternalDNS
if ! aws iam get-policy --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/ExternalDNSPolicy; then
    aws iam create-policy \
        --policy-name ExternalDNSPolicy \
        --policy-document file://external-dns-policy.json
fi

# Create IAM Role Trust Policy for ExternalDNS
cat <<EOF > external-dns-trust.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER_ID}"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "${OIDC_PROVIDER_ID}:sub": "system:serviceaccount:kube-system:external-dns"
                }
            }
        }
    ]
}
EOF

# Create ExternalDNS Role
if ! aws iam get-role --role-name ExternalDNSRole; then
    aws iam create-role \
        --role-name ExternalDNSRole \
        --assume-role-policy-document file://external-dns-trust.json
else
    aws iam update-assume-role-policy \
        --role-name ExternalDNSRole \
        --policy-document file://external-dns-trust.json
fi

# Attach IAM Permissions Policy to ExternalDNS Role
aws iam attach-role-policy \
    --role-name ExternalDNSRole \
    --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/ExternalDNSPolicy

# Install ExternalDNS using Helm
helm repo add external-dns https://kubernetes-sigs.github.io/external-dns/
helm repo update

helm upgrade --install external-dns external-dns/external-dns \
    -n kube-system \
    --set provider=aws \
    --set policy=sync \
    --set registry=txt \
    --set txtOwnerId=$EKS_NAME \
    --set serviceAccount.create=false \
    --set serviceAccount.name=external-dns \
    --set logLevel=info \
    --set aws.zoneType=public

# Test ExternalDNS
kubectl get pods -n kube-system | grep external

# Deploy Ingress
kubectl get ingress -n app || true
