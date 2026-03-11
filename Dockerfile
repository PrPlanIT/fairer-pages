# syntax=docker/dockerfile:1.7
FROM docker.io/library/alpine:3.23.3

RUN apk add --no-cache nginx python3 py3-yaml gettext && \
    # Create non-root user
    addgroup -g 10000 -S fairer && \
    adduser -u 10000 -S -G fairer -H -s /sbin/nologin fairer && \
    # Nginx directories writable by non-root
    mkdir -p /var/cache/nginx /etc/nginx/conf.d /var/lib/nginx/logs && \
    ln -sf /dev/stderr /var/lib/nginx/logs/error.log && \
    chown -R fairer:fairer /var/cache/nginx /etc/nginx/conf.d /etc/nginx/nginx.conf /var/lib/nginx && \
    # Clean up apk cache
    rm -rf /var/cache/apk/*

# Static content — owned by root, read-only to nginx process
COPY src/index.html /usr/share/nginx/html/index.html
COPY src/banner.html /usr/share/nginx/html/banner.html
COPY src/banner-fantasy.html /usr/share/nginx/html/banner-fantasy.html
COPY Readme.md /usr/share/nginx/html/Readme.md
COPY docs/ /usr/share/nginx/html/docs/
COPY src/themes/ /usr/share/nginx/html/themes/
COPY default-playlists.yml /usr/share/nginx/html/default-playlists.yml

# Nginx config templates — envsubst resolves variables at startup
COPY src/nginx.conf /etc/nginx/nginx.conf.template
COPY src/default.conf /etc/nginx/conf.d/default.conf.template

# Entrypoint
COPY src/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER 10000:10000

EXPOSE 8080

STOPSIGNAL SIGQUIT

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=2 \
  CMD wget -qO /dev/null http://localhost:${LISTEN_PORT:-8080}/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
