#!/bin/bash

# WARNING: THIS SCRIPT DELETES RESOURCES. USE WITH CAUTION.

REGION="ap-southeast-2"
export AWS_PAGER=""

echo "WARNING: This script will attempt to delete ALL resources in region $REGION."
echo "Resources to be deleted: EKS, RDS, ELB, EC2, ASG, NAT Gateways, VPCs, S3 Buckets, CloudWatch Logs."
echo "Press CTRL+C to cancel or ENTER to continue..."
read

echo "Starting nuke process in $REGION..."

# 1. EKS Clusters
echo "Checking EKS Clusters..."
CLUSTERS=$(aws eks list-clusters --region $REGION --query "clusters[]" --output text)
for cluster in $CLUSTERS; do
    echo "Deleting EKS Cluster: $cluster"
    aws eks delete-cluster --name $cluster --region $REGION
    # Wait for deletion?
done

# 2. Load Balancers (ELBv2 - ALB/NLB)
echo "Checking Load Balancers..."
LBS=$(aws elbv2 describe-load-balancers --region $REGION --query "LoadBalancers[].LoadBalancerArn" --output text)
for lb in $LBS; do
    echo "Deleting Load Balancer: $lb"
    aws elbv2 delete-load-balancer --load-balancer-arn $lb --region $REGION
done

# 3. Auto Scaling Groups
echo "Checking Auto Scaling Groups..."
ASGS=$(aws autoscaling describe-auto-scaling-groups --region $REGION --query "AutoScalingGroups[].AutoScalingGroupName" --output text)
for asg in $ASGS; do
    echo "Deleting ASG: $asg"
    aws autoscaling delete-auto-scaling-group --auto-scaling-group-name $asg --force-delete --region $REGION
done

# 4. EC2 Instances
echo "Checking EC2 Instances..."
INSTANCES=$(aws ec2 describe-instances --region $REGION --filters "Name=instance-state-name,Values=running,stopped,stopping,pending" --query "Reservations[].Instances[].InstanceId" --output text)
if [ -n "$INSTANCES" ]; then
    echo "Terminating Instances: $INSTANCES"
    aws ec2 terminate-instances --instance-ids $INSTANCES --region $REGION
    echo "Waiting for instances to terminate..."
    aws ec2 wait instance-terminated --instance-ids $INSTANCES --region $REGION
fi

# 5. RDS Instances
echo "Checking RDS Instances..."
DBS=$(aws rds describe-db-instances --region $REGION --query "DBInstances[].DBInstanceIdentifier" --output text)
for db in $DBS; do
    echo "Deleting RDS Instance: $db"
    aws rds delete-db-instance --db-instance-identifier $db --skip-final-snapshot --region $REGION
done

# 6. NAT Gateways
echo "Checking NAT Gateways..."
NAT_GWs=$(aws ec2 describe-nat-gateways --region $REGION --filter "Name=state,Values=available" --query "NatGateways[].NatGatewayId" --output text)
for nat in $NAT_GWs; do
    echo "Deleting NAT Gateway: $nat"
    aws ec2 delete-nat-gateway --nat-gateway-id $nat --region $REGION
done

# Wait for NAT Gateways to delete (required for VPC deletion)
if [ -n "$NAT_GWs" ]; then
    echo "Waiting for NAT Gateways to delete..."
    sleep 30
fi

# 7. Elastic IPs (Release unassociated ones)
echo "Checking Elastic IPs..."
EIPS=$(aws ec2 describe-addresses --region $REGION --query "Addresses[].AllocationId" --output text)
for eip in $EIPS; do
    echo "Releasing EIP: $eip"
    aws ec2 release-address --allocation-id $eip --region $REGION || echo "Failed to release $eip (might be in use)"
done

# 8. Internet Gateways
echo "Checking Internet Gateways..."
IGWS=$(aws ec2 describe-internet-gateways --region $REGION --query "InternetGateways[].InternetGatewayId" --output text)
for igw in $IGWS; do
    # Detach from VPCs first
    VPCS=$(aws ec2 describe-internet-gateways --region $REGION --internet-gateway-ids $igw --query "InternetGateways[].Attachments[].VpcId" --output text)
    for vpc in $VPCS; do
        echo "Detaching IGW $igw from $vpc"
        aws ec2 detach-internet-gateway --internet-gateway-id $igw --vpc-id $vpc --region $REGION
    done
    echo "Deleting IGW: $igw"
    aws ec2 delete-internet-gateway --internet-gateway-id $igw --region $REGION
done

# 9. Subnets
echo "Checking Subnets..."
SUBNETS=$(aws ec2 describe-subnets --region $REGION --query "Subnets[].SubnetId" --output text)
for subnet in $SUBNETS; do
    echo "Deleting Subnet: $subnet"
    aws ec2 delete-subnet --subnet-id $subnet --region $REGION
done

# 10. Security Groups (Delete all except default? Or try to delete all)
echo "Checking Security Groups..."
SGS=$(aws ec2 describe-security-groups --region $REGION --filters "Name=group-name,Values=default" --query "SecurityGroups[].GroupId" --output text)
# We can't delete 'default' groups easily, but we can try to delete others.
ALL_SGS=$(aws ec2 describe-security-groups --region $REGION --query "SecurityGroups[?GroupName!='default'].GroupId" --output text)
for sg in $ALL_SGS; do
    echo "Deleting Security Group: $sg"
    aws ec2 delete-security-group --group-id $sg --region $REGION || echo "Could not delete SG $sg (might have dependencies)"
done

# 11. VPCs
echo "Checking VPCs..."
VPCS=$(aws ec2 describe-vpcs --region $REGION --query "Vpcs[].VpcId" --output text)
for vpc in $VPCS; do
    echo "Deleting VPC: $vpc"
    aws ec2 delete-vpc --vpc-id $vpc --region $REGION || echo "Could not delete VPC $vpc (might have dependencies)"
done

# 12. S3 Buckets (Force Delete)
echo "Checking S3 Buckets..."
BUCKETS=$(aws s3api list-buckets --query "Buckets[].Name" --output text)
for bucket in $BUCKETS; do
    # Filter for buckets that look like they belong to this project or delete ALL?
    # User said "ALL REMAINING RESOURCE". I'll list them and ask or just go for it?
    # To be safe, I'll only delete buckets that contain "terraform" or "cdn" or "eks" in the name to avoid deleting personal buckets.
    if [[ "$bucket" == *"terraform"* ]] || [[ "$bucket" == *"cdn"* ]] || [[ "$bucket" == *"eks"* ]]; then
        echo "Deleting S3 Bucket: $bucket"
        aws s3 rb s3://$bucket --force
    else
        echo "Skipping S3 Bucket $bucket (name does not match 'terraform', 'cdn', or 'eks')"
    fi
done

# 13. CloudWatch Log Groups
echo "Checking CloudWatch Log Groups..."
LOG_GROUPS=$(aws logs describe-log-groups --region $REGION --query "logGroups[].logGroupName" --output text)
for group in $LOG_GROUPS; do
    if [[ "$group" == *"/aws/eks/"* ]] || [[ "$group" == *"/aws/rds/"* ]]; then
        echo "Deleting Log Group: $group"
        aws logs delete-log-group --log-group-name "$group" --region $REGION
    fi
done

echo "Nuke process completed. Please check AWS Console to verify."
