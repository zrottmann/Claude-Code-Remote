#!/usr/bin/env node

/**
 * Direct Deployment Script - No GitHub Secrets Required
 * Uses the proven superconsole working configuration
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Your Appwrite project configuration
const config = {
    projectId: '68aa1a4500288bc04682',
    siteId: '68aa1b51000a9c3a9c36',
    endpoint: 'nyc.cloud.appwrite.io',
    // Note: You'll need to provide the API key when running this script
    apiKey: process.env.APPWRITE_API_KEY || process.argv[2]
};

console.log('🚀 Claude Code Remote - Direct Deployment');
console.log('==========================================');
console.log(`📦 Project: ${config.projectId}`);
console.log(`🎯 Site: ${config.siteId}`);
console.log(`🌐 Endpoint: ${config.endpoint}`);

if (!config.apiKey) {
    console.log('❌ Error: API key required');
    console.log('Usage: node deploy-direct.js <YOUR_API_KEY>');
    console.log('   or: APPWRITE_API_KEY=<key> node deploy-direct.js');
    process.exit(1);
}

async function createDeploymentPackage() {
    console.log('\n📦 Creating deployment package...');
    
    const deploymentDir = path.join(__dirname, 'appwrite-deployment');
    
    if (!fs.existsSync(deploymentDir)) {
        throw new Error('appwrite-deployment directory not found');
    }
    
    const indexPath = path.join(deploymentDir, 'index.html');
    const packagePath = path.join(deploymentDir, 'package.json');
    
    if (!fs.existsSync(indexPath) || !fs.existsSync(packagePath)) {
        throw new Error('Required files (index.html, package.json) not found');
    }
    
    console.log('✅ Required files found');
    console.log(`   📄 index.html: ${(fs.statSync(indexPath).size / 1024).toFixed(1)} KB`);
    console.log(`   📄 package.json: ${(fs.statSync(packagePath).size / 1024).toFixed(1)} KB`);
    
    return { indexPath, packagePath, deploymentDir };
}

async function deployToAppwrite(files) {
    console.log('\n🚀 Deploying to Appwrite Functions...');
    
    const indexContent = fs.readFileSync(files.indexPath);
    const packageContent = fs.readFileSync(files.packagePath);
    
    const boundary = '----WebKitFormBoundary' + Date.now();
    
    // Create multipart form data
    let body = '';
    
    // Add index.html
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="code"; filename="index.html"\r\n';
    body += 'Content-Type: text/html\r\n\r\n';
    body += indexContent.toString() + '\r\n';
    
    // Add package.json
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="package"; filename="package.json"\r\n';
    body += 'Content-Type: application/json\r\n\r\n';
    body += packageContent.toString() + '\r\n';
    
    // Add entrypoint
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="entrypoint"\r\n\r\n';
    body += 'index.html\r\n';
    
    // Add activate flag
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="activate"\r\n\r\n';
    body += 'true\r\n';
    
    body += '--' + boundary + '--\r\n';
    
    const bodyBuffer = Buffer.from(body);
    
    const options = {
        hostname: config.endpoint,
        port: 443,
        path: `/v1/functions/${config.siteId}/deployments`,
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': bodyBuffer.length,
            'X-Appwrite-Project': config.projectId,
            'X-Appwrite-Key': config.apiKey,
            'User-Agent': 'Claude-Code-Remote-Direct-Deploy/1.0'
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`📊 HTTP Status: ${res.statusCode}`);
                
                try {
                    const response = JSON.parse(data);
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log('✅ Deployment successful!');
                        console.log(`🆔 Deployment ID: ${response.$id || 'unknown'}`);
                        console.log(`🌐 Site URL: https://${config.siteId}.appwrite.network`);
                        resolve(response);
                    } else {
                        console.log('❌ Deployment failed');
                        console.log(`📄 Response: ${JSON.stringify(response, null, 2)}`);
                        reject(new Error(`Deployment failed: ${res.statusCode} ${response.message || 'Unknown error'}`));
                    }
                } catch (e) {
                    console.log(`📄 Raw response: ${data}`);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log('✅ Deployment successful! (Non-JSON response)');
                        resolve({ success: true });
                    } else {
                        reject(new Error(`Deployment failed: ${res.statusCode}`));
                    }
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Request error:', error.message);
            reject(error);
        });
        
        req.write(bodyBuffer);
        req.end();
    });
}

async function main() {
    try {
        const files = await createDeploymentPackage();
        const result = await deployToAppwrite(files);
        
        console.log('\n🎉 Deployment completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   🎯 Site: ${config.siteId}`);
        console.log(`   🌐 URL: https://${config.siteId}.appwrite.network`);
        console.log(`   📦 Project: ${config.projectId}`);
        console.log(`   ⚡ Method: Direct deployment (no GitHub secrets)`);
        
        console.log('\n✨ Your Claude Code Remote interface is now live!');
        
    } catch (error) {
        console.log('\n❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

main();