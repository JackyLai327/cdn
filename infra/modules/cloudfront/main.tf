locals {
  origin_id = "s3-processed-origin"
}

resource "aws_cloudfront_origin_access_control" "this" {
  name                              = "cdn-oac"
  description                       = "Access control for processed CDN bucket"
  origin_access_control_origin_type = "s3"
  signing_protocol                  = "sigv4"
  signing_behavior                  = "always"
}

resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Easy CDN CloudFront Distribution"
  default_root_object = ""

  aliases = concat([var.domain_name], var.aliases)

  origin {
    domain_name = var.origin_bucket
    origin_id   = local.origin_id

    origin_access_control_id = aws_cloudfront_origin_access_control.this.id

    s3_origin_config {
      origin_access_identity = "" # ! This MUST be empty when using OAC
    }
  }

  default_cache_behavior {
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    compress = true

    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    origin_request_policy_id   = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf" # Managed-CORS-S3Origin
    response_headers_policy_id = "67f7725c-6f97-4210-82d7-5512b31e9d03" # SecurityHeadersPolicy
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  dynamic "logging_config" {
    for_each = var.enabled_logging ? [1] : []

    content {
      include_cookies = false
      bucket          = var.log_bucket
      prefix          = "cloudfront/"
    }
  }

  tags = {
    Project = "cdn"
  }
}
