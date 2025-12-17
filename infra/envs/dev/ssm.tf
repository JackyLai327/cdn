resource "aws_ssm_parameter" "db_host" {
  name = "/cdn/dev/DB_HOST"
  type = "String"

  value = module.rds.db_endpoint
}

resource "aws_ssm_parameter" "s3_bucket_raw" {
  name = "/cdn/dev/S3_BUCKET_RAW"
  type = "String"

  value = module.s3_app_bucket.bucket_name
}

resource "aws_ssm_parameter" "s3_bucket_processed" {
  name = "/cdn/dev/S3_BUCKET_PROCESSED"
  type = "String"

  value = module.s3_app_bucket.bucket_name
}

resource "aws_ssm_parameter" "queue_url" {
  name = "/cdn/dev/QUEUE_URL"
  type = "String"

  value = module.sqs.main_queue_url
}

resource "aws_ssm_parameter" "db_user" {
  name = "/cdn/dev/DB_USER"
  type = "SecureString"

  value = module.rds.db_user
}

resource "aws_ssm_parameter" "db_password" {
  name = "/cdn/dev/DB_PASSWORD"
  type = "SecureString"

  value = module.rds.db_password
}

resource "aws_ssm_parameter" "jwt_secret" {
  name = "/cdn/dev/JWT_SECRET"
  type = "SecureString"

  value = module.rds.db_password
}

resource "aws_ssm_parameter" "cloudfront_distribution_id" {
  name = "/cdn/dev/CLOUDFRONT_DISTRIBUTION_ID"
  type = "SecureString"

  value = module.cloudfront.distribution_id
}
