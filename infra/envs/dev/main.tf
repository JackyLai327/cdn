terraform {
  # TODO: Replace with S3 backend
  backend "local" {
    path = "terraform.tfstate"
  }
}
