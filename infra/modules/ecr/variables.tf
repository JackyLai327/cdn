variable "repository_names" {
  type        = list(string)
  description = "List of image repository names"
  default     = ["cdn-api", "cdn-worker"]
}
