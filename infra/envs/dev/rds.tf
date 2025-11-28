module "rds" {
  source = "../../modules/rds"

  # * Basic identifiers
  db_name = "devdb"
  db_username = "app_user"

  # * Engine details
  db_engine = "postgres"
  engine_version = "15"
  instance_class = "db.t3.micro"

  # * Networking (Connecting to existing VPC)
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids

  # * Security (Connecting to existing EKS module)
  eks_node_sg_id = module.eks.node_security_group_id

  tags = {
    Name = "dev-db"
    Environment = "dev"
    Project = "cdn"
  }
}
