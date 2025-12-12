ECR_REGISTRY = 791954933241.dkr.ecr.ap-southeast-2.amazonaws.com
IMAGE_TAG = latest

login:
  aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin ${ECR_REGISTRY}

build:
  ECR_REGISTRY=${ECR_REGISTRY} IMAGE_TAG=${IMAGE_TAG} docker-compose -f docker-compose.build.yaml build

push:
  ECR_REGISTRY=${ECR_REGISTRY} IMAGE_TAG=${IMAGE_TAG} docker-compose -f docker-compose.build.yaml push

deploy: login build push
