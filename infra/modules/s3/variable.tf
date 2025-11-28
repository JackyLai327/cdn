variable "bucket_name" {
  type        = string
  description = "Name of the S3 bucket"
}

variable "enable_versioning" {
  type        = bool
  description = "Enable versioning for the S3 bucket to prevent data loss"
  default     = true
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the S3 bucket"
  default     = {}
}
