const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const APPWRITE_ENDPOINT = 'nyc.cloud.appwrite.io';
const APPWRITE_PROJECT_ID = '68a4e3da0022f3e129d0';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;

if (!APPWRITE_API_KEY) {
    console.error('Error: APPWRITE_API_KEY environment variable is not set');
    process.exit(1);
}

async function deployToSite() {
    console.log('Creating deployment archive...');
    
    await execAsync('mkdir -p dist && cp index.html dist/');
    await execAsync('tar -czf site.tar.gz dist/');
    
    console.log('Uploading to Appwrite...');
    
    const fileData = fs.readFileSync('site.tar.gz');
    const boundary = `----WebKitFormBoundary${Date.now()}`;
    
    const formData = [];
    formData.push(`--${boundary}`);
    formData.push('Content-Disposition: form-data; name="entrypoint"');
    formData.push('');
    formData.push('index.html');
    
    formData.push(`--${boundary}`);
    formData.push('Content-Disposition: form-data; name="code"; filename="site.tar.gz"');
    formData.push('Content-Type: application/gzip');
    formData.push('');
    
    const textData = formData.join('\r\n');
    const finalBoundary = `\r\n--${boundary}--\r\n`;
    
    const body = Buffer.concat([
        Buffer.from(textData + '\r\n'),
        fileData,
        Buffer.from(finalBoundary)
    ]);
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: APPWRITE_ENDPOINT,
            path: `/v1/functions/remote/deployments`,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length,
                'X-Appwrite-Project': APPWRITE_PROJECT_ID,
                'X-Appwrite-Key': APPWRITE_API_KEY
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log('Response status:', res.statusCode);
                console.log('Response:', data);
                if (res.statusCode === 201 || res.statusCode === 200 || res.statusCode === 202) {
                    console.log('Deployment initiated!');
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(data));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    try {
        console.log('Deploying Claude Code Remote...');
        console.log('Project:', APPWRITE_PROJECT_ID);
        
        await deployToSite();
        
        await execAsync('rm -f site.tar.gz');
        console.log('Done! Site will be available at: https://remote.appwrite.network');
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
