module "sqs" {
  source = "../../modules/sqs"

  queue_name = "dev-app-main-queue"
  dlq_name   = "dev-app-main-dlq"

  max_receive_count = 3

  tags = {
    Environment = "dev"
    Project     = "cdn"
    Name        = "dev-app-main-queue"
  }
}
