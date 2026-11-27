#!/bin/sh
set -eu

: "${AMG_SQS_QUEUE_NAME:?Set AMG_SQS_QUEUE_NAME}"
: "${S3_DOCUMENT_BUCKET_NAME:?Set S3_DOCUMENT_BUCKET_NAME}"
: "${SQS_QUEUE_NAME:?Set SQS_QUEUE_NAME}"

endpoint="http://sgar-localstack:4566"

for bucket in "$S3_DOCUMENT_BUCKET_NAME" dev-cdlz-bucket; do
  if ! awslocal --endpoint-url "$endpoint" s3api head-bucket --bucket "$bucket" 2>/dev/null; then
    awslocal --endpoint-url "$endpoint" s3api create-bucket \
      --bucket "$bucket" \
      --create-bucket-configuration LocationConstraint=eu-west-2 >/dev/null
  fi
done

for queue in "$SQS_QUEUE_NAME" "${AMG_SQS_QUEUE_NAME}-dlq" "$AMG_SQS_QUEUE_NAME"; do
  awslocal --endpoint-url "$endpoint" sqs create-queue --queue-name "$queue" >/dev/null
done
