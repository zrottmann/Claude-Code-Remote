import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { account } from '../lib/appwrite';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      // Not authenticated, redirect to login
      router.push('/login');
      return;
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await account.deleteSession('current');
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - Claude Code Remote</title>
        <meta name="description" content="Claude Code Remote control panel" />
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
            <div className="flex items-center space-x-4">
              <span className="hidden md:block text-white/80">
                Welcome, {user?.name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-white/80">Control your Claude Code Remote connections</p>
          </div>

          {/* User Info Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Account Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-1">Name</label>
                <p className="text-lg">{user?.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-1">Email</label>
                <p className="text-lg">{user?.email}</p>
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-1">User ID</label>
                <p className="text-sm font-mono text-white/80">{user?.$id}</p>
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-1">Verified</label>
                <p className="text-lg">
                  {user?.emailVerification ? (
                    <span className="text-green-300">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-300">⚠ Not verified</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Remote Control Features */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Remote Control Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-3xl mb-2">📧</div>
                <h3 className="text-lg font-semibold mb-2">Email Control</h3>
                <p className="text-white/70 text-sm">Send commands via email</p>
                <div className="mt-3">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Available</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-3xl mb-2">💬</div>
                <h3 className="text-lg font-semibold mb-2">Telegram Bot</h3>
                <p className="text-white/70 text-sm">Control via Telegram messages</p>
                <div className="mt-3">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Available</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-3xl mb-2">📱</div>
                <h3 className="text-lg font-semibold mb-2">LINE Bot</h3>
                <p className="text-white/70 text-sm">Send commands via LINE</p>
                <div className="mt-3">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Available</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-3xl mb-2">🖥️</div>
                <h3 className="text-lg font-semibold mb-2">Desktop Control</h3>
                <p className="text-white/70 text-sm">Local desktop integration</p>
                <div className="mt-3">
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Available</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-3xl mb-2">📋</div>
                <h3 className="text-lg font-semibold mb-2">Clipboard Sync</h3>
                <p className="text-white/70 text-sm">Sync clipboard content</p>
                <div className="mt-3">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">Pro Feature</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="text-lg font-semibold mb-2">Smart Automation</h3>
                <p className="text-white/70 text-sm">Intelligent command routing</p>
                <div className="mt-3">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">Pro Feature</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg transition-colors text-left">
                <div className="text-2xl mb-2">🔧</div>
                <div className="font-semibold">Configure Channels</div>
                <div className="text-sm text-blue-100">Setup messaging platforms</div>
              </button>
              
              <button className="bg-green-600 hover:bg-green-700 p-4 rounded-lg transition-colors text-left">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold">View Logs</div>
                <div className="text-sm text-green-100">Check activity history</div>
              </button>
              
              <button className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg transition-colors text-left">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-semibold">Settings</div>
                <div className="text-sm text-purple-100">Manage preferences</div>
              </button>
              
              <button className="bg-orange-600 hover:bg-orange-700 p-4 rounded-lg transition-colors text-left">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-semibold">Documentation</div>
                <div className="text-sm text-orange-100">Learn how to use</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}