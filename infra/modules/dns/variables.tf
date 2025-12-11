variable "hosted_zone_id" {
  type        = string
  description = "The ID of the Route 53 hosted zone"
}

variable "domain_name" {
  type        = string
  description = "The domain name to create the alias record for"
}

variable "cdn_domain_name" {
  type        = string
  description = "The domain name of the CloudFront distribution"
}
