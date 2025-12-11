data "aws_route53_zone" "this" {
  name = "easy-cdn.com"
}

module "dns" {
  source = "../../modules/dns"

  hosted_zone_id  = data.aws_route53_zone.this.zone_id
  domain_name     = "cdn.dev.easy-cdn.com"
  cdn_domain_name = module.cloudfront.distribution_domain
}
