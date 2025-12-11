resource "aws_route_53_record" "cdn_alias" {
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.cdn_domain_name
    zone_id                = "Z2FDTNDATAQYW2"  # ! This is Cloudflare's zone ID
    evaluate_target_health = false
  }
}
