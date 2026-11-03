#!/usr/bin/env bash
# Finds uploaded files that nothing in the database references any more.
#
# Run on the VPS from the project folder:
#   bash scripts/find-unused-uploads.sh           # dry run: list unused files and their total size
#   bash scripts/find-unused-uploads.sh --apply   # move them to a holding folder (nothing is deleted)
#
# A file counts as "in use" if its name appears anywhere in a full database dump, so references
# from any table (listing images, CVs, verification documents, profile photos...) are covered.
# Files modified in the last 24 hours are skipped, since they may belong to a form still being filled in.
set -euo pipefail

UPLOADS_DIR="backend/uploads"
DB_CONTAINER="dhotels-mysql-db"
DB_NAME="dhotels_portal"
APPLY=false
[ "${1:-}" = "--apply" ] && APPLY=true

[ -d "$UPLOADS_DIR" ] || { echo "No $UPLOADS_DIR here - run this from the project folder."; exit 1; }

DUMP=$(mktemp)
trap 'rm -f "$DUMP"' EXIT   # the dump contains user data; never leave it behind

echo "Dumping database to check references..."
docker exec "$DB_CONTAINER" sh -c "exec mysqldump -uroot -p\"\$MYSQL_ROOT_PASSWORD\" --no-create-info --skip-extended-insert $DB_NAME" > "$DUMP" 2>/dev/null

# Safety check: if the dump failed or is empty, every file would look unused
if ! grep -q "uploads/" "$DUMP"; then
  echo "The database dump contains no upload references - aborting so nothing is moved by mistake."
  exit 1
fi

UNUSED=()
while IFS= read -r -d '' file; do
  name=$(basename "$file")
  grep -qF "$name" "$DUMP" || UNUSED+=("$file")
done < <(find "$UPLOADS_DIR" -maxdepth 1 -type f -mmin +1440 -print0)

TOTAL=$(find "$UPLOADS_DIR" -maxdepth 1 -type f | wc -l)
echo "Files in $UPLOADS_DIR: $TOTAL"
echo "Unused (not referenced anywhere in the database): ${#UNUSED[@]}"

if [ "${#UNUSED[@]}" -eq 0 ]; then
  exit 0
fi

printf '%s\0' "${UNUSED[@]}" | du -ch --files0-from=- | tail -1 | sed 's/total/total size of unused files/'

if [ "$APPLY" = false ]; then
  printf '  %s\n' "${UNUSED[@]}"
  echo
  echo "Dry run only. Re-run with --apply to move these files out of the live folder."
  exit 0
fi

HOLDING_DIR="/root/dhotels-uploads-unused-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$HOLDING_DIR"
mv "${UNUSED[@]}" "$HOLDING_DIR"/
echo "Moved ${#UNUSED[@]} files to $HOLDING_DIR"
echo "Check the site still looks right; after a week or so you can delete that folder with:"
echo "  rm -rf \"$HOLDING_DIR\""
