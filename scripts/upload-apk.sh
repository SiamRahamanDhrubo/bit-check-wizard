#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
FILE_PATH="${1:-}"
DESTINATION="${2:-}"

if [[ -z "$FILE_PATH" || -z "$DESTINATION" ]]; then
  echo "Usage: scripts/upload-apk.sh /path/to/file.apk <destination-name.apk>" >&2
  echo "Destinations: minecraft-arm-v8a-with-music.apk, minecraft-arm-v8a-without-music.apk," >&2
  echo "             minecraft-armeabi-with-music.apk, minecraft-armeabi-without-music.apk" >&2
  exit 2
fi

if [[ ! -f "$FILE_PATH" || "${FILE_PATH##*.}" != "apk" ]]; then
  echo "Choose an existing .apk file." >&2
  exit 2
fi

case "$DESTINATION" in
  minecraft-arm-v8a-with-music.apk|minecraft-arm-v8a-without-music.apk|minecraft-armeabi-with-music.apk|minecraft-armeabi-without-music.apk) ;;
  *) echo "That destination name is not supported." >&2; exit 2 ;;
esac

if ! command -v curl >/dev/null || ! command -v python3 >/dev/null; then
  echo "This script needs curl and Python 3." >&2
  exit 2
fi

ENV_FILE="$PROJECT_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Run this from a project copy that contains its .env file." >&2
  exit 2
fi

mapfile -t PROJECT_CONFIG < <(python3 - "$ENV_FILE" <<'PY'
import sys
values = {}
with open(sys.argv[1], encoding="utf-8") as env_file:
    for line in env_file:
        if line.startswith("VITE_SUPABASE_URL=") or line.startswith("VITE_SUPABASE_PUBLISHABLE_KEY="):
            key, value = line.rstrip("\n").split("=", 1)
            values[key] = value.strip().strip('"').strip("'")
print(values.get("VITE_SUPABASE_URL", ""))
print(values.get("VITE_SUPABASE_PUBLISHABLE_KEY", ""))
PY
)
SUPABASE_URL="${PROJECT_CONFIG[0]:-}"
PUBLISHABLE_KEY="${PROJECT_CONFIG[1]:-}"
if [[ -z "$SUPABASE_URL" || -z "$PUBLISHABLE_KEY" ]]; then
  echo "The project URL or public key is missing from .env." >&2
  exit 2
fi

FILE_SIZE="$(wc -c < "$FILE_PATH" | tr -d '[:space:]')"
if (( FILE_SIZE < 1 || FILE_SIZE > 524288000 )); then
  echo "The APK must be between 1 byte and 500 MB." >&2
  exit 2
fi

UPLOAD_PASSWORD="${MCEDIT_APK_UPLOAD_PASSWORD:-}"
if [[ -z "$UPLOAD_PASSWORD" ]]; then
  read -r -s -p "APK upload password: " UPLOAD_PASSWORD
  printf '\n'
fi
if [[ -z "$UPLOAD_PASSWORD" ]]; then
  echo "An upload password is required." >&2
  exit 2
fi

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"; unset UPLOAD_PASSWORD' EXIT
REQUEST_BODY="$(python3 - "$DESTINATION" "$FILE_SIZE" <<'PY'
import json, sys
print(json.dumps({"action": "upload", "filename": sys.argv[1], "size": int(sys.argv[2])}))
PY
)"

SIGN_STATUS="$(curl --silent --show-error --output "$TEMP_DIR/sign.json" --write-out '%{http_code}' \
  -X POST "$SUPABASE_URL/functions/v1/apk-files" \
  -H "apikey: $PUBLISHABLE_KEY" \
  -H 'Content-Type: application/json' \
  -H "x-upload-password: $UPLOAD_PASSWORD" \
  --data "$REQUEST_BODY")"
if [[ "$SIGN_STATUS" != "200" ]]; then
  echo "Could not authorize the upload (HTTP $SIGN_STATUS)." >&2
  python3 - "$TEMP_DIR/sign.json" <<'PY'
import json, sys
try:
    print(json.load(open(sys.argv[1], encoding="utf-8")).get("error", "Please check your password and try again."), file=sys.stderr)
except Exception:
    print("Please check your password and try again.", file=sys.stderr)
PY
  exit 1
fi

SIGNED_URL="$(python3 - "$TEMP_DIR/sign.json" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8")).get("signedUrl", ""))
PY
)"
if [[ -z "$SIGNED_URL" ]]; then
  echo "The upload link could not be created." >&2
  exit 1
fi

UPLOAD_STATUS="$(curl --silent --show-error --output "$TEMP_DIR/upload.json" --write-out '%{http_code}' \
  -X PUT "$SIGNED_URL" \
  -H "apikey: $PUBLISHABLE_KEY" \
  -H 'Content-Type: application/vnd.android.package-archive' \
  -H 'x-upsert: true' \
  --data-binary "@$FILE_PATH")"
unset SIGNED_URL UPLOAD_PASSWORD
if [[ "$UPLOAD_STATUS" != "200" && "$UPLOAD_STATUS" != "201" ]]; then
  echo "Upload failed (HTTP $UPLOAD_STATUS). Please retry." >&2
  exit 1
fi

echo "Upload complete: $DESTINATION"
echo "The Minecraft APK page will serve this file on future downloads."