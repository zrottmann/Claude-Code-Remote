const { Client, Storage, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68a9a5e4003518a2495b';
const API_KEY = process.env.APPWRITE_API_KEY || 'standard_b7ef639243a1823b1ae6c6aa469027831555a3ffca4fb7dcf0152b5a335c1051a1169b5c54edfe0411c635a5d2332f1da617ed10f2f080cb38c8fd636041db60333b7f53308141f889ed0c66db3cf2be92d9ad59ed73b9ca2a5a147fcfe60f692a43a47f48e30903839c5ca919535e087fe37a14391febf153e23b383a02155f';

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(API_KEY);

const storage = new Storage(client);

async function deployToAppwrite() {
  try {
    console.log('🚀 Deploying Claude Code Remote to Appwrite...');
    console.log('📍 Project:', APPWRITE_PROJECT_ID);
    console.log('🌐 Endpoint:', APPWRITE_ENDPOINT);

    // Build the application
    console.log('📦 Building Next.js application...');
    execSync('npm run build', { stdio: 'inherit' });

    // Create deployment package
    console.log('📋 Creating deployment package...');
    
    // Copy built files to deployment directory
    if (fs.existsSync('deploy')) {
      execSync('rm -rf deploy');
    }
    fs.mkdirSync('deploy');

    // Copy the out directory from Next.js build
    if (fs.existsSync('out')) {
      execSync('cp -r out/* deploy/');
    } else if (fs.existsSync('.next')) {
      // If using regular build, copy necessary files
      execSync('cp -r .next/static deploy/_next/');
      execSync('cp -r public/* deploy/');
    }

    // Create a simple package.json for Appwrite Sites
    const deployPackageJson = {
      name: 'claude-code-remote',
      version: '1.0.0',
      scripts: {
        build: 'echo "Static site ready"'
      }
    };

    fs.writeFileSync('deploy/package.json', JSON.stringify(deployPackageJson, null, 2));

    // Create tar archive for deployment
    console.log('📦 Creating deployment archive...');
    execSync('cd deploy && tar -czf ../claude-remote-site.tar.gz .');

    console.log('✅ Deployment package created: claude-remote-site.tar.gz');
    console.log('📁 Files in deployment:', fs.readdirSync('deploy').join(', '));

    console.log('\n🎉 Claude Code Remote is ready for deployment!');
    console.log('📋 Next steps:');
    console.log('   1. Go to Appwrite Console > Hosting > Sites');
    console.log('   2. Create new site or update existing one');
    console.log('   3. Upload the claude-remote-site.tar.gz file');
    console.log('   4. Your site will be available at: https://claude-remote.appwrite.network');

    return true;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return false;
  }
}

// GitHub Actions workflow for continuous deployment
const workflowContent = `name: Deploy Claude Code Remote to Appwrite

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci --legacy-peer-deps
    
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_APPWRITE_PROJECT_ID: 68a9a5e4003518a2495b
        NEXT_PUBLIC_APPWRITE_PROJECT_NAME: remote
        NEXT_PUBLIC_APPWRITE_ENDPOINT: https://nyc.cloud.appwrite.io/v1
    
    - name: Create deployment package
      run: |
        mkdir -p deploy
        cp -r out/* deploy/ || cp -r .next/static deploy/_next/
        cp -r public/* deploy/ || true
        echo '{"name": "claude-code-remote", "version": "1.0.0", "scripts": {"build": "echo ready"}}' > deploy/package.json
        cd deploy && tar -czf ../claude-remote.tar.gz .
    
    - name: Deploy to Appwrite Sites
      env:
        APPWRITE_API_KEY: \${{ secrets.APPWRITE_API_KEY }}
      run: |
        echo "Deployment package ready: claude-remote.tar.gz"
        echo "Upload to Appwrite Console or use Appwrite CLI"
        
    - name: Upload deployment artifact
      uses: actions/upload-artifact@v3
      with:
        name: claude-remote-deployment
        path: claude-remote.tar.gz
`;

// Create .github/workflows directory if it doesn't exist
if (!fs.existsSync('.github')) {
  fs.mkdirSync('.github');
}
if (!fs.existsSync('.github/workflows')) {
  fs.mkdirSync('.github/workflows');
}

fs.writeFileSync('.github/workflows/deploy-appwrite.yml', workflowContent);

if (require.main === module) {
  deployToAppwrite();
}

module.exports = { deployToAppwrite };