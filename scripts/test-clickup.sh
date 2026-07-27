#!/bin/bash

# Smoke test for ClickUp Integration Endpoints

if [ -z "$1" ]; then
  echo "Usage: ./scripts/test-clickup.sh <JWT_TOKEN>"
  echo "Please provide a valid JWT token for an admin/gerencia user."
  exit 1
fi

TOKEN=$1
API_URL="http://127.0.0.1:3011/clickup"

echo "=== Testing /clickup/status ==="
curl -s -H "Authorization: Bearer $TOKEN" $API_URL/status | jq
echo ""

echo "=== Testing /clickup/workspaces ==="
curl -s -H "Authorization: Bearer $TOKEN" $API_URL/workspaces | jq
echo ""

echo "=== Testing /clickup/members ==="
curl -s -H "Authorization: Bearer $TOKEN" $API_URL/members | jq
echo ""

echo "=== Testing /clickup/tasks ==="
curl -s -H "Authorization: Bearer $TOKEN" $API_URL/tasks | jq
echo ""

echo "Smoke test finished."
