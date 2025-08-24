#!/bin/bash

# Manual deployment script for Claude Code Remote
# This uses the same pattern as the working Slumlord deployment

cd appwrite-deployment

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf claude-remote-deployment.tar.gz index.html websocket-integration.js package.json

# Deploy to Appwrite Sites
echo "🚀 Deploying to Appwrite Sites..."

# Using the API key pattern from successful deployments
APPWRITE_API_KEY="standard_b7ef639243a1823b1ae6c6aa469027831555a3ffca4fb7dcf0152b5a335c1051a1169b5c54edfe0411c635a5d2332f1da617ed10f2f080cb38c8fd636041db60333b7f53308141f889ed0c66db3cf2be92d9ad59ed73b9ca2a5a147fcfe60f692a43a47f48e30903839c5ca919535e087fe37a14391febf153e23b383a02155f"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://nyc.cloud.appwrite.io/v1/sites/remote/deployments" \
  -H "X-Appwrite-Project: 68a4e3da0022f3e129d0" \
  -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "code=@claude-remote-deployment.tar.gz" \
  -F "activate=true")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE_BODY"

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Deployment successful!"
  echo "🌐 Chat Interface URL: https://remote.appwrite.network"
else
  echo "❌ Deployment failed with code: $HTTP_CODE"
  
  # Try Functions deployment as fallback
  echo "🔄 Trying Functions deployment..."
  
  # Create function first
  curl -s -X POST \
    "https://nyc.cloud.appwrite.io/v1/functions" \
    -H "X-Appwrite-Project: 68a4e3da0022f3e129d0" \
    -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "functionId": "remote",
      "name": "Claude Code Remote Chat",
      "runtime": "node-18.0",
      "execute": ["any"],
      "events": [],
      "schedule": "",
      "timeout": 15
    }' || echo "Function may already exist"
  
  # Deploy to function
  FUNC_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "https://nyc.cloud.appwrite.io/v1/functions/remote/deployments" \
    -H "X-Appwrite-Project: 68a4e3da0022f3e129d0" \
    -H "X-Appwrite-Key: $APPWRITE_API_KEY" \
    -H "Content-Type: multipart/form-data" \
    -F "code=@claude-remote-deployment.tar.gz" \
    -F "entrypoint=index.html" \
    -F "activate=true")
  
  FUNC_HTTP_CODE=$(echo "$FUNC_RESPONSE" | tail -n1)
  FUNC_RESPONSE_BODY=$(echo "$FUNC_RESPONSE" | sed '$d')
  
  echo "Function Deploy Status: $FUNC_HTTP_CODE"
  echo "Function Response: $FUNC_RESPONSE_BODY"
  
  if [ "$FUNC_HTTP_CODE" -eq 201 ] || [ "$FUNC_HTTP_CODE" -eq 200 ]; then
    echo "✅ Function deployment successful!"
    echo "🌐 Function URL: https://remote.appwrite.network"
  else
    echo "❌ Both deployments failed"
    exit 1
  fi
fi

# Clean up
rm -f claude-remote-deployment.tar.gz
echo "🧹 Cleaned up temporary files"