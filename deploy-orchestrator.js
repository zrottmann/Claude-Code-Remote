#!/usr/bin/env node

/**
 * Deployment Orchestrator for Claude Code Remote
 * Coordinates multiple deployment strategies simultaneously
 */

const fs = require('fs');
const { execSync } = require('child_process');

class DeploymentOrchestrator {
  constructor() {
    this.strategies = [
      { name: 'Appwrite Sites', priority: 1, method: this.checkAppwriteDeployment },
      { name: 'GitHub Actions', priority: 2, method: this.checkGitHubActions },
      { name: 'Vercel Deploy', priority: 3, method: this.deployToVercel },
      { name: 'GitHub Pages', priority: 4, method: this.checkGitHubPages },
      { name: 'Manual Upload', priority: 5, method: this.prepareManualUpload }
    ];
    
    this.config = {
      appwriteUrl: 'https://remote.appwrite.network',
      githubPagesUrl: 'https://zrottmann.github.io/Claude-Code-Remote/',
      projectId: '68a9a5e4003518a2495b',
      repoUrl: 'https://github.com/zrottmann/Claude-Code-Remote'
    };
  }

  async orchestrate() {
    console.log('🎭 DEPLOYMENT ORCHESTRATOR STARTING');
    console.log('=' .repeat(50));
    console.log(`🎯 Target: ${this.config.appwriteUrl}`);
    console.log(`📦 Project: Claude Code Remote`);
    console.log();

    const results = [];

    // Execute all strategies in parallel
    for (const strategy of this.strategies) {
      try {
        console.log(`🔄 Executing: ${strategy.name}`);
        const result = await strategy.method.call(this);
        results.push({ ...strategy, result, status: 'success' });
        console.log(`✅ ${strategy.name}: ${result.message}`);
      } catch (error) {
        results.push({ ...strategy, error: error.message, status: 'failed' });
        console.log(`❌ ${strategy.name}: ${error.message}`);
      }
      console.log();
    }

    // Summary report
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('=' .repeat(50));
    
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');
    
    if (successful.length > 0) {
      console.log('✅ SUCCESSFUL DEPLOYMENTS:');
      successful.forEach(s => {
        console.log(`   ${s.name}: ${s.result.url || s.result.message}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ FAILED DEPLOYMENTS:');
      failed.forEach(f => {
        console.log(`   ${f.name}: ${f.error}`);
      });
    }

    // Next steps
    console.log('\n🚀 NEXT STEPS:');
    if (successful.length > 0) {
      console.log('1. Monitor successful deployments');
      console.log('2. Test functionality on live sites');
      console.log('3. Update DNS if using alternatives');
    } else {
      console.log('1. Check GitHub Actions status manually');
      console.log('2. Try manual Appwrite Console upload');
      console.log('3. Consider alternative hosting platforms');
    }
    
    return results;
  }

  async checkAppwriteDeployment() {
    // Check if site is live
    const https = require('https');
    return new Promise((resolve, reject) => {
      https.get(this.config.appwriteUrl, (res) => {
        if (res.statusCode === 200) {
          resolve({ message: 'Site is live!', url: this.config.appwriteUrl });
        } else {
          reject(new Error(`HTTP ${res.statusCode} - deployment not ready`));
        }
      }).on('error', (err) => {
        reject(new Error(`Connection failed: ${err.message}`));
      });
    });
  }

  async checkGitHubActions() {
    try {
      const lastCommit = execSync('git log --oneline -1', { encoding: 'utf8' }).trim();
      return {
        message: `Workflow triggered by: ${lastCommit}`,
        url: `${this.config.repoUrl}/actions`,
        info: 'Check manually for completion status'
      };
    } catch (error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  async deployToVercel() {
    // This would require Vercel CLI to be installed
    throw new Error('Vercel CLI deployment requires manual setup');
  }

  async checkGitHubPages() {
    const https = require('https');
    return new Promise((resolve, reject) => {
      https.get(this.config.githubPagesUrl, (res) => {
        if (res.statusCode === 200) {
          resolve({ message: 'GitHub Pages is live!', url: this.config.githubPagesUrl });
        } else {
          reject(new Error(`HTTP ${res.statusCode} - GitHub Pages not ready`));
        }
      }).on('error', (err) => {
        reject(new Error(`GitHub Pages check failed: ${err.message}`));
      });
    });
  }

  async prepareManualUpload() {
    // Ensure deployment package exists
    if (!fs.existsSync('emergency-deploy.tar.gz')) {
      throw new Error('Deployment package not found');
    }
    
    const stats = fs.statSync('emergency-deploy.tar.gz');
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    return {
      message: `Package ready (${sizeMB}MB)`,
      url: 'https://cloud.appwrite.io/console',
      file: 'emergency-deploy.tar.gz'
    };
  }
}

async function main() {
  const orchestrator = new DeploymentOrchestrator();
  await orchestrator.orchestrate();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DeploymentOrchestrator };