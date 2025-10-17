# Wait for the docker service to be up
echo "Checking for docker availability."
n=0; while [ "$n" -lt 60 ] && ! docker stats --no-stream >/dev/null 2>&1; do n=$(( n + 1 )); sleep 1; done
echo "echo docker now available."
docker build -t egar_ui-public-site:${DRONE_COMMIT} .