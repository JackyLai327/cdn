data "aws_caller_identity" "this" {}

locals {
  # Use the variable if provided, otherwise use the auto-detected account ID
  aws_account_id = var.aws_account_id != null ? var.aws_account_id : data.aws_caller_identity.this.account_id
}

terraform {
  # TODO: Replace with S3 backend
  backend "local" {
    path = "terraform.tfstate"
  }
}
