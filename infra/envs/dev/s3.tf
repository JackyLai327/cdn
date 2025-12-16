# * OAC policy to grant CloudFront access to the bucket
data "aws_iam_policy_document" "s3_oac_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${module.s3_app_bucket.bucket_arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [module.cloudfront.distribution_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "cdn_access" {
  bucket = module.s3_app_bucket.bucket_id
  policy = data.aws_iam_policy_document.s3_oac_policy.json
}

module "s3_app_bucket" {
  source = "../../modules/s3"

  bucket_name       = "dev-app-bucket-${local.aws_account_id}"
  enable_versioning = true

  tags = {
    Environment = "dev"
    Project     = "cdn"
  }
}
