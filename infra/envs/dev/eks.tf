module "eks" {
    source = "../../modules/eks"

    cluster_name    = "dev-eks"
    cluster_version = "1.29"

    vpc_id          = module.vpc.vpc_id
    private_subnets = module.vpc.private_subnet_ids
}