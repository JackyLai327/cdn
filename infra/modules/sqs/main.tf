# * DLQ
resource "aws_sqs_queue" "dlq" {
  name = var.dlq_name

  message_retention_seconds = 14 * 24 * 60 * 60 # 14 Days

  tags = var.tags
}

# * Main queue
resource "aws_sqs_queue" "main" {
  name = var.queue_name

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = var.max_receive_count
  })

  visibility_timeout_seconds = 30

  tags = var.tags
}
