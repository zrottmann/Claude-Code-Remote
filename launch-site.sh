#!/bin/bash

# Launch Site Script for Claude Code Remote
# Site ID: 68aa1b51000a9c3a9c36

echo "🚀 Launching Claude Code Remote Site..."
echo "Site ID: 68aa1b51000a9c3a9c36"
echo "======================================="

# Navigate to project directory
cd "$(dirname "$0")" || exit 1

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check for required deployment files
echo "📋 Checking deployment files..."
if [[ -d "appwrite-deployment" ]]; then
    echo "✅ appwrite-deployment directory found"
else
    echo "❌ appwrite-deployment directory not found"
    echo "Creating appwrite-deployment directory..."
    mkdir -p appwrite-deployment
fi

if [[ -f ".github/workflows/deploy-claude-remote.yml" ]]; then
    echo "✅ GitHub Actions workflow found"
else
    echo "❌ GitHub Actions workflow not found"
    exit 1
fi

# Check git status
echo -e "\n📊 Git Status:"
git status --porcelain

# Commit changes if there are any
if [[ -n $(git status --porcelain) ]]; then
    echo -e "\n💾 Committing changes..."
    git add .
    git commit -m "🚀 Launch site deployment for ID: 68aa1b51000a9c3a9c36

🎯 Updated site configuration:
- Site ID: 68aa1b51000a9c3a9c36
- Updated GitHub Actions workflows
- Ready for deployment

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
    
    if [[ $? -eq 0 ]]; then
        echo "✅ Changes committed successfully"
    else
        echo "❌ Failed to commit changes"
        exit 1
    fi
else
    echo "✅ No uncommitted changes"
fi

# Push to trigger GitHub Actions
echo -e "\n🔄 Pushing to trigger deployment..."
git push origin master

if [[ $? -eq 0 ]]; then
    echo -e "\n🎉 Push successful! GitHub Actions deployment triggered."
    echo -e "\n🌐 Monitor deployment at:"
    echo "   https://github.com/$(git config remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git.*/\1/')/actions"
    echo -e "\n📱 Site will be available at:"
    echo "   https://68aa1b51000a9c3a9c36.appwrite.network"
    echo -e "\n⏱️  Deployment typically takes 2-3 minutes to complete."
else
    echo "❌ Failed to push to remote repository"
    exit 1
fi

echo -e "\n✅ Launch process completed!"