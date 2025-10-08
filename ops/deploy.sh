# kd --timeout=6m --file ops/kube/artifactory-secret.yml
kd --timeout=6m --file ops/kube/public-site-network-policy.yml
# a new entry for 'kube/base/public-site-deployment.yml' was removed and put the old back in place
# this is to stop the deployment from failing when there are no changes to the image
kd --timeout=12m --file ops/kube/public-site-deployment.yml
kd --timeout=6m --file ops/kube/public-site-service.yml
kd --timeout=6m --file ops/kube/public-site-internal-ingress.yml
kd --timeout=6m --file ops/kube/public-site-internal-tls.yml
kd --timeout=6m --file ops/kube/public-site-external-ingress.yml
kd --timeout=6m --file ops/kube/public-site-external-tls.yml