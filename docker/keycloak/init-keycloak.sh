#!/bin/bash

set -euo pipefail

KCADM="/opt/keycloak/bin/kcadm.sh"

KEYCLOAK_URL="${KEYCLOAK_URL:-http://keycloak:8080}"
REALM="${REALM:-PEM}"

ADMIN_USERNAME="${KC_BOOTSTRAP_ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${KC_BOOTSTRAP_ADMIN_PASSWORD:-admin}"

DEMO_USERNAME="${DEMO_USERNAME:-demo}"
DEMO_PASSWORD="${DEMO_PASSWORD:-demo}"
DEMO_EMAIL="${DEMO_EMAIL:-demo@example.com}"

echo "Authenticating to Keycloak..."

"$KCADM" config credentials \
  --server "$KEYCLOAK_URL" \
  --realm master \
  --user "$ADMIN_USERNAME" \
  --password "$ADMIN_PASSWORD"

echo "Checking demo user..."

if "$KCADM" get users \
  -r "$REALM" \
  -q "username=$DEMO_USERNAME" \
  --fields username \
  --format csv \
  --noquotes |
  grep -Fxq "$DEMO_USERNAME"; then

  echo "User '$DEMO_USERNAME' already exists."
else
  echo "Creating user '$DEMO_USERNAME'..."

  "$KCADM" create users \
  -r "$REALM" \
  -s "username=$DEMO_USERNAME" \
  -s "email=$DEMO_EMAIL" \
  -s "emailVerified=true" \
  -s enabled=true

  "$KCADM" set-password \
    -r "$REALM" \
    --username "$DEMO_USERNAME" \
    --new-password "$DEMO_PASSWORD"

  echo "User '$DEMO_USERNAME' created."
fi
