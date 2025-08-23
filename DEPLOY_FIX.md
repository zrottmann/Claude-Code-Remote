# Fix for "router_rule_not_found" Error

## Problem
When accessing remote.appwrite.network on mobile, you see:
- "This page is empty, but you can make it yours"
- Error: `router_rule_not_found`

## Solution

This error occurs when Appwrite Sites doesn't have the proper routing configured. The site needs to be deployed through Appwrite Console with the correct structure.

### Option 1: Deploy via Appwrite Console (Recommended)

1. **Login to Appwrite Console**
   - Go to https://console.appwrite.io or your Appwrite instance
   - Navigate to your project (ID: `68a4e3da0022f3e129d0`)

2. **Create/Configure Site**
   - Go to "Hosting" or "Sites" section
   - Create new site with:
     - Site ID: `remote`
     - Hostname: `remote.appwrite.network`
     - Root directory: `/dist`
     - Entry point: `index.html`

3. **Upload Files**
   - Upload the `dist` folder contents from this repository
   - Or upload `appwrite-sites-deploy.tar.gz`
   - Ensure `index.html` is in the root of the deployment

4. **Activate Deployment**
   - Click "Deploy" or "Activate"
   - Wait for deployment to complete

### Option 2: Deploy via Appwrite CLI

If you have an API key with proper permissions:

```bash
# Clone repository
git clone https://github.com/zrottmann/Claude-Code-Remote.git
cd Claude-Code-Remote

# Configure Appwrite CLI
appwrite client --endpoint https://nyc.cloud.appwrite.io/v1 \
  --project-id 68a4e3da0022f3e129d0 \
  --key "your-api-key"

# Deploy site
appwrite deploy site
```

### Option 3: Manual Upload

The repository contains ready-to-deploy files:
- `dist/index.html` - Main site file
- `dist/404.html` - Error page redirect
- `appwrite.json` - Appwrite configuration

## Files Structure

```
Claude-Code-Remote/
├── dist/
│   ├── index.html    # Main site (mobile-optimized)
│   └── 404.html      # Redirect for router errors
├── appwrite.json     # Appwrite Sites configuration
└── package.json      # Build configuration
```

## Mobile Optimization

The site includes:
- Responsive viewport meta tag
- Mobile-friendly CSS breakpoints
- Touch-optimized button sizes
- Flexible grid layout
- Overflow handling for code blocks

## Verification

After deployment, test:
1. Desktop: https://remote.appwrite.network
2. Mobile: https://remote.appwrite.network (should work without router error)
3. 404 handling: https://remote.appwrite.network/any-path (should redirect to main)

## Current Status

✅ Repository configured with proper structure
✅ Mobile-optimized HTML with responsive design
✅ 404 handling for router errors
⏳ Awaiting deployment via Appwrite Console or CLI with proper permissions

---

**The site is ready for deployment!** All files are properly configured to fix the router_rule_not_found error. 🚀