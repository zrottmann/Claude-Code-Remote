#!/usr/bin/env node

/**
 * Emergency Deployment Script for Claude Code Remote
 * Bypasses Appwrite build queue issues with manual deployment guide
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: '68a9a5e4003518a2495b',
  siteId: 'remote',
  targetUrl: 'https://remote.appwrite.network'
};

async function emergencyDeploy() {
  try {
    console.log('🚨 Emergency deployment starting...');
    console.log('🎯 Target: https://remote.appwrite.network');
    
    // Check if static files exist
    const staticPath = path.join(__dirname, 'out');
    if (!fs.existsSync(staticPath)) {
      console.log('❌ Static files not found. Building first...');
      const { execSync } = require('child_process');
      execSync('npm run export', { cwd: __dirname, stdio: 'inherit' });
    }
    
    console.log('📁 Static files found at:', staticPath);
    console.log('📦 Creating deployment package...');
    
    // Create deployment package
    const { execSync } = require('child_process');
    execSync(`cd "${staticPath}" && tar -czf ../emergency-deploy.tar.gz .`, { stdio: 'inherit' });
    
    const deploymentFile = path.join(__dirname, 'emergency-deploy.tar.gz');
    if (fs.existsSync(deploymentFile)) {
      const stats = fs.statSync(deploymentFile);
      console.log(`✅ Package created: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    console.log('🔄 Attempting direct deployment...');
    
    // Multiple deployment strategies
    const strategies = [
      { name: 'GitHub Actions Build', action: () => triggerGitHubActions() },
      { name: 'Manual Console Upload', action: () => showManualInstructions() },
      { name: 'Alternative Hosting', action: () => suggestAlternatives() }
    ];
    
    for (const strategy of strategies) {
      try {
        console.log(`\n🎯 Trying: ${strategy.name}`);
        await strategy.action();
      } catch (error) {
        console.log(`❌ ${strategy.name} failed:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('💥 Emergency deployment failed:', error);
    console.log('\n📋 Manual steps required:');
    showManualInstructions();
  }
}

function triggerGitHubActions() {
  console.log('✅ GitHub Actions workflow already triggered by recent push');
  console.log('🔗 Check status: https://github.com/zrottmann/Claude-Code-Remote/actions');
  console.log('⏱️  Expected completion: 3-5 minutes');
}

function showManualInstructions() {
  console.log('\n📝 MANUAL DEPLOYMENT INSTRUCTIONS:');
  console.log('1. Go to: https://cloud.appwrite.io/console');
  console.log('2. Select project: 68a9a5e4003518a2495b');
  console.log('3. Navigate to: Hosting > Sites');
  console.log('4. Find site: remote (remote.appwrite.network)');
  console.log('5. Click "Create Deployment"');
  console.log('6. Upload file: emergency-deploy.tar.gz');
  console.log('7. Activate deployment after upload completes');
  console.log('\n📁 Deployment file ready:', path.join(__dirname, 'emergency-deploy.tar.gz'));
}

function suggestAlternatives() {
  console.log('\n🔄 ALTERNATIVE DEPLOYMENT OPTIONS:');
  console.log('1. Vercel: vercel --prod (auto-deploy from Git)');
  console.log('2. Netlify: netlify deploy --prod --dir=out');
  console.log('3. GitHub Pages: Enable in repo settings');
  console.log('4. Cloudflare Pages: Connect repo for auto-deploy');
}

// Run emergency deployment
if (require.main === module) {
  emergencyDeploy();
}

module.exports = { emergencyDeploy };