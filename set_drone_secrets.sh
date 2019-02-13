#!/bin/bash

source ./.env

# Remove and re-add the secret
function secret_add() {
    drone secret rm --repository ${REPO} --name $1
    echo "Removing $1 exitcode = $?"
    drone secret add --repository ${REPO} --name $1 --value $2
    echo -e "Adding $1 exitcode = $?\n"
}

# Create secrets from .env file
for VAR in $(cat .env | awk -F[=] '{print $1}' | egrep -v "^$|^#|REPO")
do
    secret_add $VAR ${!VAR}
done

# Create registry
drone registry rm \
  --repository ${REPO} \
  --hostname ${DOCKER_REGISTRY_URL}
echo "Removing registry exitcode = $?"
drone registry add \
  --repository ${REPO} \
  --hostname ${DOCKER_REGISTRY_URL} \
  --username ${DOCKER_USERNAME} \
  --password ${DOCKER_PASSWORD}
echo -e "Adding registry exitcode = $?\n"
