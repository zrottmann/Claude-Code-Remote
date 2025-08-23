#!/usr/bin/env node

/**
 * Deployment Status Checker for Claude Code Remote
 * Monitors deployment across multiple platforms
 */

const https = require('https');
const { execSync } = require('child_process');

async function checkUrl(url, name) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve({ name, url, status: '✅ LIVE', code: res.statusCode });
      } else {
        resolve({ name, url, status: '❌ ERROR', code: res.statusCode });
      }
    }).on('error', (err) => {
      resolve({ name, url, status: '❌ FAILED', error: err.message });
    });
  });
}

async function checkGitHubActions() {
  try {
    const output = execSync('git log --oneline -1', { encoding: 'utf8' });
    const latestCommit = output.trim();
    return {
      name: 'GitHub Actions',
      status: '🔄 Check manually',
      info: `Latest: ${latestCommit}`,
      url: 'https://github.com/zrottmann/Claude-Code-Remote/actions'
    };
  } catch (error) {
    return {
      name: 'GitHub Actions', 
      status: '❓ Unknown',
      error: error.message
    };
  }
}

async function main() {
  console.log('🔍 CLAUDE CODE REMOTE - DEPLOYMENT STATUS CHECK');
  console.log('=' .repeat(60));
  console.log();

  const checks = await Promise.all([
    checkUrl('https://remote.appwrite.network', 'Appwrite Sites (Primary)'),
    checkUrl('https://zrottmann.github.io/Claude-Code-Remote/', 'GitHub Pages'),  
    checkGitHubActions()
  ]);

  console.log('📊 DEPLOYMENT STATUS:');
  checks.forEach(check => {
    console.log(`${check.status} ${check.name}`);
    if (check.url) console.log(`   🔗 ${check.url}`);
    if (check.code) console.log(`   📋 HTTP ${check.code}`);
    if (check.info) console.log(`   ℹ️  ${check.info}`);
    if (check.error) console.log(`   ❌ ${check.error}`);
    console.log();
  });

  console.log('🎯 TARGET PRIORITIES:');
  console.log('1. remote.appwrite.network (PRIMARY)');
  console.log('2. GitHub Pages (BACKUP)');  
  console.log('3. Vercel/Netlify (ALTERNATIVES)');
  console.log();

  console.log('📦 DEPLOYMENT FILES:');
  const fs = require('fs');
  const files = [
    'emergency-deploy.tar.gz',
    'deployment-ready.tar.gz', 
    'claude-remote.tar.gz'
  ];
  
  files.forEach(file => {
    try {
      const stats = fs.statSync(file);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`✅ ${file} (${sizeMB}MB)`);
    } catch {
      console.log(`❌ ${file} (not found)`);
    }
  });

  console.log();
  console.log('⏱️  Next check in 60 seconds...');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkUrl, checkGitHubActions };