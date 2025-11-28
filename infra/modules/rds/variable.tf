variable "db_name" {
  type        = string
  description = "The name of the database"
}

variable "db_engine" {
  type        = string
  description = "The engine of the database"
}

variable "engine_version" {
  type        = string
  description = "The engine version of the database"
}

variable "db_username" {
  type        = string
  description = "The username of the database"
}

variable "instance_class" {
  type        = string
  description = "DB instance size"
  default     = "db.s3.micro"
}

variable "subnet_ids" {
  type        = list(string)
  description = "The subnet IDs of the database"
}

variable "vpc_id" {
  type        = string
  description = "The VPC ID of the database"
}

variable "tags" {
  type = map(string)
  description = "Tags for the database"
  default = {}
}

variable "eks_node_sg_id" {
  type        = string
  description = "The EKS node security group ID"
}
