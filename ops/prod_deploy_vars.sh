export TAGGED_VERSION=${DRONE_COMMIT}
export DOCKER_REGISTRY_URL=${DOCKER_REGISTRY_URL}
# export KUBE_ARTIFACTORY_APP_SECRET=$${PRODUCTION_KUBE_ARTIFACTORY_APP_SECRET}
export KUBE_SERVER=${PRODUCTION_KUBE_SERVER}
export KUBE_TOKEN=${PRODUCTION_KUBE_TOKEN}
export PUBLIC_SITE_EXTERNAL_URL=${PRODUCTION_BASE_URL_SERVICE}
source ./ops/common_lib
source ./ops/prod_values