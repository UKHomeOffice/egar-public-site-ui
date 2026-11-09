# public-site Helm chart

This chart deploys the public site resources currently represented by `ops/kube`:

- Deployment
- Service
- NetworkPolicy
- internal and external Ingress resources
- cert-manager Certificate resources
- optional Poise Ingress
- optional Artifactory image pull Secret

## Render locally

```sh
helm template public-site ./ops/helm/public-site \
  --namespace "$KUBE_NAMESPACE" \
  --set image.tag="$TAGGED_VERSION" \
  --set ingress.internal.host="$PUBLIC_SITE_INTERNAL_URL" \
  --set ingress.external.host="$PUBLIC_SITE_EXTERNAL_URL"
```

## Deploy

```sh
helm upgrade --install public-site ./ops/helm/public-site \
  --namespace "$KUBE_NAMESPACE" \
  --set image.tag="$TAGGED_VERSION" \
  --set ingress.internal.host="$PUBLIC_SITE_INTERNAL_URL" \
  --set ingress.external.host="$PUBLIC_SITE_EXTERNAL_URL"
```

For production-style deployments, disable the downscaler and set the replica count:

```sh
helm upgrade --install public-site ./ops/helm/public-site \
  --namespace "$KUBE_NAMESPACE" \
  --set image.tag="$TAGGED_VERSION" \
  --set app.replicas=3 \
  --set app.downscaler.enabled=false \
  --set ingress.internal.enabled=false \
  --set ingress.external.host="$PUBLIC_SITE_EXTERNAL_URL"
```

Enable the Poise ingress with:

```sh
--set ingress.poise.enabled=true \
--set ingress.poise.whitelistSourceRange="$POISE_CIDR_RANGE"
```
