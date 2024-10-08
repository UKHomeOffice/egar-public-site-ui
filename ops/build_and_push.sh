# Wait for the docker service to be up
echo "Checking for docker availability."
n=0; while [ "$n" -lt 60 ] && ! docker stats --no-stream >/dev/null 2>&1; do n=$(( n + 1 )); sleep 1; done
echo "echo docker now available."
apk --update add --no-cache aws-cli
export ECR_PASSWORD=$(aws ecr get-login-password --region eu-west-2 --output text)
docker login -u AWS -p $ECR_PASSWORD ${DOCKER_REGISTRY_URL}
docker build -t egar_ui-public-site:${DRONE_COMMIT} .
docker tag egar_ui-public-site:${DRONE_COMMIT} ${REPO}:${DRONE_COMMIT}
docker push ${REPO}:${DRONE_COMMIT}