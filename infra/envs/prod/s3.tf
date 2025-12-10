module "s3_app_bucket" {
  source = "../../modules/s3"

  bucket_name       = "cdn-app-bucket-${local.aws_account_id}"
  enable_versioning = true

  tags = {
    Environment = "prod"
    Project     = "cdn"
  }
}
