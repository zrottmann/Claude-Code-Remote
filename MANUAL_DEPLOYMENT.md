# Manual Deployment Instructions for remote.appwrite.network

## 🚀 Quick Deploy Steps

Since automated deployment requires an API key with `functions.write` permission, here are the manual steps to deploy Claude Code Remote to `remote.appwrite.network`:

### Step 1: Access Appwrite Console
1. Log into your Appwrite Console
2. Navigate to your project (ID: `68a4e3da0022f3e129d0`)

### Step 2: Create Function (if not exists)
1. Go to Functions section
2. Click "Create Function"
3. Set Function ID: `remote`
4. Name: `Claude Code Remote`
5. Runtime: `Node.js 18.0` (or latest available)

### Step 3: Deploy the Site
1. Click on the `remote` function
2. Go to "Deployments" tab
3. Click "Create Deployment"
4. Upload the deployment package:
   - File: Use `site.tar.gz` from this repository
   - Or create new: `tar -czf site.tar.gz index.html`
5. Set Entrypoint: `index.html`
6. Click "Deploy"
7. Activate the deployment

### Step 4: Configure Domain (if needed)
1. In Functions settings, ensure domain is set to `remote.appwrite.network`
2. If not available, the function will be accessible at the default Appwrite function URL

## 📦 Pre-built Deployment Package

A ready-to-deploy package is available:
- **File**: `site.tar.gz`
- **Contains**: Complete Claude Code Remote web interface
- **Size**: ~1.6 KB (compressed)

## 🎨 Site Features

The deployed site includes:
- Modern gradient design
- Feature showcase grid
- Quick setup instructions
- Direct GitHub integration
- Mobile responsive layout
- Professional animations

## ✅ Verification

Once deployed, verify at:
- Primary: https://remote.appwrite.network
- Function URL: Check Appwrite Console for exact URL

## 🔧 Alternative: Use Existing API Key

If you have an API key with proper permissions:

```bash
# Set in GitHub Secrets
gh secret set APPWRITE_API_KEY -b"your-api-key" -R zrottmann/Claude-Code-Remote

# Trigger deployment
gh workflow run deploy-appwrite.yml -R zrottmann/Claude-Code-Remote
```

## 📝 Notes

- The site is a static HTML page, no server-side code required
- Works with any Appwrite project that supports Functions
- Can also be deployed to any static hosting service

---

**Ready for manual deployment!** The repository contains everything needed. 🚀