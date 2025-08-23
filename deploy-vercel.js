#!/usr/bin/env node

/**
 * Vercel Deployment Script for Claude Code Remote
 * Alternative hosting with custom domain support
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function deployToVercel() {
  try {
    console.log('🚀 Deploying to Vercel...');
    
    // Check if Vercel CLI is installed
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI found');
    } catch (error) {
      console.log('❌ Vercel CLI not found. Installing...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
    }
    
    // Ensure static build exists
    if (!fs.existsSync('out')) {
      console.log('📦 Building static export...');
      execSync('npm run export', { stdio: 'inherit' });
    }
    
    console.log('🔄 Starting Vercel deployment...');
    
    // Deploy to production
    const deployResult = execSync('vercel --prod --cwd out --yes', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const deployUrl = deployResult.trim().split('\n').pop();
    
    console.log('✅ Vercel deployment successful!');
    console.log(`🌐 Live URL: ${deployUrl}`);
    console.log('📋 To add custom domain (remote.appwrite.network):');
    console.log('   1. Go to Vercel Dashboard');
    console.log('   2. Select your project');
    console.log('   3. Add domain: remote.appwrite.network');
    console.log('   4. Configure DNS CNAME: remote -> cname.vercel-dns.com');
    
    return deployUrl;
    
  } catch (error) {
    console.error('❌ Vercel deployment failed:', error.message);
    console.log('\n📝 Manual Vercel deployment:');
    console.log('1. Install: npm install -g vercel');
    console.log('2. Deploy: cd out && vercel --prod');
    console.log('3. Add domain in Vercel dashboard');
    
    throw error;
  }
}

if (require.main === module) {
  deployToVercel().catch(() => process.exit(1));
}

module.exports = { deployToVercel };