import { useState, useEffect } from 'react';
import { account } from '../lib/appwrite';
import Head from 'next/head';

export default function Home() {
  const [status, setStatus] = useState('Checking connection...');
  const [isConnected, setIsConnected] = useState(false);

  const testConnection = async () => {
    try {
      setStatus('Testing Appwrite connection...');
      await account.get();
      setStatus('✅ Connected to Appwrite successfully!');
      setIsConnected(true);
    } catch (error) {
      if (error.code === 401) {
        setStatus('✅ Appwrite connection established (not logged in)');
        setIsConnected(true);
      } else {
        setStatus(`❌ Connection failed: ${error.message}`);
        setIsConnected(false);
      }
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <>
      <Head>
        <title>Claude Code Remote - Control Center</title>
        <meta name="description" content="Control Claude Code remotely via multiple messaging platforms" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        {/* Navigation */}
        <nav className="bg-white/10 backdrop-blur-md p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🤖</span>
              <span className="text-xl font-bold">Claude Code Remote</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="hover:text-blue-200 transition-colors">Features</a>
              <a href="#platforms" className="hover:text-blue-200 transition-colors">Platforms</a>
              <a href="#setup" className="hover:text-blue-200 transition-colors">Setup</a>
              <a href="https://github.com/JessyTsui/Claude-Code-Remote" className="hover:text-blue-200 transition-colors">GitHub</a>
              <a href="/login" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">Sign In</a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Control Claude Code from Anywhere
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Send commands remotely, receive instant notifications, and manage your AI assistant 
              through your favorite messaging platforms
            </p>
            
            {/* Connection Status */}
            <div className="mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                  <span className="font-medium">{status}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={testConnection}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                🚀 Test Connection
              </button>
              <a 
                href="https://github.com/JessyTsui/Claude-Code-Remote" 
                className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                ⭐ Star on GitHub
              </a>
            </div>
          </div>

          {/* Features Grid */}
          <section id="features" className="mb-16">
            <h2 className="text-4xl font-bold text-center mb-12">Powerful Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2">Multi-Platform Support</h3>
                <p className="opacity-80">Works with Email, Telegram, Discord, LINE, and desktop notifications</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold mb-2">Two-Way Communication</h3>
                <p className="opacity-80">Send commands and receive responses through natural conversation</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
                <p className="opacity-80">Get instant notifications when Claude completes tasks or needs input</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="opacity-80">End-to-end encryption with whitelist verification for all platforms</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                <p className="opacity-80">Support for group chats and team workspaces</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-colors">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Execution Tracking</h3>
                <p className="opacity-80">Full terminal output capture and command history</p>
              </div>
            </div>
          </section>

          {/* Platforms Section */}
          <section id="platforms" className="mb-16">
            <h2 className="text-4xl font-bold text-center mb-12">Supported Platforms</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: "📧", name: "Email", desc: "SMTP/IMAP" },
                { icon: "📱", name: "Telegram", desc: "Bot API" },
                { icon: "💬", name: "Discord", desc: "Webhooks" },
                { icon: "💚", name: "LINE", desc: "Messaging API" },
                { icon: "🖥️", name: "Desktop", desc: "Native Notifications" },
                { icon: "🌐", name: "Web API", desc: "REST/WebSocket" }
              ].map((platform, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center hover:bg-white/20 transition-colors">
                  <div className="text-3xl mb-2">{platform.icon}</div>
                  <div className="font-semibold">{platform.name}</div>
                  <div className="text-sm opacity-70">{platform.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Setup Section */}
          <section id="setup" className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-4xl font-bold text-center mb-8">Quick Setup</h2>
            <p className="text-center text-xl mb-8 opacity-90">Get started in under 5 minutes</p>
            <div className="bg-black rounded-lg p-6 overflow-x-auto">
              <pre className="text-green-400 font-mono text-sm">
{`# Clone the repository
git clone https://github.com/JessyTsui/Claude-Code-Remote.git
cd Claude-Code-Remote

# Install dependencies
npm install

# Configure your settings
cp .env.example .env
# Edit .env with your API credentials

# Start the daemon
npm run daemon:start

# Check status
npm run daemon:status`}
              </pre>
            </div>
            <div className="text-center mt-6">
              <a 
                href="https://github.com/JessyTsui/Claude-Code-Remote#readme" 
                className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                📚 View Full Documentation
              </a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-white/5 backdrop-blur-md mt-16 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="mb-4 opacity-80">Built with ❤️ by the Claude Code Remote Team</p>
            <div className="flex justify-center space-x-6">
              <a href="https://github.com/JessyTsui/Claude-Code-Remote" className="hover:text-blue-200 transition-colors">GitHub</a>
              <a href="https://github.com/JessyTsui/Claude-Code-Remote/issues" className="hover:text-blue-200 transition-colors">Issues</a>
              <a href="https://github.com/JessyTsui/Claude-Code-Remote/blob/main/LICENSE" className="hover:text-blue-200 transition-colors">License</a>
              <a href="https://twitter.com/Jiaxi_Cui" className="hover:text-blue-200 transition-colors">Twitter</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}