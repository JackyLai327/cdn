module "cloudfront" {
  source = "../modules/cloudfront"

  acm_certificate_arn = var.acm_certificate_arn
  processed_bucket_regional_domain_name = module.s3.processed_bucket_regional_domain_name


}
