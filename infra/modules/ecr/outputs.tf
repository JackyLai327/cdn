output "api_repository_urls" {
  description = "List of ECR repository URLs for API and worker"
  value       = { for name, repo in aws_ecr_repository.this : name => repo.repository_url }
}
