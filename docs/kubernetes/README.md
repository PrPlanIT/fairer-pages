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
| [service.yaml](service.yaml) | ClusterIP Service mapping port 80 to the container's unprivileged 8080 |

The manifests are generic templates — no namespace, no ingress, no environment-specific values. Apply them directly or use them as a kustomize base.

## Exposing the Service

Example routing manifests for common ingress/gateway setups:

| File | Description |
|------|-------------|
| [httproute-example.yaml](httproute-example.yaml) | Gateway API HTTPRoute |
| [ingress-example.yaml](ingress-example.yaml) | Nginx Ingress |
| [envoyfilter-example.yaml](envoyfilter-example.yaml) | Istio/Envoy error page injection (Lua filter) |
| [httproute-playlist-example.yaml](httproute-playlist-example.yaml) | Per-domain playlist routing (one file per domain) |

## Error Page Interception Policy

The EnvoyFilter uses a Lua script to intercept upstream error responses and serve themed Fairer Pages content. It is designed to be **non-invasive** — it only transforms errors for browser HTML document navigations and intentionally avoids interfering with application traffic.

### Intercept when ALL of these are true

- Request method is `GET` — the handler writes a response body, which a `HEAD` reply must not carry
- Path is **not** under excluded prefixes (`/api/`, `/auth/`)
- No `Upgrade: websocket`, `Connection: upgrade`, or `Sec-WebSocket-Key` headers
- `Accept` header contains `text/html`

### Do NOT intercept when

- Path starts with `/api/` — apps expect raw status codes for REST/WebSocket endpoints
- Path starts with `/auth/` — authentication flows must not be rewritten
- Request is a WebSocket or HTTP upgrade flow
- Request method is anything but `GET` (non-idempotent methods, and `HEAD` for the reason above)
- Request has no `Accept: text/html` (programmatic/API clients)

### Why these exclusions matter

Applications like Home Assistant, GitLab, and Nextcloud multiplex HTML pages and control traffic (REST API, WebSocket) on the same origin. Without these guards, the error handler replaces API responses with HTML iframes, breaking WebSocket connections, mobile apps, and programmatic clients that expect raw status codes.

### Limitations

Some failures occur before there is enough HTTP context to safely classify the request (e.g., TLS handshake failures, TCP resets). The filter cannot intercept those — they surface as browser-level connection errors, not HTTP error pages.

## Routing Hosts to Playlists

The filter injects the same playlist segment for every host it covers. To vary it per
domain, rewrite that segment on the route — see
[httproute-playlist-example.yaml](httproute-playlist-example.yaml):

```yaml
- matches:
    - path:
        type: PathPrefix
        value: /fairer-pages/playlist/default/
  filters:
    - type: URLRewrite
      urlRewrite:
        path:
          type: ReplacePrefixMatch
          replacePrefixMatch: /fairer-pages/playlist/zelda/
```

Scaling this to a fleet works best as **one route file per domain**, each capped at the
Gateway API limit of 16 hostnames (`-0`, `-1`, ... beyond that). A new hostname then has
one obvious home, diffs stay scoped to the domain, and each domain owns its playlist in
one place. Every chunk of the same domain must name the same playlist.

Two things to know:

- **A host must be routed to Fairer Pages for its error pages to appear.** The injected
  page is an iframe pointing back at `/fairer-pages/` on the same host, so a host absent
  from these routes renders an empty frame.
- **The rewrite's match prefix is coupled to the segment the filter injects.** Change one
  without the other and the rewrites stop matching — domains quietly fall back to the
  injected playlist rather than failing loudly.

Naming a playlist that does not exist is not an error either: lookup is
`config[name] || config.default`, so a typo silently serves `default`.

## Custom Playlists

Mount a playlist config via ConfigMap — see [configmap-playlists-example.yaml](configmap-playlists-example.yaml) for a working example that patches the deployment with the volume and `FAIRER_PLAYLIST_FILE` environment variable.

See [default-playlists.yml](../../default-playlists.yml) for the full syntax reference.

## Security Context

The deployment enforces:

- **Non-root**: Runs as UID/GID 10000
- **Read-only root filesystem**: Only `/tmp` is writable, an emptyDir capped at 16Mi
- **No privilege escalation**: `allowPrivilegeEscalation: false`
- **All capabilities dropped**: `capabilities.drop: [ALL]` — including `NET_BIND_SERVICE`
- **Seccomp**: `RuntimeDefault`
- **No API token**: `automountServiceAccountToken: false` — it serves static pages and
  never calls the Kubernetes API, so the token is pure attack surface
- **Bounded**: CPU and memory requests and limits are set, so a runaway cannot starve
  neighbours on the node

This is why the container listens on **8080** rather than 80: an unprivileged process
cannot bind a port below 1024, and the capability that would allow it is deliberately
dropped rather than granted back. The Service absorbs the difference, mapping its own
port to the container's `http` port — so the port your routes reference is a Service
port you choose, not something the container dictates. The examples use 80; any value
works.

`replicas: 3` is a deliberate default rather than a scaling decision. Every error page
across every host you route here renders from this Deployment, so one replica means a
restart blanks errors estate-wide. At 64Mi requested, three costs little.

### Traffic policy

None of this ships with the manifests — the shape depends entirely on your CNI, mesh and
ingress — but all of it applies to this workload and is worth adding:

- **CNI network policy** (Cilium, Calico, or a plain `NetworkPolicy`): allow ingress only
  from the gateway or ingress controller that fronts it, on the container port.
- **Egress**: deny it. Nothing here reaches outward — no upstreams, no API calls, nothing
  beyond whatever DNS your platform requires.
- **Mesh authorization** (Istio, Linkerd): allow the gateway's identity rather than a
  whole namespace. That is easier if the Deployment gets a **dedicated ServiceAccount**
  instead of `default`, which these manifests also leave to you.
- **Ingress-level controls** where your controller offers them (Traefik middlewares,
  NGINX annotations) — the same intent expressed a layer up.

These are omitted rather than guessed at. A policy naming the wrong gateway, namespace or
port fails closed, and a failed-closed error-page backend means every error across your
estate renders blank — worse than having no policy at all. Write them against your own
topology and verify a real 404 still renders afterwards.

The manifests are hardened by default rather than as an opt-in. If a policy engine in
your cluster enforces a baseline (Pod Security Admission `restricted`, Kyverno, OPA),
these should pass without exceptions.
