module "sqs" {
  source = "../../modules/sqs"

  queue_name = "cdn-app-main-queue"
  dlq_name   = "cdn-app-main-dlq"

  max_receive_count = 3

  tags = {
    Environment = "prod"
    Project     = "cdn"
    Name        = "cdn-app-main-queue"
  }
}
