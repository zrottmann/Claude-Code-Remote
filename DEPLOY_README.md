# Claude Code Remote - Deployment Guide

## Overview
Claude Code Remote provides a WebSocket-based chat interface for controlling multiple Claude Code instances from a single web interface at remote.appwrite.network.

## Prerequisites
- Appwrite account with a project
- API key with `functions.write` or `sites.write` permissions
- Node.js 18+ installed

## Deployment Methods

### Method 1: Environment Variable Deployment (Recommended)

1. **Set your API key as an environment variable:**

   Windows (PowerShell):
   ```powershell
   $env:APPWRITE_API_KEY = "your-api-key-here"
   ```

   Windows (Command Prompt):
   ```cmd
   set APPWRITE_API_KEY=your-api-key-here
   ```

   Linux/Mac:
   ```bash
   export APPWRITE_API_KEY="your-api-key-here"
   ```

2. **Run the deployment script:**
   ```bash
   cd active-projects/Claude-Code-Remote
   node deploy-with-env.js
   ```

### Method 2: GitHub Actions (Automated)

1. **Set repository secrets:**
   ```bash
   gh secret set APPWRITE_API_KEY --body "your-api-key-here"
   gh secret set APPWRITE_PROJECT_ID --body "your-project-id" # Optional
   gh secret set APPWRITE_SITE_ID --body "your-site-id" # Optional
   ```

2. **Trigger deployment:**
   ```bash
   gh workflow run deploy-claude-remote.yml
   ```

   Or push changes to trigger automatically:
   ```bash
   git add .
   git commit -m "Deploy Claude Code Remote"
   git push
   ```

### Method 3: Manual Deployment Script

Run the bash script with your API key:
```bash
cd active-projects/Claude-Code-Remote
./manual-deploy.sh
```

## Configuration

### Environment Variables
Create a `.env` file based on `env.example`:

```env
# Required
APPWRITE_API_KEY=your-api-key-here

# Optional (with defaults)
APPWRITE_PROJECT_ID=68a4e3da0022f3e129d0
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_DEPLOYMENT_TARGET=remote
```

### Deployment Targets
The deployment script tries multiple targets in order:
1. `remote` function - for remote.appwrite.network
2. `super-site` function - for super.appwrite.network
3. `remote` site - Sites API deployment
4. `super-site` - Sites API fallback

## Features Deployed
Once successfully deployed, the Claude Code Remote interface provides:

- 🔌 **Multi-Console Management** - Control multiple Claude Code instances
- 💬 **Real-time Chat** - WebSocket-based messaging with typing indicators
- 📡 **Connection Management** - Add/disconnect consoles with status monitoring
- ⚡ **Quick Actions** - Common command buttons for efficient control
- 💾 **Message History** - Persistent storage using localStorage
- 🎮 **Demo Mode** - Test interface with simulated Claude responses

## Troubleshooting

### 401 Unauthorized Error
- Verify API key has `functions.write` or `sites.write` permissions
- Check API key is for the correct Appwrite project
- Ensure project ID matches your Appwrite project

### 404 Not Found Error
- Function/site may not exist - create it in Appwrite Console first
- Verify the deployment target name is correct

### JSON Validation Errors
- Remove any comments from JSON files (tsconfig.json, etc.)
- Ensure all JSON files are valid

### WebSocket Connection Issues
- Check if the Claude Code instance is running and accessible
- Verify WebSocket port is not blocked by firewall
- Test with demo mode first to isolate connection issues

## Verification

After successful deployment, verify at:
- Primary: https://remote.appwrite.network
- Fallback: https://super.appwrite.network

The interface should show:
1. Multi-console sidebar navigation
2. Chat interface with message input
3. Connection status indicators
4. Quick action buttons

## Support

For issues or questions:
- Check deployment logs: `gh run view --log`
- Review GitHub Actions: `gh run list --limit 5`
- Test with demo mode to isolate issues