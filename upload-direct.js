const https = require('https');
const fs = require('fs');

const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const APPWRITE_PROJECT_ID = '68a4e3da0022f3e129d0';

console.log('📤 Uploading Claude Code Remote to Appwrite...');

const fileData = fs.readFileSync('index.html');

const data = JSON.stringify({
  fileId: 'remote-site',
  bucketId: 'super',
  permissions: ['*']
});

const options = {
  hostname: 'nyc.cloud.appwrite.io',
  path: '/v1/storage/buckets/super/files',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': APPWRITE_PROJECT_ID,
    'X-Appwrite-Key': APPWRITE_API_KEY
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', responseData);
    if (res.statusCode === 201) {
      const result = JSON.parse(responseData);
      console.log('✅ File uploaded successfully!');
      console.log('🔗 File ID:', result.$id);
      console.log('📍 URL: https://nyc.cloud.appwrite.io/v1/storage/buckets/super/files/' + result.$id + '/view?project=' + APPWRITE_PROJECT_ID);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
