variable "domain_name" {
  type        = string
  description = "Domain name for the CloudFront distribution"
}

variable "aliases" {
  type        = list(string)
  description = "Aliases (additional names) for the CloudFront distribution"
  default     = []
}

variable "certificate_arn" {
  type        = string
  description = "ARN of the ACM certificate in the us-east-1 region"
}

variable "origin_bucket" {
  type        = string
  description = "Name of the S3 (processed) bucket to use as the origin for the CloudFront distribution"
}

variable "enabled_logging" {
  type        = bool
  description = "Enable CloudFront Logs"
  default     = false
}

variable "log_bucket" {
  type        = string
  description = "Name of the S3 bucket to store CloudFront logs"
  default     = ""
}
