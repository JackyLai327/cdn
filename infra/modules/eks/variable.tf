variable "cluster_name" {
    type        = string
    description = "The name of the EKS cluster"
}

variable "cluster_version" {
    type    = string
    default = "1.29"
}

variable "vpc_id" {
    type        = string
    description = "The ID of the VPC"
}

variable "private_subnets" {
    type        = list(string)
    description = "The list of private subnets"
}