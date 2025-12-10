variable "aws_region" {
  type        = string
  description = "AWS region to deploy into"
  default     = "ap-southeast-2"
}

variable "aws_account_id" {
  type        = string
  description = "AWS account ID. Leave null to automatically detect."
  default     = null
}
