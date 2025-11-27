module "vpc" {
    source = "../../modules/vpc"

    name       = "dev"
    cidr_block = "10.0.0.0/16"
    azs        = ["ap-southeast-2a", "ap-southeast-2b", "ap-southeast-2c"]

    public_subnets = [
        "10.0.1.0/24",
        "10.0.2.0/24",
        "10.0.3.0/24",
    ]

    private_subnets = [
        "10.0.11.0/24",
        "10.0.12.0/24",
        "10.0.13.0/24",
    ]
}