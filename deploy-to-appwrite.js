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

async function createSite() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            name: 'remote',
            hostname: 'remote.appwrite.network'
        });

        const options = {
            hostname: APPWRITE_ENDPOINT,
            path: `/v1/project/platforms/sites`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'X-Appwrite-Project': APPWRITE_PROJECT_ID,
                'X-Appwrite-Key': APPWRITE_API_KEY
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                if (res.statusCode === 201 || res.statusCode === 200) {
                    const site = JSON.parse(responseData);
                    console.log('Site created/found:', site.hostname);
                    resolve(site);
                } else if (res.statusCode === 409) {
                    console.log('Site already exists, using existing site...');
                    resolve({ $id: 'remote', hostname: 'remote.appwrite.network' });
                } else {
                    console.error('Failed to create site:', res.statusCode, responseData);
                    reject(new Error(responseData));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function createDeployment(siteId) {
    console.log('Creating tar.gz archive...');
    
    await execAsync('mkdir -p dist && cp index.html dist/');
    await execAsync('tar -czf site.tar.gz dist/');
    
    console.log('Uploading deployment...');
    
    const fileData = fs.readFileSync('site.tar.gz');
    
    return new Promise((resolve, reject) => {
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
        
        const options = {
            hostname: APPWRITE_ENDPOINT,
            path: `/v1/project/platforms/sites/${siteId}/deployments`,
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': body.length,
                'X-Appwrite-Project': APPWRITE_PROJECT_ID,
                'X-Appwrite-Key': APPWRITE_API_KEY
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                if (res.statusCode === 201 || res.statusCode === 200) {
                    const deployment = JSON.parse(responseData);
                    console.log('Deployment created:', deployment.$id);
                    resolve(deployment);
                } else {
                    console.error('Failed to create deployment:', res.statusCode, responseData);
                    reject(new Error(responseData));
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
        console.log('Starting Appwrite Sites deployment...');
        console.log('Project:', APPWRITE_PROJECT_ID);
        console.log('Hostname: remote.appwrite.network');
        
        const site = await createSite();
        console.log('Using site ID:', site.$id);
        
        const deployment = await createDeployment(site.$id);
        
        console.log('\nDeployment successful!');
        console.log('Your site will be available at: https://remote.appwrite.network');
        console.log('Please wait a few moments for the deployment to propagate.');
        
        await execAsync('rm -f site.tar.gz');
        
    } catch (error) {
        console.error('Deployment failed:', error.message);
        process.exit(1);
    }
}

main();
