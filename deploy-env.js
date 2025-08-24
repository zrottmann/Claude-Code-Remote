#!/usr/bin/env node

import 'dotenv/config';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from deployment.env
config({ path: 'deployment.env' });

console.log('🚀 Claude Code Remote Deployment Script');
console.log('📋 Loading environment variables from deployment.env');

// Verify environment variables are loaded
const requiredVars = ['APPWRITE_API_KEY', 'APPWRITE_PROJECT_ID'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.log('\n📝 Please ensure deployment.env contains:');
    missing.forEach(v => console.log(`   ${v}=your-value-here`));
    process.exit(1);
}

// Configuration from environment
const appwriteConfig = {
    apiKey: process.env.APPWRITE_API_KEY,
    projectId: process.env.APPWRITE_PROJECT_ID,
    endpoint: process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
    siteId: process.env.APPWRITE_SITE_ID || 'remote'
};

console.log('✅ Environment variables loaded');
console.log('📍 Project ID:', appwriteConfig.projectId);
console.log('🎯 Target Site ID:', appwriteConfig.siteId);
console.log('🔐 API Key: ***' + appwriteConfig.apiKey.slice(-8));

// Read the index.html file
const indexPath = path.join(__dirname, 'appwrite-deployment', 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error('❌ Error: index.html not found at', indexPath);
    process.exit(1);
}

console.log('📄 Loading deployment file:', indexPath);
const fileData = fs.readFileSync(indexPath);

// Create tar.gz package for deployment
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function createDeploymentPackage() {
    console.log('📦 Creating deployment package...');
    
    try {
        // Change to appwrite-deployment directory
        process.chdir(path.join(__dirname, 'appwrite-deployment'));
        
        // Create tar.gz with all necessary files
        await execAsync('tar -czf deployment.tar.gz index.html websocket-integration.js package.json');
        
        console.log('✅ Deployment package created');
        return fs.readFileSync('deployment.tar.gz');
    } catch (error) {
        console.error('❌ Failed to create deployment package:', error.message);
        
        // Fallback to just index.html
        console.log('🔄 Falling back to index.html only deployment');
        return fileData;
    }
}

async function deployToAppwrite(packageData, isArchive = true) {
    const boundary = '----WebKitFormBoundary' + Date.now();
    
    // Build multipart form data
    let body = '';
    
    if (isArchive) {
        // Archive deployment
        body += '--' + boundary + '\r\n';
        body += 'Content-Disposition: form-data; name="code"; filename="deployment.tar.gz"\r\n';
        body += 'Content-Type: application/gzip\r\n\r\n';
    } else {
        // Single file deployment
        body += '--' + boundary + '\r\n';
        body += 'Content-Disposition: form-data; name="entrypoint"\r\n\r\n';
        body += 'index.html\r\n';
        body += '--' + boundary + '\r\n';
        body += 'Content-Disposition: form-data; name="code"; filename="index.html"\r\n';
        body += 'Content-Type: text/html\r\n\r\n';
    }
    
    const bodyBuffer = Buffer.concat([
        Buffer.from(body),
        packageData,
        Buffer.from('\r\n--' + boundary + '\r\n'),
        Buffer.from('Content-Disposition: form-data; name="activate"\r\n\r\ntrue\r\n'),
        Buffer.from('--' + boundary + '--\r\n')
    ]);
    
    // Try different deployment endpoints
    const endpoints = [
        { path: `/v1/sites/${appwriteConfig.siteId}/deployments`, name: `${appwriteConfig.siteId} site` },
        { path: `/v1/functions/${appwriteConfig.siteId}/deployments`, name: `${appwriteConfig.siteId} function` },
        { path: '/v1/functions/remote/deployments', name: 'remote function' },
        { path: '/v1/functions/super-site/deployments', name: 'super-site function' },
        { path: '/v1/sites/remote/deployments', name: 'remote site' },
        { path: '/v1/sites/super-site/deployments', name: 'super-site' }
    ];
    
    for (const endpoint of endpoints) {
        console.log(`\n🎯 Attempting deployment to ${endpoint.name}...`);
        
        const success = await tryDeployment(endpoint, bodyBuffer, boundary);
        if (success) {
            return true;
        }
    }
    
    return false;
}

function tryDeployment(endpoint, bodyBuffer, boundary) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'nyc.cloud.appwrite.io',
            port: 443,
            path: endpoint.path,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': bodyBuffer.length,
                'X-Appwrite-Project': appwriteConfig.projectId,
                'X-Appwrite-Key': appwriteConfig.apiKey
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`   Status: ${res.statusCode}`);
                
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`   ✅ Deployment successful!`);
                    
                    try {
                        const result = JSON.parse(data);
                        if (result.$id) {
                            console.log(`   📋 Deployment ID: ${result.$id}`);
                        }
                    } catch (e) {
                        // Response might not be JSON
                    }
                    
                    // Show URLs based on endpoint
                    if (endpoint.name.includes('remote')) {
                        console.log('   🌐 URL: https://remote.appwrite.network');
                    } else if (endpoint.name.includes('super')) {
                        console.log('   🌐 URL: https://super.appwrite.network');
                    }
                    
                    resolve(true);
                } else {
                    console.log(`   ❌ Failed with status ${res.statusCode}`);
                    
                    try {
                        const error = JSON.parse(data);
                        console.log(`   Error: ${error.message}`);
                    } catch (e) {
                        if (data) {
                            console.log(`   Response: ${data.substring(0, 200)}`);
                        }
                    }
                    
                    resolve(false);
                }
            });
        });
        
        req.on('error', e => {
            console.log(`   ❌ Request error: ${e.message}`);
            resolve(false);
        });
        
        req.write(bodyBuffer);
        req.end();
    });
}

// Main deployment flow
async function deploy() {
    try {
        // Try archive deployment first
        const packageData = await createDeploymentPackage();
        const isArchive = packageData.length > fileData.length;
        
        console.log('\n🚀 Starting deployment process...');
        const success = await deployToAppwrite(packageData, isArchive);
        
        if (success) {
            console.log('\n🎉 Claude Code Remote Chat deployed successfully!');
            console.log('\n📱 Features now available:');
            console.log('   • Multi-console WebSocket management');
            console.log('   • Real-time chat with typing indicators');
            console.log('   • Console connection status monitoring');
            console.log('   • Quick action command buttons');
            console.log('   • Persistent message history');
            console.log('   • Demo mode for testing');
            console.log('\n🌐 Access your deployment at:');
            console.log('   Primary: https://remote.appwrite.network');
            console.log('   Fallback: https://super.appwrite.network');
        } else {
            console.log('\n❌ All deployment attempts failed');
            console.log('\n🔧 Troubleshooting:');
            console.log('   1. Check API key permissions in Appwrite Console');
            console.log('   2. Verify project ID matches your Appwrite project');
            console.log('   3. Ensure site/function exists or create it manually');
            console.log('   4. Check deployment.env has correct values');
        }
        
        // Clean up
        try {
            if (fs.existsSync('deployment.tar.gz')) {
                fs.unlinkSync('deployment.tar.gz');
                console.log('\n🧹 Cleaned up temporary files');
            }
        } catch (e) {
            // Ignore cleanup errors
        }
        
    } catch (error) {
        console.error('\n❌ Deployment error:', error.message);
        process.exit(1);
    }
}

// Run deployment
deploy();