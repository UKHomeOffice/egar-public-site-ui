# Wait for the docker service to be up
echo "Checking for docker availability."
n=0; while [ "$n" -lt 60 ] && ! docker stats --no-stream >/dev/null 2>&1; do n=$(( n + 1 )); sleep 1; done
apk --update add --no-cache aws-cli
export ECR_PASSWORD=$(aws ecr get-login-password --region eu-west-2 --output text)
docker login -u AWS -p $ECR_PASSWORD ${DOCKER_REGISTRY_URL}
docker push ${REPO}:${DRONE_COMMIT}