const { Client, Storage, ID } = require('node-appwrite');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68a4e3da0022f3e129d0';
const SITE_NAME = 'claude-code-remote';

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function createWebApp() {
  console.log('🚀 Creating Claude Code Remote web application...');
  
  // Enhanced web interface with interactive features
  const enhancedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Claude Code Remote - Control Claude Code remotely via Email, Telegram, Discord and more">
    <meta name="keywords" content="Claude Code, Remote Control, AI Assistant, Developer Tools">
    <title>Claude Code Remote - Control Center</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            --primary: #667eea;
            --primary-dark: #5a67d8;
            --secondary: #764ba2;
            --success: #48bb78;
            --warning: #ed8936;
            --danger: #f56565;
            --dark: #2d3748;
            --light: #f7fafc;
            --gray: #718096;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            min-height: 100vh;
            color: var(--dark);
        }
        
        .nav {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .nav-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        
        .nav-links a {
            color: var(--dark);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: var(--primary);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .hero {
            text-align: center;
            padding: 4rem 2rem;
            color: white;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            margin-bottom: 1rem;
            animation: fadeInUp 0.8s ease;
        }
        
        .hero p {
            font-size: 1.3rem;
            opacity: 0.95;
            max-width: 600px;
            margin: 0 auto 2rem;
            animation: fadeInUp 0.8s ease 0.2s backwards;
        }
        
        .hero-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            animation: fadeInUp 0.8s ease 0.4s backwards;
        }
        
        .btn {
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-primary {
            background: white;
            color: var(--primary);
        }
        
        .btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid white;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        .features {
            background: white;
            border-radius: 1rem;
            padding: 3rem;
            margin: 2rem 0;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .feature-card {
            padding: 2rem;
            background: var(--light);
            border-radius: 0.75rem;
            transition: all 0.3s;
            border: 2px solid transparent;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
        }
        
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            display: block;
        }
        
        .feature-title {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
            color: var(--dark);
        }
        
        .feature-desc {
            color: var(--gray);
            line-height: 1.6;
        }
        
        .platforms {
            background: white;
            border-radius: 1rem;
            padding: 3rem;
            margin: 2rem 0;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        
        .platform-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .platform-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            background: linear-gradient(135deg, #667eea15, #764ba215);
            border-radius: 0.75rem;
            border: 2px solid transparent;
            transition: all 0.3s;
        }
        
        .platform-item:hover {
            border-color: var(--primary);
            transform: scale(1.05);
        }
        
        .platform-icon {
            font-size: 2rem;
        }
        
        .platform-name {
            font-weight: 600;
            color: var(--dark);
        }
        
        .setup-section {
            background: var(--dark);
            color: white;
            border-radius: 1rem;
            padding: 3rem;
            margin: 2rem 0;
        }
        
        .code-block {
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin: 1.5rem 0;
            font-family: 'Monaco', 'Courier New', monospace;
            overflow-x: auto;
        }
        
        .code-block code {
            color: #61dafb;
            font-size: 0.95rem;
            line-height: 1.6;
        }
        
        .status-card {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--success);
            color: white;
            border-radius: 2rem;
            font-weight: 600;
        }
        
        .status-dot {
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .footer {
            background: white;
            padding: 2rem;
            text-align: center;
            margin-top: 4rem;
            border-radius: 1rem 1rem 0 0;
        }
        
        .footer-links {
            display: flex;
            gap: 2rem;
            justify-content: center;
            margin-top: 1rem;
        }
        
        .footer-links a {
            color: var(--gray);
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .footer-links a:hover {
            color: var(--primary);
        }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .nav-links { display: none; }
            .features-grid { grid-template-columns: 1fr; }
            .platform-list { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <nav class="nav">
        <div class="nav-content">
            <div class="logo">
                <span>🤖</span>
                <span>Claude Code Remote</span>
            </div>
            <ul class="nav-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#platforms">Platforms</a></li>
                <li><a href="#setup">Setup</a></li>
                <li><a href="https://github.com/JessyTsui/Claude-Code-Remote">GitHub</a></li>
            </ul>
        </div>
    </nav>

    <div class="container">
        <div class="hero">
            <h1>Control Claude Code from Anywhere</h1>
            <p>Send commands remotely, receive instant notifications, and manage your AI assistant through your favorite messaging platforms</p>
            <div class="hero-buttons">
                <a href="https://github.com/JessyTsui/Claude-Code-Remote" class="btn btn-primary">
                    <span>⭐</span> Star on GitHub
                </a>
                <a href="#setup" class="btn btn-secondary">
                    <span>🚀</span> Quick Start
                </a>
            </div>
        </div>

        <div class="status-card">
            <div class="status-indicator">
                <span class="status-dot"></span>
                <span>System Active</span>
            </div>
            <p style="margin-top: 1rem; color: var(--gray);">Claude Code Remote is ready for deployment</p>
        </div>

        <section id="features" class="features">
            <h2 style="text-align: center; font-size: 2rem; margin-bottom: 1rem;">Powerful Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <span class="feature-icon">📱</span>
                    <h3 class="feature-title">Multi-Platform Support</h3>
                    <p class="feature-desc">Works with Email, Telegram, Discord, LINE, and desktop notifications</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">🔄</span>
                    <h3 class="feature-title">Two-Way Communication</h3>
                    <p class="feature-desc">Send commands and receive responses through natural conversation</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">⚡</span>
                    <h3 class="feature-title">Real-Time Updates</h3>
                    <p class="feature-desc">Get instant notifications when Claude completes tasks or needs input</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">🔒</span>
                    <h3 class="feature-title">Secure & Private</h3>
                    <p class="feature-desc">End-to-end encryption with whitelist verification for all platforms</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">👥</span>
                    <h3 class="feature-title">Team Collaboration</h3>
                    <p class="feature-desc">Support for group chats and team workspaces</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">📊</span>
                    <h3 class="feature-title">Execution Tracking</h3>
                    <p class="feature-desc">Full terminal output capture and command history</p>
                </div>
            </div>
        </section>

        <section id="platforms" class="platforms">
            <h2 style="text-align: center; font-size: 2rem; margin-bottom: 1rem;">Supported Platforms</h2>
            <div class="platform-list">
                <div class="platform-item">
                    <span class="platform-icon">📧</span>
                    <div>
                        <div class="platform-name">Email</div>
                        <small style="color: var(--gray);">SMTP/IMAP</small>
                    </div>
                </div>
                <div class="platform-item">
                    <span class="platform-icon">📱</span>
                    <div>
                        <div class="platform-name">Telegram</div>
                        <small style="color: var(--gray);">Bot API</small>
                    </div>
                </div>
                <div class="platform-item">
                    <span class="platform-icon">💬</span>
                    <div>
                        <div class="platform-name">Discord</div>
                        <small style="color: var(--gray);">Webhooks</small>
                    </div>
                </div>
                <div class="platform-item">
                    <span class="platform-icon">💚</span>
                    <div>
                        <div class="platform-name">LINE</div>
                        <small style="color: var(--gray);">Messaging API</small>
                    </div>
                </div>
                <div class="platform-item">
                    <span class="platform-icon">🖥️</span>
                    <div>
                        <div class="platform-name">Desktop</div>
                        <small style="color: var(--gray);">Native Notifications</small>
                    </div>
                </div>
                <div class="platform-item">
                    <span class="platform-icon">🌐</span>
                    <div>
                        <div class="platform-name">Web API</div>
                        <small style="color: var(--gray);">REST/WebSocket</small>
                    </div>
                </div>
            </div>
        </section>

        <section id="setup" class="setup-section">
            <h2 style="text-align: center; font-size: 2rem; margin-bottom: 1rem;">Quick Setup</h2>
            <p style="text-align: center; opacity: 0.9; margin-bottom: 2rem;">Get started in under 5 minutes</p>
            <div class="code-block">
                <code>
# Clone the repository<br>
git clone https://github.com/JessyTsui/Claude-Code-Remote.git<br>
cd Claude-Code-Remote<br><br>

# Install dependencies<br>
npm install<br><br>

# Configure your settings<br>
cp .env.example .env<br>
# Edit .env with your API credentials<br><br>

# Start the daemon<br>
npm run daemon:start<br><br>

# Check status<br>
npm run daemon:status
                </code>
            </div>
            <div style="text-align: center; margin-top: 2rem;">
                <a href="https://github.com/JessyTsui/Claude-Code-Remote#readme" class="btn btn-primary">
                    📚 View Full Documentation
                </a>
            </div>
        </section>

        <footer class="footer">
            <p style="color: var(--gray);">Built with ❤️ by the Claude Code Remote Team</p>
            <div class="footer-links">
                <a href="https://github.com/JessyTsui/Claude-Code-Remote">GitHub</a>
                <a href="https://github.com/JessyTsui/Claude-Code-Remote/issues">Issues</a>
                <a href="https://github.com/JessyTsui/Claude-Code-Remote/blob/main/LICENSE">License</a>
                <a href="https://twitter.com/Jiaxi_Cui">Twitter</a>
            </div>
        </footer>
    </div>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Add animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.feature-card, .platform-item').forEach(el => {
            observer.observe(el);
        });

        // Add dynamic status check (mock for static site)
        setTimeout(() => {
            const statusDot = document.querySelector('.status-dot');
            if (statusDot) {
                statusDot.style.background = '#48bb78';
            }
        }, 2000);

        console.log('🚀 Claude Code Remote - Ready for deployment to Appwrite Sites');
    </script>
</body>
</html>`;

  // Write the enhanced HTML
  fs.writeFileSync('index-enhanced.html', enhancedHTML);
  console.log('✅ Created enhanced web interface');

  return enhancedHTML;
}

async function deployToAppwrite() {
  try {
    console.log('🎯 Deploying Claude Code Remote to Appwrite Sites...');
    console.log('📍 Project:', APPWRITE_PROJECT_ID);
    console.log('🌐 Endpoint:', APPWRITE_ENDPOINT);

    // Create the web app
    await createWebApp();

    // Create deployment package
    const deploymentFiles = [
      'index-enhanced.html',
      'README.md',
      'LICENSE'
    ];

    // Copy assets if they exist
    if (fs.existsSync('assets')) {
      execSync('cp -r assets deployment-temp/');
    }

    // Create a simple package.json for Appwrite Sites
    const packageJson = {
      name: 'claude-code-remote-web',
      version: '1.0.0',
      description: 'Claude Code Remote - Web Interface',
      scripts: {
        build: 'echo "Static site, no build needed"'
      }
    };

    fs.writeFileSync('package-site.json', JSON.stringify(packageJson, null, 2));

    // Create deployment directory
    if (!fs.existsSync('site-deploy')) {
      fs.mkdirSync('site-deploy');
    }

    // Copy files to deployment directory
    fs.copyFileSync('index-enhanced.html', 'site-deploy/index.html');
    fs.copyFileSync('package-site.json', 'site-deploy/package.json');
    
    // Copy README if exists
    if (fs.existsSync('README.md')) {
      fs.copyFileSync('README.md', 'site-deploy/README.md');
    }

    // Copy assets directory if exists
    if (fs.existsSync('assets')) {
      if (!fs.existsSync('site-deploy/assets')) {
        fs.mkdirSync('site-deploy/assets');
      }
      const assets = fs.readdirSync('assets');
      assets.forEach(file => {
        fs.copyFileSync(path.join('assets', file), path.join('site-deploy/assets', file));
      });
    }

    console.log('📦 Created deployment package in site-deploy/');

    // Try to deploy using Storage as a fallback
    console.log('📤 Attempting to upload to Appwrite Storage...');
    
    const htmlBuffer = fs.readFileSync('index-enhanced.html');
    const file = await storage.createFile(
      'claude-remote',
      ID.unique(),
      htmlBuffer,
      ['*']
    );

    console.log('✅ Successfully uploaded to Appwrite Storage!');
    console.log('🔗 Access URL:', `${APPWRITE_ENDPOINT}/storage/buckets/claude-remote/files/${file.$id}/view?project=${APPWRITE_PROJECT_ID}`);

    // Instructions for manual deployment
    console.log('\n📋 For full Appwrite Sites deployment:');
    console.log('1. Go to Appwrite Console > Hosting > Sites');
    console.log('2. Create new site with name: claude-code-remote');
    console.log('3. Upload the site-deploy/ directory');
    console.log('4. Your site will be available at: https://claude-code-remote.appwrite.network');

    // Create GitHub Actions workflow for automatic deployment
    const workflowContent = `name: Deploy Claude Code Remote to Appwrite

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Build site
      run: |
        npm install
        cp index.html site-deploy/index.html || cp index-enhanced.html site-deploy/index.html
        cp -r assets site-deploy/ || true
    
    - name: Deploy to Appwrite
      env:
        APPWRITE_API_KEY: \${{ secrets.APPWRITE_API_KEY }}
      run: |
        npm install -g appwrite-cli
        appwrite client --endpoint ${APPWRITE_ENDPOINT} \\
          --projectId ${APPWRITE_PROJECT_ID} \\
          --key \$APPWRITE_API_KEY
        
        cd site-deploy
        appwrite storage create-bucket --bucketId claude-remote --name "Claude Code Remote"
        appwrite storage create-file --bucketId claude-remote --fileId unique() --file index.html
`;

    fs.writeFileSync('.github/workflows/deploy-claude-remote.yml', workflowContent);
    console.log('✅ Created GitHub Actions workflow for automatic deployment');

    console.log('\n🎉 Claude Code Remote web interface is ready for deployment!');
    console.log('📁 Deployment package created in: site-deploy/');
    console.log('🚀 Next steps:');
    console.log('   1. Review the site in site-deploy/index.html');
    console.log('   2. Push to GitHub to trigger automatic deployment');
    console.log('   3. Or manually deploy via Appwrite Console');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY environment variable is required');
    console.log('💡 Set it with: export APPWRITE_API_KEY="your-api-key"');
    process.exit(1);
  }
  
  deployToAppwrite();
}

module.exports = { deployToAppwrite };