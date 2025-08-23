import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import EasySSOButton from '../lib/EasySSOButton';
import { account } from '../lib/appwrite';

export default function Login() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      // Redirect to dashboard if already authenticated
      router.push('/dashboard');
    } catch (error) {
      // Not authenticated, show login page
      setLoading(false);
    }
  };

  const handleSSOSuccess = async (user) => {
    console.log('[Claude Code Remote] SSO authentication successful:', user);
    setUser(user);
    // Redirect to dashboard
    router.push('/dashboard');
  };

  const handleSSOError = (error) => {
    console.error('[Claude Code Remote] SSO authentication failed:', error);
    alert(`Authentication failed: ${error.message || 'Please try again.'}`);
  };

  const handleSignOut = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
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
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
            <p className="mb-6">You are already signed in as {user.email}</p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In - Claude Code Remote</title>
        <meta name="description" content="Sign in to access Claude Code Remote control panel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-2xl font-bold mb-2">Claude Code Remote</h1>
            <p className="text-white/80">Sign in to access your control panel</p>
          </div>

          {/* SSO Buttons */}
          <div className="space-y-3">
            <EasySSOButton
              provider="google"
              onSuccess={handleSSOSuccess}
              onError={handleSSOError}
              text="Sign in with Google"
              size="large"
              fullWidth={true}
              style="default"
            />
            <EasySSOButton
              provider="github"
              onSuccess={handleSSOSuccess}
              onError={handleSSOError}
              text="Sign in with GitHub"
              size="large"
              fullWidth={true}
              style="default"
            />
            <EasySSOButton
              provider="microsoft"
              onSuccess={handleSSOSuccess}
              onError={handleSSOError}
              text="Sign in with Microsoft"
              size="large"
              fullWidth={true}
              style="default"
            />
            <EasySSOButton
              provider="discord"
              onSuccess={handleSSOSuccess}
              onError={handleSSOError}
              text="Sign in with Discord"
              size="large"
              fullWidth={true}
              style="default"
            />
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-white/60 text-sm">
            <p>For developers who want remote access to Claude Code</p>
            <p className="mt-2">
              <a 
                href="/" 
                className="text-white/80 hover:text-white underline transition-colors"
              >
                ← Back to Home
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}