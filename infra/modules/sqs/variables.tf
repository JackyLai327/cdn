variable "queue_name" {
  type        = string
  description = "Name of the SQS queue"
}

variable "dlq_name" {
  type        = string
  description = "Name of the dead-letter queue (DLQ)"
}

variable "max_receive_count" {
  type        = number
  description = "Number of times a message can be received before being moved to the DLQ"
  default     = 3
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the SQS queue and DLQ"
  default     = {}
}
