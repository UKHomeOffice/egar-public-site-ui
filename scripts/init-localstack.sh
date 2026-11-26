#!/bin/sh
set -eu

endpoint="http://localstack:4566"

for bucket in dev-sgar-bucket dev-cdlz-bucket; do
  if ! awslocal --endpoint-url "$endpoint" s3api head-bucket --bucket "$bucket" 2>/dev/null; then
    awslocal --endpoint-url "$endpoint" s3api create-bucket \
      --bucket "$bucket" \
      --create-bucket-configuration LocationConstraint=eu-west-2 >/dev/null
  fi
done

for queue in egar-dev-sqs egar-gateway-dlq egar-gateway; do
  awslocal --endpoint-url "$endpoint" sqs create-queue --queue-name "$queue" >/dev/null
done
