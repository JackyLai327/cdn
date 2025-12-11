module "cloudfront" {
  source = "../modules/cloudfront"

  domain_name = "cdn.dev.easy-cdn.com"
  aliases = []

  certificate_arn = "arn:aws:acm:us-east-1:XXXXXX~"
  origin_bucket = module.s3_app_bucket.bucket_regional_domain_name
}
