# * Subnet group that the database will be created in
resource "aws_db_subnet_group" "this" {
  name       = "${replace(var.db_name, "_", "-")}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = var.tags
}

# * Security group for the database
resource "aws_security_group" "this" {
  name        = "${var.db_name}-sg"
  description = "Security group for ${var.db_name}"
  vpc_id      = var.vpc_id
  ingress {
    description = "PostgreSQL from EKS worker nodes"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"

    # ! Use security groups instead of cidr_blocks for better security and allows IRSA with node-to-pod identity
    security_groups = [
      var.eks_node_sg_id
    ]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

# * Generate a random password for the database
resource "random_password" "password" {
  length  = 16
  special = true
}

# * Store password in Secrets Manager
resource "aws_secretsmanager_secret" "db" {
  name = "${var.db_name}-credentials"
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.password.result
  })
}

# * RDS Instance
resource "aws_db_instance" "this" {
  identifier        = replace(var.db_name, "_", "-")
  allocated_storage = 20
  engine            = var.db_engine
  engine_version    = var.engine_version
  instance_class    = var.instance_class

  db_name  = replace(var.db_name, "-", "_")
  username = var.db_username
  password = random_password.password.result

  # ! No multi AZ for now
  multi_az            = false
  publicly_accessible = false

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.this.id]

  backup_retention_period = 7
  # ! No final snapshot for now, but in production will need to set up final_snapshot_identifier
  skip_final_snapshot = true

  tags = var.tags
}
