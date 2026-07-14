#!/bin/sh
DATE=$(date +%Y-%m-%d_%H-%M)
DUMP_FILE="/tmp/hbdwall_${DATE}.sql.gz"

pg_dump -h postgres -U hbdwall hbdwall | gzip > "$DUMP_FILE"

aws s3 cp "$DUMP_FILE" \
  "s3://${R2_BUCKET_NAME}/backups/$(basename $DUMP_FILE)" \
  --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com" \
  --no-progress

rm "$DUMP_FILE"
echo "[$(date)] Backup: $(basename $DUMP_FILE)"
