variable "name" {
    description = "Name prefix for VPC resources"
    type        = string
}

variable "cidr_block" {
    description = "CIDR block for VPC"
    type        = string
}

variable "azs" {
    description = "Availability Zones for VPC"
    type        = list(string)
}

variable "public_subnets" {
    description = "CIDR blocks for public subnets"
    type        = list(string)
}

variable "private_subnets" {
    description = "CIDR blocks for private subnets"
    type        = list(string)
}
