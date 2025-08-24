#!/usr/bin/env node

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for environment variable
if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ Error: APPWRITE_API_KEY environment variable is not set');
    console.log('\n📝 To set the environment variable:');
    console.log('   Windows (PowerShell):');
    console.log('   $env:APPWRITE_API_KEY = "your-api-key-here"');
    console.log('\n   Windows (Command Prompt):');
    console.log('   set APPWRITE_API_KEY=your-api-key-here');
    console.log('\n   Linux/Mac:');
    console.log('   export APPWRITE_API_KEY="your-api-key-here"');
    console.log('\nThen run this script again.');
    process.exit(1);
}

// Configuration from environment
const config = {
    apiKey: process.env.APPWRITE_API_KEY,
    projectId: process.env.APPWRITE_PROJECT_ID || '68a4e3da0022f3e129d0',
    endpoint: process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
};

console.log('🚀 Deploying Claude Code Remote Chat Interface');
console.log('📍 Project ID:', config.projectId);
console.log('🔐 Using API key from environment variable');

// Read the index.html file
const indexPath = path.join(__dirname, 'appwrite-deployment', 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error('❌ Error: index.html not found at', indexPath);
    process.exit(1);
}

const fileData = fs.readFileSync(indexPath);
const boundary = '----WebKitFormBoundary' + Date.now();

// Build multipart form data
let body = '';
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="entrypoint"\r\n\r\n';
body += 'index.html\r\n';
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="activate"\r\n\r\n';
body += 'true\r\n';
body += '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="code"; filename="index.html"\r\n';
body += 'Content-Type: text/html\r\n\r\n';

const bodyBuffer = Buffer.concat([
    Buffer.from(body),
    fileData,
    Buffer.from('\r\n--' + boundary + '--\r\n')
]);

// Try multiple deployment targets
const deploymentTargets = [
    { path: '/v1/functions/remote/deployments', name: 'remote function' },
    { path: '/v1/functions/super-site/deployments', name: 'super-site function' },
    { path: '/v1/sites/remote/deployments', name: 'remote site' },
    { path: '/v1/sites/super-site/deployments', name: 'super-site' }
];

let deploymentSuccessful = false;

async function tryDeployment(target) {
    return new Promise((resolve) => {
        console.log(`\n🎯 Attempting deployment to ${target.name}...`);
        
        const options = {
            hostname: 'nyc.cloud.appwrite.io',
            port: 443,
            path: target.path,
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'Content-Length': bodyBuffer.length,
                'X-Appwrite-Project': config.projectId,
                'X-Appwrite-Key': config.apiKey
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`   Status: ${res.statusCode}`);
                
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`   ✅ Deployment to ${target.name} successful!`);
                    deploymentSuccessful = true;
                    
                    // Parse response for deployment ID
                    try {
                        const result = JSON.parse(data);
                        if (result.$id) {
                            console.log(`   📋 Deployment ID: ${result.$id}`);
                        }
                    } catch (e) {
                        // Response might not be JSON
                    }
                    
                    // Show success URLs based on target
                    if (target.name.includes('remote')) {
                        console.log('   🌐 URL: https://remote.appwrite.network');
                    } else if (target.name.includes('super')) {
                        console.log('   🌐 URL: https://super.appwrite.network');
                    }
                    
                    resolve(true);
                } else {
                    console.log(`   ❌ Deployment to ${target.name} failed`);
                    if (res.statusCode === 401) {
                        console.log('   🔐 Authentication error - check API key permissions');
                    } else if (res.statusCode === 404) {
                        console.log('   📂 Target not found - may need to create it first');
                    }
                    
                    // Show error details
                    try {
                        const error = JSON.parse(data);
                        console.log(`   Error: ${error.message}`);
                    } catch (e) {
                        console.log(`   Response: ${data}`);
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

// Try all deployment targets
async function deployToAll() {
    for (const target of deploymentTargets) {
        const success = await tryDeployment(target);
        if (success) {
            break; // Stop on first successful deployment
        }
    }
    
    if (deploymentSuccessful) {
        console.log('\n🎉 Claude Code Remote Chat Interface deployed successfully!');
        console.log('📱 Features available:');
        console.log('   • Multi-console management with WebSocket connections');
        console.log('   • Real-time chat interface with typing indicators');
        console.log('   • Console connection management (add/disconnect)');
        console.log('   • Quick action buttons for common commands');
        console.log('   • Message history persistence with localStorage');
        console.log('   • Demo mode with simulated Claude responses');
    } else {
        console.log('\n❌ All deployment attempts failed');
        console.log('\n🔧 Troubleshooting tips:');
        console.log('   1. Verify API key has necessary permissions (functions.write or sites.write)');
        console.log('   2. Check if project ID is correct');
        console.log('   3. Ensure the function/site exists in Appwrite Console');
        console.log('   4. Try creating the deployment target manually in Appwrite Console first');
    }
}

// Start deployment
deployToAll();