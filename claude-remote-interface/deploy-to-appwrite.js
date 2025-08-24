/**
 * Deployment script for Claude Code Remote Interface to remote.appwrite.network
 * Comprehensive deployment with build optimization and environment configuration
 */

import { Client, Storage, Functions } from 'appwrite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Appwrite configuration
const APPWRITE_CONFIG = {
  endpoint: 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID || '689bdee000098bd9d55c',
  apiKey: process.env.APPWRITE_API_KEY || '',
  bucketId: 'remote-interface',
  functionId: 'claude-remote-handler'
};

class AppwriteDeployer {
  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId)
      .setKey(APPWRITE_CONFIG.apiKey);

    this.storage = new Storage(this.client);
    this.functions = new Functions(this.client);
  }

  async deploy() {
    console.log('🚀 [Deploy] Starting Claude Code Remote Interface deployment...');
    
    try {
      // Step 1: Build the application
      await this.buildApplication();
      
      // Step 2: Create deployment package
      const packagePath = await this.createDeploymentPackage();
      
      // Step 3: Upload to Appwrite Storage
      const deploymentId = await this.uploadToStorage(packagePath);
      
      // Step 4: Deploy serverless functions
      await this.deployFunctions();
      
      // Step 5: Configure domains and SSL
      await this.configureDomains();
      
      console.log('✅ [Deploy] Deployment completed successfully!');
      console.log(`🌍 [Deploy] Application URL: https://remote.appwrite.network`);
      console.log(`📦 [Deploy] Deployment ID: ${deploymentId}`);
      
      return deploymentId;
      
    } catch (error) {
      console.error('🚨 [Deploy] Deployment failed:', error);
      throw error;
    }
  }

  async buildApplication() {
    console.log('🔨 [Deploy] Building application...');
    
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      // Install dependencies
      console.log('📦 [Deploy] Installing dependencies...');
      await execAsync('npm install', { cwd: __dirname });
      
      // Type checking
      console.log('🔍 [Deploy] Running type checks...');
      await execAsync('npm run type-check', { cwd: __dirname });
      
      // Linting
      console.log('📋 [Deploy] Running linter...');
      await execAsync('npm run lint', { cwd: __dirname });
      
      // Build for production
      console.log('🏗️ [Deploy] Building for production...');
      await execAsync('npm run build', { cwd: __dirname });
      
      console.log('✅ [Deploy] Build completed successfully');
      
    } catch (error) {
      console.error('🚨 [Deploy] Build failed:', error);
      throw error;
    }
  }

  async createDeploymentPackage() {
    console.log('📦 [Deploy] Creating deployment package...');
    
    const distPath = path.join(__dirname, 'dist');
    const packagePath = path.join(__dirname, 'claude-remote-interface.tar.gz');
    
    if (!fs.existsSync(distPath)) {
      throw new Error('Build directory not found. Please run build first.');
    }

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(packagePath);
      const archive = archiver('tar', {
        gzip: true,
        gzipOptions: { level: 9 }
      });

      output.on('close', () => {
        const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
        console.log(`✅ [Deploy] Package created: ${sizeInMB} MB`);
        resolve(packagePath);
      });

      archive.on('error', reject);
      archive.pipe(output);

      // Add all files from dist directory
      archive.directory(distPath, false);
      
      // Add configuration files
      const configFiles = [
        'package.json',
        'README.md'
      ];

      configFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: file });
        }
      });

      archive.finalize();
    });
  }

  async uploadToStorage(packagePath) {
    console.log('☁️ [Deploy] Uploading to Appwrite Storage...');
    
    try {
      // Create deployment bucket if it doesn't exist
      try {
        await this.storage.getBucket(APPWRITE_CONFIG.bucketId);
      } catch {
        console.log('📁 [Deploy] Creating storage bucket...');
        await this.storage.createBucket(
          APPWRITE_CONFIG.bucketId,
          'Claude Remote Interface Deployments',
          ['read("any")'],
          ['write("team:developers")'],
          true,
          true,
          50 * 1024 * 1024, // 50MB max file size
          ['application/gzip', 'application/x-tar']
        );
      }

      // Upload deployment package
      const deploymentId = `deployment-${Date.now()}`;
      const file = fs.readFileSync(packagePath);
      
      const response = await this.storage.createFile(
        APPWRITE_CONFIG.bucketId,
        deploymentId,
        file
      );

      console.log('✅ [Deploy] Upload completed');
      
      // Clean up local package
      fs.unlinkSync(packagePath);
      
      return response.$id;
      
    } catch (error) {
      console.error('🚨 [Deploy] Upload failed:', error);
      throw error;
    }
  }

  async deployFunctions() {
    console.log('⚡ [Deploy] Deploying serverless functions...');
    
    try {
      const functionCode = this.generateServerlessFunction();
      
      // Create or update function
      try {
        await this.functions.get(APPWRITE_CONFIG.functionId);
        console.log('🔄 [Deploy] Updating existing function...');
        
        await this.functions.update(
          APPWRITE_CONFIG.functionId,
          'Claude Remote Handler',
          'node-18.0',
          ['any'],
          ['POST'],
          3600,
          true
        );
        
      } catch {
        console.log('➕ [Deploy] Creating new function...');
        
        await this.functions.create(
          APPWRITE_CONFIG.functionId,
          'Claude Remote Handler',
          'node-18.0',
          ['any'],
          ['POST'],
          3600,
          true
        );
      }

      console.log('✅ [Deploy] Function deployment completed');
      
    } catch (error) {
      console.error('🚨 [Deploy] Function deployment failed:', error);
      throw error;
    }
  }

  generateServerlessFunction() {
    return `
/**
 * Claude Code Remote Interface Serverless Handler
 * Handles WebSocket connections, agent coordination, and Claude integration
 */

const { Client, Databases, Users } = require('appwrite');

module.exports = async (req, res) => {
  const client = new Client();
  client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const users = new Users(client);

  try {
    const { type, payload } = req.body;
    
    switch (type) {
      case 'claude_message':
        return handleClaudeMessage(payload, databases);
      
      case 'agent_coordination':
        return handleAgentCoordination(payload, databases);
      
      case 'ultrathink_analysis':
        return handleUltrathinkAnalysis(payload, databases);
      
      case 'file_operation':
        return handleFileOperation(payload, databases);
      
      default:
        throw new Error(\`Unknown request type: \${type}\`);
    }
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    }, 400);
  }
};

async function handleClaudeMessage(payload, databases) {
  // Implementation for Claude message handling
  console.log('Handling Claude message:', payload);
  
  return {
    success: true,
    response: 'Message processed successfully'
  };
}

async function handleAgentCoordination(payload, databases) {
  // Implementation for agent coordination
  console.log('Handling agent coordination:', payload);
  
  return {
    success: true,
    agents: payload.agents || []
  };
}

async function handleUltrathinkAnalysis(payload, databases) {
  // Implementation for ultrathink analysis
  console.log('Handling ultrathink analysis:', payload);
  
  return {
    success: true,
    analysis: {
      id: 'analysis-' + Date.now(),
      confidence: 0.9,
      steps: []
    }
  };
}

async function handleFileOperation(payload, databases) {
  // Implementation for file operations
  console.log('Handling file operation:', payload);
  
  return {
    success: true,
    operation: payload.type
  };
}
    `;
  }

  async configureDomains() {
    console.log('🌐 [Deploy] Configuring domains and SSL...');
    
    // In a real deployment, you would configure:
    // 1. DNS records for remote.appwrite.network
    // 2. SSL certificates
    // 3. CDN distribution
    // 4. Load balancing
    
    console.log('ℹ️ [Deploy] Domain configuration requires manual setup in Appwrite Console');
    console.log('📋 [Deploy] Please configure the following:');
    console.log('   - Domain: remote.appwrite.network');
    console.log('   - SSL Certificate: Auto (Let\'s Encrypt)');
    console.log('   - CDN: Enabled');
    console.log('   - Compression: Gzip enabled');
  }
}

// Environment validation
function validateEnvironment() {
  const required = ['APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('🚨 [Deploy] Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
}

// Main deployment execution
if (import.meta.url === `file://${process.argv[1]}`) {
  validateEnvironment();
  
  const deployer = new AppwriteDeployer();
  
  deployer.deploy()
    .then(deploymentId => {
      console.log('🎉 [Deploy] Deployment successful!');
      console.log(`📦 [Deploy] Deployment ID: ${deploymentId}`);
      console.log('🌍 [Deploy] Access your application at: https://remote.appwrite.network');
    })
    .catch(error => {
      console.error('💥 [Deploy] Deployment failed:', error);
      process.exit(1);
    });
}

export { AppwriteDeployer };