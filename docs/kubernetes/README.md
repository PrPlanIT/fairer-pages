# Kubernetes Deployment

## Quick Start

```bash
kubectl apply -f docs/kubernetes/
```

This deploys a Deployment and ClusterIP Service with no namespace set — add `-n <namespace>` or set it in your kustomization overlay.

## Manifests

| File | Description |
|------|-------------|
| [deployment.yaml](deployment.yaml) | Deployment with security hardening, resource limits, and health checks |
| [service.yaml](service.yaml) | ClusterIP Service mapping port 80 to container port 8080 |

The manifests are generic templates — no namespace, no ingress, no environment-specific values. Apply them directly or use them as a kustomize base.

## Exposing the Service

Example routing manifests for common ingress/gateway setups:

| File | Description |
|------|-------------|
| [httproute-example.yaml](httproute-example.yaml) | Gateway API HTTPRoute |
| [ingress-example.yaml](ingress-example.yaml) | Nginx Ingress |
| [envoyfilter-example.yaml](envoyfilter-example.yaml) | Istio/Envoy error page injection (Lua filter) |

## Error Page Interception Policy

The EnvoyFilter uses a Lua script to intercept upstream error responses and serve themed Fairer Pages content. It is designed to be **non-invasive** — it only transforms errors for browser HTML document navigations and intentionally avoids interfering with application traffic.

### Intercept when ALL of these are true

- Request method is `GET` or `HEAD` (safe/idempotent)
- Path is **not** under excluded prefixes (`/api/`, `/auth/`)
- No `Upgrade: websocket`, `Connection: upgrade`, or `Sec-WebSocket-Key` headers
- `Accept` header contains `text/html`

### Do NOT intercept when

- Path starts with `/api/` — apps expect raw status codes for REST/WebSocket endpoints
- Path starts with `/auth/` — authentication flows must not be rewritten
- Request is a WebSocket or HTTP upgrade flow
- Request method is POST, PUT, DELETE, etc. (non-idempotent)
- Request has no `Accept: text/html` (programmatic/API clients)

### Why these exclusions matter

Applications like Home Assistant, GitLab, and Nextcloud multiplex HTML pages and control traffic (REST API, WebSocket) on the same origin. Without these guards, the error handler replaces API responses with HTML iframes, breaking WebSocket connections, mobile apps, and programmatic clients that expect raw status codes.

### Limitations

Some failures occur before there is enough HTTP context to safely classify the request (e.g., TLS handshake failures, TCP resets). The filter cannot intercept those — they surface as browser-level connection errors, not HTTP error pages.

## Custom Playlists

Mount a playlist config via ConfigMap — see [configmap-playlists-example.yaml](configmap-playlists-example.yaml) for a working example that patches the deployment with the volume and `FAIRER_PLAYLIST_FILE` environment variable.

See [default-playlists.yml](../../default-playlists.yml) for the full syntax reference.

## Security Context

The deployment enforces:

- **Non-root**: Runs as UID/GID 10000
- **Read-only root filesystem**: Only `/tmp` is writable (emptyDir)
- **No privilege escalation**: `allowPrivilegeEscalation: false`
- **All capabilities dropped**: `capabilities.drop: [ALL]`
