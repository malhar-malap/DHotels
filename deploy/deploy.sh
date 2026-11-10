#!/usr/bin/env bash
# Pull the latest main and rebuild DHotels on the VPS. GitHub Actions runs this after CI passes;
# its SSH key is pinned to this script in /root/.ssh/authorized_keys (command="..."), so that key
# can do nothing else on the server. It can also be run by hand: bash /root/DHotels/deploy/deploy.sh
set -euo pipefail

DHOTELS_DIR=/root/DHotels
UPLOADS_BACKUP=/root/dhotels-uploads-backup

# One deploy at a time; a second push waits for the first to finish
exec 9>/var/lock/dhotels-deploy.lock
flock 9

cd "$DHOTELS_DIR"
before=$(git rev-parse --short HEAD)

# backend/uploads holds user-uploaded files and is not tracked in git. Snapshot it before the
# reset (a reset that untracks files deletes them) and restore it afterwards.
rm -rf "$UPLOADS_BACKUP"
mkdir -p "$UPLOADS_BACKUP"
[ -d backend/uploads ] && cp -a backend/uploads/. "$UPLOADS_BACKUP"/

# Match GitHub exactly. Ignored files such as .env are left alone.
git fetch --quiet origin main
git reset --quiet --hard origin/main
after=$(git rev-parse --short HEAD)
echo "Deploying $before -> $after"

mkdir -p backend/uploads
cp -a "$UPLOADS_BACKUP"/. backend/uploads/
# The backend container runs as uid 10001 (see backend/Dockerfile)
chown -R 10001:10001 backend/uploads

docker compose up --build -d --remove-orphans
docker image prune -f >/dev/null

# Wait for the backend to answer through the frontend container before calling it a success
frontend_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' dhotels-react-frontend | cut -d' ' -f1)
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null --max-time 5 "http://$frontend_ip/api/master/categories"; then
    echo "Deployed $after; the site and API are answering"
    exit 0
  fi
  sleep 5
done
echo "Deployed $after, but the API did not answer within 150s. Check: docker compose logs backend" >&2
docker compose ps
exit 1
