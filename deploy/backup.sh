#!/usr/bin/env bash
# Nightly DHotels backup: database dump + uploaded files, kept for KEEP_DAYS days.
# Installed by cron on the VPS: 30 2 * * * /root/DHotels/deploy/backup.sh
set -euo pipefail
APP_DIR=${APP_DIR:-/root/DHotels}
DEST=${DEST:-/root/backups/dhotels}
KEEP_DAYS=${KEEP_DAYS:-14}
STAMP=$(date +%Y%m%d-%H%M%S)

umask 077
mkdir -p "$DEST"
ROOT_PW=$(grep '^DB_ROOT_PASSWORD=' "$APP_DIR/.env" | cut -d= -f2-)

docker exec -e MYSQL_PWD="$ROOT_PW" dhotels-mysql-db \
  mysqldump -uroot --single-transaction --routines --triggers dhotels_portal \
  | gzip > "$DEST/db-$STAMP.sql.gz"
tar -czf "$DEST/uploads-$STAMP.tar.gz" -C "$APP_DIR/backend" uploads

# A truncated dump is worse than none: fail loudly if it is suspiciously small
[ "$(stat -c%s "$DEST/db-$STAMP.sql.gz")" -gt 1000 ] || { echo "DHotels backup looks empty: $DEST/db-$STAMP.sql.gz" >&2; exit 1; }

find "$DEST" -name 'db-*.sql.gz' -mtime +"$KEEP_DAYS" -delete
find "$DEST" -name 'uploads-*.tar.gz' -mtime +"$KEEP_DAYS" -delete
