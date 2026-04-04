#!/bin/bash
# Update Render environment variable for Veritas AI backend

API_KEY="rnd_5NyQOkAODMFrAiWm66OTeO8s9rk2"
SERVICE_ID="srv-d771qbidbo4c73c2srj0"
NEW_KEY="8501c33e897e4aec941dd41fb2dc26ce"

echo "Updating NEWSAPI_KEY for service $SERVICE_ID..."

# Get current service details
echo "Fetching current service details..."
curl -s -X GET "https://api.render.com/v1/services/$SERVICE_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Accept: application/json" | jq '.service' > /tmp/service.json

# Update the service with new env var
echo "Setting NEWSAPI_KEY environment variable..."
curl -s -X PUT "https://api.render.com/v1/services/$SERVICE_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"serviceDetails\": {
      \"envSpecificDetails\": {
        \"envVars\": [
          {\"key\": \"NEWSAPI_KEY\", \"value\": \"$NEW_KEY\"}
        ]
      }
    }
  }" | jq '.'

echo ""
echo "Triggering new deploy..."
curl -s -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '{id: .id, status: .status}'

echo ""
echo "Done! The service should redeploy with the new NEWSAPI_KEY."
