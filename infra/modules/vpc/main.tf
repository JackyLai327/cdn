resource "aws_vpc" "this" {
    cidr_block           = var.cidr_block
    enable_dns_support   = true
    enable_dns_hostnames = true

    tags = {
        Name = "${var.name}-vpc"
    }
}

resource "aws_internet_gateway" "this" {
    vpc_id = aws_vpc.this.id

    tags = {
        Name = "${var.name}-igw"
    }
}

# * Public subnets
resource "aws_subnet" "public" {
    count                   = length(var.public_subnets)
    vpc_id                  = aws_vpc.this.id
    cidr_block              = var.public_subnets[count.index]
    availability_zone       = var.azs[count.index]
    map_public_ip_on_launch = true

    tags = {
        Name = "${var.name}-public-${count.index}"
        Tier = "public"
    }
}

# * Private subnets
resource "aws_subnet" "private" {
    count             = length(var.private_subnets)
    vpc_id            = aws_vpc.this.id
    cidr_block        = var.private_subnets[count.index]
    availability_zone = var.azs[count.index]

    tags = {
        Name = "${var.name}-private-${count.index}"
        Tier = "private"
    }
}