data "aws_iam_openid_connect_provider" "eks" {
  url = module.eks.cluster_oidc_issuer_url
}

data "aws_iam_policy_document" "cdn_app_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.eks.arn]
    }

    condition {
      test = "StringEquals"
      variable = "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:sub"
      values = ["system:serviceaccount:cdn:cdn-service-account"]
    }
  }
}

data "aws_iam_policy_document" "cdn_app_permissions" {
  # * S3 Access
  statement {
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ]
    resources = [
      module.s3_app_bucket.bucket_arn,
      "${module.s3_app_bucket.bucket_arn}/*"
    ]
  }
}

resource "aws_iam_role" "cdn_app_role" {
  name = "cdn-app-role"
  assume_role_policy = data.aws_iam_policy_document.cdn_app_trust.json
}

resource "aws_iam_role_policy" "cdn_app_policy" {
  name = "cdn-app-permissions"
  role = aws_iam_role.cdn_app_role.id
  policy = data.aws_iam_policy_document.cdn_app_permissions.json
}
