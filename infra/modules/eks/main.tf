module "eks" {
    source  = "terraform-aws-modules/eks/aws"
    version = "20.8.3"

    cluster_name    = var.cluster_name
    cluster_version = var.cluster_version

    vpc_id = var.vpc_id
    subnet_ids = var.private_subnets

    enable_irsa = true

    eks_managed_node_groups = {
        default = {
            name = "default"
            desired_size = 2
            max_size = 3
            min_size = 1
            instance_type = ["t3.medium"]
        }
    }
}