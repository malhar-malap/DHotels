#!/usr/bin/env bash
# Launch step: put https://dhotels24.in live through the VPS's shared front proxy.
#
# Run on the VPS from /root/DHotels once DNS for dhotels24.in and www.dhotels24.in points at this server:
#   bash deploy/enable-https.sh
#
# What it does, in order (each step stops the script if it fails):
#   1. Checks that both names resolve to this server's public IP
#   2. Gets a Let's Encrypt certificate (standalone, like the other sites here). The front proxy is
#      stopped for ~20 seconds while certbot answers the challenge, so DHAcquisitions and Jaswanti
#      Residency are briefly unreachable; renewals do the same automatically.
#   3. Adds deploy/proxy/dhotels.conf to the front proxy via the DHealth docker-compose.override.yml,
#      tests the resulting nginx config in a throwaway container, then recreates the front proxy.
#      If the live proxy fails to come up, the previous override is restored.
set -euo pipefail

DOMAIN=dhotels24.in
WWW=www.dhotels24.in
DHOTELS_DIR=/root/DHotels
PROXY_DIR="/root/DHealth Website"
OVERRIDE="$PROXY_DIR/docker-compose.override.yml"
PROXY_CONTAINER=react-frontend
CERT_EMAIL=${CERT_EMAIL:-d@dhotels24.com}

cd "$DHOTELS_DIR"

echo "== 1. DNS"
SERVER_IP=$(curl -fsS4 https://api.ipify.org)
for name in "$DOMAIN" "$WWW"; do
  resolved=$(dig +short A "$name" @1.1.1.1 | tail -1)
  if [ "$resolved" != "$SERVER_IP" ]; then
    echo "$name resolves to '${resolved:-nothing}', expected $SERVER_IP. Fix DNS and try again."
    exit 1
  fi
  echo "$name -> $resolved"
done

echo "== 2. Certificate"
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo "Certificate already exists, skipping"
else
  certbot certonly --standalone --non-interactive --agree-tos -m "$CERT_EMAIL" \
    -d "$DOMAIN" -d "$WWW" \
    --pre-hook "docker stop $PROXY_CONTAINER" --post-hook "docker start $PROXY_CONTAINER"
fi

echo "== 3. Front proxy"
docker network inspect dhotels_proxy >/dev/null 2>&1 || docker network create dhotels_proxy
if grep -q "dhotels.conf" "$OVERRIDE"; then
  echo "Front proxy already routes $DOMAIN"
else
  backup="$OVERRIDE.bak-$(date +%Y%m%d-%H%M%S)"
  cp "$OVERRIDE" "$backup"
  python3 - "$OVERRIDE" <<'PY'
import sys
path = sys.argv[1]
s = open(path).read()
mount = "      - /root/society/deploy/proxy/society.conf:/etc/nginx/conf.d/society.conf:ro\n"
assert mount in s and "      - society_proxy\n" in s and "  society_proxy:\n    external: true" in s, "override.yml has an unexpected shape; edit it by hand"
s = s.replace(mount, mount + "      - /root/DHotels/deploy/proxy/dhotels.conf:/etc/nginx/conf.d/dhotels.conf:ro\n", 1)
s = s.replace("      - society_proxy\n", "      - society_proxy\n      - dhotels_proxy\n", 1)
s = s.replace("  society_proxy:\n    external: true", "  society_proxy:\n    external: true\n  dhotels_proxy:\n    external: true", 1)
s = s.replace("# Added for Jaswanti Residency", "# Added for Jaswanti Residency and DHotels24.in (/root/DHotels)", 1)
open(path, "w").write(s)
PY

  echo "Testing the new nginx config in a throwaway container..."
  image=$(docker inspect --format '{{.Config.Image}}' "$PROXY_CONTAINER")
  if ! docker run --rm \
      -v /etc/letsencrypt:/etc/letsencrypt:ro \
      -v /root/society/deploy/proxy/society.conf:/etc/nginx/conf.d/society.conf:ro \
      -v "$DHOTELS_DIR/deploy/proxy/dhotels.conf:/etc/nginx/conf.d/dhotels.conf:ro" \
      --add-host backend:127.0.0.1 \
      "$image" nginx -t; then
    cp "$backup" "$OVERRIDE"
    echo "nginx rejected the config; override restored, nothing changed."
    exit 1
  fi

  (cd "$PROXY_DIR" && docker compose up -d --no-deps frontend)
  sleep 5
  if [ "$(docker inspect --format '{{.State.Running}}' "$PROXY_CONTAINER")" != "true" ]; then
    echo "Front proxy did not start; restoring the previous override."
    cp "$backup" "$OVERRIDE"
    (cd "$PROXY_DIR" && docker compose up -d --no-deps frontend)
    exit 1
  fi
fi

echo "== Checks"
for url in "https://$DOMAIN/" "https://$DOMAIN/api/master/categories" "https://$WWW/" "http://$DOMAIN/" \
           "https://dhacquisitions.co/" "https://jaswantiresidency.in/"; do
  printf '%-45s %s\n' "$url" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$url")"
done
echo "Done. Expect 200 for the https pages and 301 for the www/http redirects."
