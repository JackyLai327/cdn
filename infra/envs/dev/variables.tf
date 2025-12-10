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

variable "acm_certificate_arn" {
  type        = string
  description = "ARN of the ACM certificate"
  default     = "arn:aws:acm:us-east-1:XXXXXX~"
}
