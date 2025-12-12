ECR_REGISTRY=791954933241.dkr.ecr.ap-southeast-2.amazonaws.com
ECR_API_URL=$(shell cd ../infra/envs/dev && terraform output -raw api_repository_urls | jq -r '."cdn-api"')
ECR_WORKER_URL=$(shell cd ../infra/envs/dev && terraform output -raw api_repository_urls | jq -r '."cdn-worker"')
IMAGE_TAG=latest

login:
  aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin ${ECR_REGISTRY}

build:
  ECR_API_URL=${ECR_API_URL} ECR_WORKER_URL=${ECR_WORKER_URL} IMAGE_TAG=${IMAGE_TAG} docker-compose -f docker-compose.build.yaml build

push:
  ECR_API_URL=${ECR_API_URL} ECR_WORKER_URL=${ECR_WORKER_URL} IMAGE_TAG=${IMAGE_TAG} docker-compose -f docker-compose.build.yaml push

deploy: login build push
