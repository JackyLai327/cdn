#!/bin/sh
set -e

echo "Creating SQS queue: cdn-jobs"

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

aws --endpoint-url=http://localhost:4566 \
    --region ap-southeast-2 \
    sqs create-queue \
    --queue-name cdn-jobs || true
