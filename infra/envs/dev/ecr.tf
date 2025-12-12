module "ecr" {
  source = "../../modules/ecr"

  repository_names = ["cdn-api", "cdn-worker"]
}
