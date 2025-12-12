ECR_API=$(shell cd ../infra/envs/prod && terraform output -raw api_repository_urls | jq -r '."cdn-api"')
ECR_WORKER=$(shell cd ../infra/envs/prod && terraform output -raw api_repository_urls | jq -r '."cdn-worker"')
IMAGE_TAG=latest

login:
  aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin ${ECR_REGISTRY}

build:
  ECR_API=${ECR_API} ECR_WORKER=${ECR_WORKER} IMAGE_TAG=${IMAGE_TAG} docker-compose -f docker-compose.build.yaml build

push:
  ECR_API=${ECR_API} ECR_WORKER=${ECR_WORKER} IMAGE_TAG=${IMAGE_TAG} docker-compose -f docker-compose.build.yaml push

deploy: login build push
