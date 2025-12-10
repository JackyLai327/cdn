module "eks" {
  source = "../../modules/eks"

  cluster_name    = "prod-eks"
  cluster_version = "1.30"

  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnet_ids
}
