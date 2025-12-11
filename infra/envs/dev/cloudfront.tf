module "cloudfront" {
  source = "../../modules/cloudfront"

  domain_name = "cdn.dev.easy-cdn.com"
  aliases = []

  certificate_arn = "arn:aws:acm:us-east-1:791954933241:certificate/f5f226e0-6cbc-4ee2-93e0-d9ed033555f4"
  origin_bucket = module.s3_app_bucket.bucket_regional_domain_name
}
